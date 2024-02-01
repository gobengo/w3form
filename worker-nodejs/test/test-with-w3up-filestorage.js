import { test } from 'node:test'
import { W3FormWorker } from '../src/worker-nodejs.js'
import { serve } from '@hono/node-server'
import { getAddressUrl } from '../src/web.js'
import { FileStorageW3up } from '../src/filestorage-w3up.js'
import { readPackageJson } from '../src/fs-nodejs.js'
import * as w3up from '@web3-storage/w3up-client'
import * as ed25519 from '@ucanto/principal/ed25519'
import assert from 'node:assert'
import { StoreMemory } from '@web3-storage/w3up-client/stores'
import { CID } from 'multiformats/cid'
import { base64 } from 'multiformats/bases/base64'
import { identity } from 'multiformats/hashes/identity'
import { CarReader } from '@ipld/car'
import { importDAG } from '@ucanto/core/delegation'

async function getW3Client() {
  assert.ok(process.env.W3_PRINCIPAL, 'process.env has W3_PRINCIPAL')
  assert.ok(process.env.W3_PROOF, 'process.env has W3_PROOF')
  const principal = ed25519.parse(process.env.W3_PRINCIPAL)
  const store = new StoreMemory
  const w3 = await w3up.create({ principal, store })
  w3.addSpace(await parseW3Proof(process.env.W3_PROOF))
  return w3
}

await test('can use w3form with w3up', async () => {
  const w3 = await getW3Client()
  const files = await FileStorageW3up.create(w3)
  const w3form = W3FormWorker.create({ files })
  const server = serve({ ...w3form, port: 0 })
  await new Promise((resolve) => server.addListener('listening', resolve))
  try { await testServer(getAddressUrl(server.address())) }
  finally { server.close() }
  /** @param {URL} url */
  async function testServer(url) {
    console.log('testServer', url.toString())
    const packageJson = readPackageJson()
    const formData = new FormData()
    formData.append('file', packageJson)
    const response = await fetch(new Request(url, {
      method: 'post',
      body: formData
    }))
    console.log('response', response)
  }
})

/**
 * @param {string} proof
 */
async function parseW3Proof(proof) {
  let cid
  try {
    cid = CID.parse(proof, base64)
  } catch (/** @type {any} */ err) {
    if (err?.message?.includes('Unexpected end of data')) {
      console.error(`Error: failed to read proof. The string has been truncated.`)
    }
    throw err
  }

  if (cid.multihash.code !== identity.code) {
    console.error(`Error: failed to read proof. Must be identity CID. Fetching of remote proof CARs not supported by this command yet`)
    process.exit(1)
  }
  const delegation = await readProofFromBytes(cid.multihash.digest)
  return delegation
}

/**
 * @param {Uint8Array} bytes Path to the proof file.
 */
export async function readProofFromBytes(bytes) {
  const blocks = []
  try {
    const reader = await CarReader.fromBytes(bytes)
    for await (const block of reader.blocks()) {
      blocks.push(block)
    }
  } catch (/** @type {any} */ err) {
    console.error(`Error: failed to parse proof: ${err.message}`)
    throw err
  }
  try {
    // @ts-expect-error
    return importDAG(blocks)
  } catch (/** @type {any} */ err) {
    console.error(`Error: failed to import proof: ${err.message}`)
    throw err
  }
}
