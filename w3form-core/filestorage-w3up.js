import { FileStorage } from './filestorage.js'

/**
 * @typedef {import('@web3-storage/w3up-client').Client} W3upClient
 */

/**
 * @implements {FileStorage}
 */
export class FileStorageW3up {
  /**
   * @param {W3upClient|Promise<W3upClient>} w3up
   */
  static async create(w3up) {
    return new FileStorageW3up(await w3up)
  }
  /**
   * @param {W3upClient} w3up
   */
  constructor(w3up) {
    this.w3up = w3up
  }
  /**
   * @type {FileStorage['get']}
   */
  get = async (k) => {
    throw new Error('todo')
  }
  /**
   * @type {FileStorage['set']}
   * @param {object} [options]
   * @param {unknown} [options.authorization]
   */
  set = async (k, v, options={}) => {
    if (options.authorization) {
      console.log('w3up.addSpace for set option authorization', options.authorization)
      // @ts-expect-error unknown vs required Delegation. Only pass this a UCAN..
      await this.w3up.addSpace(options.authorization)
    }
    const file = await v
    const link = await this.w3up.uploadFile(file)
  }
  /**
   * @type {FileStorage['has']}
   */
  has = async (k) => {
    throw new Error('todo')
  }
  /**
   * @type {FileStorage['size']}
   */
  get size() {
    return new Promise((resolve, reject) => {
      Promise.resolve().then(async () => {
        const list = await this.w3up.capability.upload.list()
        return list.size
      }).then(resolve).catch(reject)
    })
  }
}
