import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from "hono"
import { fileURLToPath } from 'url'

class Worker {
  static create() {
    return new Worker
  }
  /**
   * @param {Request} request 
   */
  fetch = async(request) => {
    const app = new Hono()
    app.get('/', async ({ newResponse }) => {
      return newResponse('', 200)
    })
    app.post('/', async ({ newResponse, req }) => {
      const bodyText = await req.text()
      return newResponse(bodyText, 201)
    })
    app.get('*', serveStatic({
      // serveStatic doesn't let this be an abs path
      root: 'dist/public/'
    }))
    return app.fetch(request)
  }
}

export default Worker

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve({
    fetch: Worker.create().fetch,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 0,
    hostname: process.env.HTTP_HOSTNAME || undefined,
  }, (info) => {
    console.warn(`http://localhost:${info.port}`)
  })  
}
