/* eslint-disable semi */
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default {
  root: resolve(__dirname, './'),
  build: {
    outDir: 'dist',
  },
  server: {
    port: 8080,
  },
}
