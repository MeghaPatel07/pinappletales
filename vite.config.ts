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
    // Split, not merged: the admin pulls in Jodit, whose stylesheet is larger
    // than the entire public site's. One combined file would put it on every
    // visitor's critical path. With splitting, the public pages keep a single
    // <link> in the prerendered HTML and the admin's CSS arrives with its own
    // lazily-loaded chunk.
    cssCodeSplit: true,
    reportCompressedSize: false,
    // Chunking is left to the bundler on purpose. The admin is reached through
    // a single dynamic import, so its dependencies — Firebase, Jodit,
    // DOMPurify — already land in async chunks that no public page requests.
    // Naming them manually instead promotes them to shared chunks, which makes
    // the entry reference (and preload) them on every page.
  },
})
