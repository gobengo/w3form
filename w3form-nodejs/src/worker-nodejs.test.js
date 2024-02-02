import { describe, it } from 'node:test'
import Worker from "./worker-nodejs.js"
import assert from 'assert'
import consumers from 'stream/consumers'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { ReadableStream } from 'stream/web'
import { createReadStream, readFile, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { getAddressUrl } from './web.js'
import { FileStorageMap } from '../../w3form-core/filestorage.js'
import { readPackageJson } from './fs-nodejs.js'

await describe('worker-nodejs', async () => {

  await it('responds to http', async () => {
    const server = serve({
      ...Worker.create(),
      port: 0,
    })
    await new Promise((resolve) => {
      server.addListener('listening', () => resolve(undefined))
    });
    try {
      const serverUrl = getAddressUrl(server.address())
      const response = await fetch(new Request(serverUrl))
      assert.equal(response.status, 200)
    } finally {
      server.close()
    }
  })

  await it('responds 201 to sending form over http', async () => {
    const files = FileStorageMap.create()
    const server = serve({ ...Worker.create({ files }), port: 0, })
    await new Promise((resolve) => { server.addListener('listening', () => resolve(undefined)) });
    try {
      const serverUrl = getAddressUrl(server.address())
      const formData = new FormData
      formData.append('file1', readPackageJson())
      formData.append('file2', readPackageJson())
      const formRequest = new Request(serverUrl, {
        method: 'post',
        body: formData,
      })
      const response = await fetch(formRequest)
      assert.equal(response.status, 201)
      assert.equal(await files.size, 2, 'FileStorage size reflects stored file')
    } finally {
      server.close()
    }
  })
})
