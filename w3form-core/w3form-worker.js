import { Hono } from "hono"
import { FileStorage, FileStorageMap } from "./filestorage.js"
import { createDelegationFromCar } from "./ucan.js"

export class W3FormWorkerOptions {
  /**
   * identifier of the worker.
   * e.g. if this is a DID, clients can issue UCANs to it.
   * @type {string|undefined}
   */
  id
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
        <h1>w3form</h1>
        ${this.#options.id ? `
        <dl>
          <dt>id</dt>
          <dd>${this.#options.id}</dd>
        </dl>
        ` : ''}
        <form
          enctype="multipart/form-data"
          method="post"
          >
          <dl>
            <dt>file to upload</dt><dd><input name="file" type="file" /></dd>
          ${this.#options.id ? `
            <dt>authorization (e.g. UCAN)</dt><dd><input name="authorization" type="file" /></dd>
          ` : ''}
          <input type="submit" />
        </form>
      `
      return newResponse(html, 200, {
        'content-type': 'text/html',
      })
    })
    app.post('/', async ({ newResponse, req }) => {
      const body = await req.parseBody()
      let authorization;
      if (body.authorization) {
        // this is a special field name that will never be passed along
        if (body.authorization instanceof File) {
          authorization = await createDelegationFromCar(body.authorization.stream())
        } else {
          console.warn('got authorization field, but with unsupported value', body.authorization)
        }
      }
      try {
        for (const [fieldName, fieldValue] of Object.entries(body)) {
          switch (fieldName) {
            case "authorization":
              // this is a special field name that will never be passed along
              break;
            default:
              if (fieldValue instanceof File) {
                await this.#options.files.set(fieldName, Promise.resolve(fieldValue), { authorization })
              }
          }
        }
      } catch (error) {
        if (String(error).match(/missing current space/)) {
          console.warn('unable to upload file for form submission', error)
          return newResponse(
            'w3form server has no space configured. Cant upload. Provide space authorization in the request, or run w3form with W3_PROOF.',
            500
          )
        }
        throw error
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

/** @param {string} s */
function escapeHTML(s) { 
  return s.replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
}
