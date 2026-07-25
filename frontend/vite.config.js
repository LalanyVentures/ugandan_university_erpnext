import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_FRAPPE_URL || 'https://erp-university.jdd.arthlabs.space',
        changeOrigin: true,
        secure: false,
      },
      '/assets': {
        target: process.env.VITE_FRAPPE_URL || 'https://erp-university.jdd.arthlabs.space',
        changeOrigin: true,
        secure: false,
      },
      '/files': {
        target: process.env.VITE_FRAPPE_URL || 'https://erp-university.jdd.arthlabs.space',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: '../ugandan_university_education/public/frontend',
    emptyOutDir: true,
    target: 'es2018',
  },
})
