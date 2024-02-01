import { test } from 'node:test'
import { W3FormWorker } from '../src/worker-nodejs.js'
import { serve } from '@hono/node-server'
import { getAddressUrl } from '../src/web.js'
import { FileStorageW3up } from '../src/filestorage-w3up.js'
import { readPackageJson } from '../src/fs-nodejs.js'
import * as w3up from '@web3-storage/w3up-client'

await test('can use w3form with w3up', async () => {
  const w3 = await w3up.create()
  const space = await w3.createSpace(`test-${new Date().toISOString()}`);
  await space.save()
  w3.setCurrentSpace(space.did())
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
    const response = await fetch(url, {
      method: 'post',
      body: formData
    })
    console.log('response', response)
  }
})
