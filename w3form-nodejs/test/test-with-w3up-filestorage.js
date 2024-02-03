import { test } from 'node:test'
import { serve } from '@hono/node-server'
import { getAddressUrl } from '../src/web.js'
import { FileStorageW3up } from '../../w3form-core/filestorage-w3up.js'
import { readPackageJson } from '../src/fs-nodejs.js'
import assert from 'node:assert'
import { W3FormWorker } from 'w3form-core'
import { getW3upClient } from 'w3form-core/w3up'

await test('can use w3form with w3up', async () => {
  const {w3up, principal} = await getW3upClient()
  const files = await FileStorageW3up.create(w3up)
  const w3form = W3FormWorker.create({ files, id: principal.did(), })
  const server = serve({ ...w3form, port: 0 })
  await new Promise((resolve) => server.addListener('listening', resolve))
  try { await testServer(getAddressUrl(server.address())) }
  finally { server.close() }
  /** @param {URL} url */
  async function testServer(url) {
    const packageJson = readPackageJson()
    const formData = new FormData()
    formData.append('file', packageJson)
    const response = await fetch(new Request(url, {
      method: 'post',
      body: formData
    }))
    assert.equal(response.status, 201)
    assert.equal(await files.size, 1)
  }
})
