import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      hmr: {
        overlay: false
      },
      proxy: {
        '/api/v1': {
          target: env.VITE_LM_STUDIO_URL || 'http://127.0.0.1:1234/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1/, '')
        },
        '/api': {
          target: env.VITE_SEARCH_SERVER || 'http://127.0.0.1:3004',
          changeOrigin: true
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'pdf-worker': ['pdfjs-dist'],
            'docx-parser': ['mammoth'],
            'markdown': ['marked', 'dompurify']
          }
        }
      }
    }
  }
})
