import { serve } from '@hono/node-server'
import { fileURLToPath } from 'url'
import { W3FormWorker } from 'w3form-core'

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve({
    ...W3FormWorker.create(),
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 0,
    hostname: process.env.HTTP_HOSTNAME || undefined,
  }, (info) => {
    console.warn(`http://localhost:${info.port}`)
  })  
}
