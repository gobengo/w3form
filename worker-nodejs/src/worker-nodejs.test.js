import { describe, it } from 'node:test'
import worker from "./worker-nodejs.js"
import assert from 'assert'
import consumers from 'stream/consumers'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { ReadableStream } from 'stream/web'

await describe('worker-nodejs', async () => {

  await it('responds to http', async () => {
    const server = await serve({
      ...worker,
      port: 0,
    })
    await new Promise((resolve) => {
      server.addListener('listening', () => resolve(undefined))
    });
    try {
      const serverUrl = getAddressUrl(server.address())
      const response = await worker.fetch(new Request(serverUrl))
      assert.equal(response.status, 200)
    } finally {
      server.close()
    }
  })

  await it('responds 201 to sending form over http', async () => {
    const server = serve({ ...worker, port: 0, })
    await new Promise((resolve) => { server.addListener('listening', () => resolve(undefined)) });
    try {
      const serverUrl = getAddressUrl(server.address())
      /** @param {number} size */
      const readZeros = (size) => {
        let remaining = size
        /** @type {ReadableStream<Uint8Array>} */
        const stream = new ReadableStream({
          async pull(controller) {
            if (remaining <= 0) {
              controller.close()
              return;
            }
            controller.enqueue(new TextEncoder().encode('0'))
            remaining--
          }
        })
        return new Response(stream).blob()
      }
      const formData = new FormData
      formData.append('file', await readZeros(4))
      const formRequest = new Request(serverUrl, {
        method: 'post',
        body: formData,
      })
      const response = await worker.fetch(formRequest)
      assert.equal(response.status, 201)
      const responseText = await response.text()
      assert.ok(responseText.includes('0000'))
    } finally {
      server.close()
    }
  })
})

/**
 * @param {import('net').AddressInfo|null|string} address
 */
function getAddressUrl(address) {
  if (!address) throw new Error(`address must not be null`)
  if (typeof address === 'string') throw new Error(`address must not be string, but is "${address}"`)
  return new URL(`http://localhost:${address.port}`)
}
