import { test } from 'node:test'
import { W3FormWorker } from '../src/worker-nodejs.js'
import { serve } from '@hono/node-server'
import { getAddressUrl } from '../src/web.js'
import { FileStorageW3up } from '../src/filestorage-w3up.js'
import { readPackageJson } from '../src/fs-nodejs.js'
import * as w3up from '@web3-storage/w3up-client'
import * as ed25519 from '@ucanto/principal/ed25519'
import assert from 'node:assert'

await test('can use w3form with w3up', async () => {
  assert.ok(process.env.W3_PRINCIPAL, 'process.env has W3_PRINCIPAL')
  const principal = ed25519.parse(process.env.W3_PRINCIPAL)
  const w3 = await w3up.create({ principal })
  console.log('w3 spaces', w3.spaces())
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
