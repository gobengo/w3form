import { describe, it } from 'node:test'
import worker from "./worker-nodejs.js"
import assert from 'assert'
import consumers from 'stream/consumers'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'

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
})

/**
 * @param {import('net').AddressInfo|null|string} address
 */
function getAddressUrl(address) {
  if ( ! address) throw new Error(`address must not be null`)
  if (typeof address === 'string') throw new Error(`address must not be string, but is "${address}"`)
  return new URL(`http://localhost:${address.port}`)
}
