import { readFileSync } from "fs"
import { basename } from "path"
import { fileURLToPath } from "url"

/**
 * @param {URL} fileUrl
 * @param {string} [type]
 */
export const read = (fileUrl, type) => new File(
  [new Blob([readFileSync(fileURLToPath(fileUrl))])],
  basename(fileUrl.toString()),
  { type }
)
export const readPackageJson = () => read(
  new URL('../package.json', import.meta.url),
  'application/json',
)
