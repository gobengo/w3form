export class FileStorage {
  /** @returns {Promise<number>} */
  get size() {
    return Promise.reject(new Error('not implemented'))
  }
  /**
   * @param {string} k 
   * @returns {Promise<boolean>}
   */
  async has(k) { throw new Error('not implemented ')}
  /**
   * @param {string} k 
   * @returns {Promise<File|undefined>}
   */
  async get(k) { throw new Error('not implemented ')}
  /**
   * @param {string} k 
   * @param {Promise<File>} f
   * @param {object} [options]
   * @param {unknown} [options.authorization]
   */
  async set(k, f, options) { throw new Error('not implemented ')}
  /** @private */
  constructor() {}
}

/**
 * @implements {FileStorage}
 */
export class FileStorageMap {
  static create() { return FileStorageMap.from(new Map) }
  /**
   * @param {Map<string, Promise<File|undefined>>} map 
   */
  static from (map) {
    return new FileStorageMap(map)
  }
  /**
   * @param {Map<string, Promise<File|undefined>>} map  
   */
  constructor(map) {
    this.map = map
  }
  /**
   * @param {string} k 
   */
  async get(k) {
    const got = await this.map.get(k)
    return got
  }
  /** @type {FileStorage['set']} */
  async set(k, v) {
    await Promise.resolve(this.map.set(k, v))
  }
  /** @type {FileStorage['has']} */
  async has(k) {
    return await Promise.resolve(this.map.has(k))
  }
  get size() {
    return Promise.resolve(this.map.size)
  }
}
