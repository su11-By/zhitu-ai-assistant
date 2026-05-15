import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,vue}'],
      exclude: [
        'src/main.js',
        'src/App.vue',
        'src/router/**',
        'src/components/**',
        'src/stores/creation.js',
        'src/stores/tasks.js',
        'src/stores/toast.js',
        'src/stores/vector.js',
        'src/stores/auth.js',
        'src/stores/settings.js',
        'src/stores/knowledge.js',
        'src/utils/demoData.js',
        'src/utils/crypto.js',
        'src/services/fileParser.js',
        'src/services/chunker.js',
        'src/services/contextManager.js',
        'src/services/ragService.js',
        'src/services/parsers/**'
      ]
    }
  }
})
