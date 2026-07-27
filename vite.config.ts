import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
  server: {
    // Build output lives inside the project root. Without this the dev server
    // watches (and can end up serving) freshly built files from dist/, which
    // mixes a stale document with a newer bundle.
    watch: {
      ignored: ['**/dist/**', '**/dist-ssr/**'],
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
})
