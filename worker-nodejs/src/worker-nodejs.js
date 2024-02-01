import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from "hono"
import { fileURLToPath } from 'url'

const app = new Hono()
app.get('/', async ({ newResponse }) => {
  return newResponse('', 200)
})
app.get('*', serveStatic({
  // serveStatic doesn't let this be an abs path
  root: 'dist/public/'
}))
export default app

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve({
    ...app,
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 0,
    hostname: process.env.HTTP_HOSTNAME || undefined,
  }, (info) => {
    console.warn(`http://localhost:${info.port}`)
  })  
}
