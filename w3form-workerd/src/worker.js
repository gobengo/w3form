import {W3FormWorker, FileStorageW3up} from 'w3form-core'
import { getW3upClient } from "w3form-core/w3up"

export default {
  /**
   * @param {Request} request 
   * @param {*} env 
   * @param {*} ctx 
   */
  async fetch(request, env, ctx) {
    if ( ! env.W3_PRINCIPAL) {
      console.warn('no W3_PRINCIPAL in env. We will generating a new ed25519 and use that. But it wont have any authorizations.')
    }
    if ( ! env.W3_PROOF) {
      console.warn('no W3_PROOF in env. Unless passed in each request, this worker will have no authorizations to write to w3up.')
    }
    console.log('worker fetch', {
      url: request.url,
      meethod: request.method,
    })
    const { w3up, principal } = await getW3upClient(env)
    const worker = W3FormWorker.create({
      id: principal.did(),
      files: await FileStorageW3up.create(w3up)
    })
    return worker.fetch(request)
  }
}
