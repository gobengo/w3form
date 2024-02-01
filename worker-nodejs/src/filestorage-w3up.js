import { FileStorage } from './filestorage.js'

/**
 * @typedef {import('@web3-storage/w3up-client').Client} W3upClient
 */

/**
 * @implements {FileStorage}
 */
export class FileStorageW3up {
  /**
   * @param {W3upClient} w3up
   */
  static async create(w3up) {
    return new FileStorageW3up(w3up)
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
   */
  set = async (k, v) => {
    const file = await v
    const link = await this.w3up.uploadFile(file)
    console.log('uploaded file', { file, link })
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
