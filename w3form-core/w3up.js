import * as W3UP from '@web3-storage/w3up-client'
import * as ed25519 from '@ucanto/principal/ed25519'
import { StoreMemory } from "@web3-storage/access/stores/store-memory";
import { CID } from 'multiformats/cid'
import { base64 } from 'multiformats/bases/base64'
import { identity } from 'multiformats/hashes/identity'
import { CarReader } from '@ipld/car'
import { importDAG } from '@ucanto/core/delegation'

/**
 * @param {object} env
 * @param {string|undefined} [env.W3_PRINCIPAL]
 * @param {string|undefined} [env.W3_PROOF]
 */
export async function getW3upClient({ W3_PRINCIPAL, W3_PROOF }={}) {
  const principal = W3_PRINCIPAL ? ed25519.parse(W3_PRINCIPAL) : await ed25519.generate()
  const store = new StoreMemory
  const w3up = await W3UP.create({ principal, store })
  if (W3_PROOF) {
    await w3up.addSpace(await parseW3Proof(W3_PROOF))
  }
  return { w3up, store, principal }
}

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
