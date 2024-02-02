import { serve } from '@hono/node-server'
import { Hono } from "hono"
import { fileURLToPath } from 'url'
import { FileStorage, FileStorageMap } from '../../w3form-core/filestorage.js'

class W3FormWorkerOptions {
  /** @type {FileStorage} */
  files = FileStorageMap.create()
}

export class W3FormWorker {
  /**
   * @param {W3FormWorkerOptions} [options]
   */
  static create(options=new W3FormWorkerOptions) {
    return new W3FormWorker(options)
  }
  /**
   * @param {W3FormWorkerOptions} options 
   */
  constructor(options) {
    this.#options = options
  }
  /** @type {W3FormWorkerOptions} */
  #options
  /**
   * @param {Request} request 
   */
  fetch = async(request) => {
    const app = new Hono()
    app.get('/', async ({ newResponse }) => {
      const html = `
        <!doctype html>
        <form
          enctype="multipart/form-data"
          method="post"
          >
          <input name="file" type="file" />
          <input type="submit" />
        </form>
      `
      return newResponse(html, 200, {
        'content-type': 'text/html',
      })
    })
    app.post('/', async ({ newResponse, req }) => {
      const body = await req.parseBody()
      for (const [fieldName, fieldValue] of Object.entries(body)) {
        if (fieldValue instanceof File) {
          await this.#options.files.set(fieldName, Promise.resolve(fieldValue))
        }
      }
      /**
       * @param {File|string} file
       * @returns 
       */
      function renderFile(file) {
        if (typeof file === 'string') {
          return `<pre>${escapeHTML(file)}</pre>`
        }
        return `
        <dl>
        <dt>name</dt><dd>${file.name}</dd>
        <dt>size</dt><dd>${file.size}</dd>
        <dt>type</dt><dd>${file.type}</dd>
        <dt>lastModified</dt><dd>${new Date(file.lastModified).toLocaleString()}</dd>
        </dl>
        `
      }
      const html = `
      <!doctype html>
      <dl>
        ${Object.entries(body).map(([k,f]) => {
          /** @param {File|string} fileOrString */
          const renderFileOrString = (fileOrString) => {
            return renderFile(fileOrString)
          }
          /** @param {(string|File)[]} fileOrStringList */
          const renderFileOrStringList = (fileOrStringList) => {
            return `<ul>
            ${fileOrStringList.map(f => {
              const rendered = renderFileOrString(f)
              return `<li>${rendered}</li>`
            })}
            </ul>`
            return 
          }
          if (Array.isArray(f)) {
            return renderFileOrStringList(f)
          }
          return renderFileOrString(f)
        }).join('\n')}
      </dl>
      `
      return newResponse(html, 201, {
        'content-type': 'text/html',
      })
    })
    return app.fetch(request)
  }
}

export default W3FormWorker

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  serve({
    ...W3FormWorker.create(),
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 0,
    hostname: process.env.HTTP_HOSTNAME || undefined,
  }, (info) => {
    console.warn(`http://localhost:${info.port}`)
  })  
}

/** @param {string} s */
function escapeHTML(s) { 
  return s.replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
}