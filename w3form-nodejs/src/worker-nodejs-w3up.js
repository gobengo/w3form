import { fileURLToPath } from "url"
import { serve } from '@hono/node-server'
import w3form from './worker-nodejs.js'
import { getW3upClient } from "./w3up.js"
import { FileStorageW3up } from "../../w3form-core/filestorage-w3up.js"

async function main() {
  const w3up = await getW3upClient()
  const files = await FileStorageW3up.create(w3up)
  serve({
    ...w3form.create({ files }),
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 0,
    hostname: process.env.HTTP_HOSTNAME || undefined,
  }, (info) => {
    console.warn(`http://localhost:${info.port}`)
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
