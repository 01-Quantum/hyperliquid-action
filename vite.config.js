import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/hyperliquid-action/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lpcalc: resolve(__dirname, 'lp-calc.html'),
        deploy: resolve(__dirname, 'deploy.html'),
      },
    },
  },
})
