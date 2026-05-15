import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api/v1': {
        target: 'http://127.0.0.1:1234/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '')
      },
      '/search': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '/fetch': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  }
})
