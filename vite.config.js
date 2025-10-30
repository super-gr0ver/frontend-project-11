/* eslint-disable semi */
import { resolve } from 'path'

export default {
  root: resolve(__dirname, './'),
  build: {
    outDir: 'dist',
  },
  server: {
    port: 8080,
  },
};
