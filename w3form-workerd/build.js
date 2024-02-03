import path from 'path'
import { fileURLToPath } from 'url'
import { build } from 'esbuild'
import esbuildPluginW3up from 'esbuild-plugin-w3up-client-wasm-import'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

console.log('building worker...')

await build({
  entryPoints: [path.join(__dirname, 'src/worker.js')],
  bundle: true,
  format: 'esm',
  outfile: path.join(__dirname, 'dist', 'worker.js'),
  plugins: [
    esbuildPluginW3up()
  ],
  sourcemap: 'external',
  allowOverwrite: true,
})
