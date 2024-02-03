import { fileURLToPath } from "url"
import { serve } from '@hono/node-server'
import {W3FormWorker} from 'w3form-core'
import { getW3upClient } from "w3form-core/w3up"
import { FileStorageW3up } from "../../w3form-core/filestorage-w3up.js"

async function main() {
  // @ts-expect-error process.env has weird type
  const {w3up, principal} = await getW3upClient(process.env)
  const files = await FileStorageW3up.create(w3up)
  serve({
    ...W3FormWorker.create({
      files,
      id: principal.did(),
    }),
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 0,
    hostname: process.env.HTTP_HOSTNAME || undefined,
  }, (info) => {
    console.warn(`http://localhost:${info.port}`)
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
