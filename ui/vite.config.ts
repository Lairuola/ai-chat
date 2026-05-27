import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          markdown: ['react-markdown', 'rehype-highlight'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
