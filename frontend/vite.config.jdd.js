import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

function relativePublicAssets() {
  return {
    name: 'jdd-relative-public-assets',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('/src/') && !id.includes('\\src\\')) return null
      const transformed = code
        .replaceAll('"/awu-logo.png"', '"./awu-logo.png"')
        .replaceAll("'/awu-logo.png'", "'./awu-logo.png'")
      return transformed === code ? null : { code: transformed, map: null }
    },
    transformIndexHtml(html) {
      return html.replace(
        '/assets/ugandan_university_education/awu-logo.png',
        './awu-logo.png',
      )
    },
  }
}

export default defineConfig({
  plugins: [relativePublicAssets(), react()],
  resolve: { alias: { '@': path.resolve(process.cwd(), 'src') } },
  base: './',
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2018' },
})
