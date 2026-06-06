import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Static prerendering is handled as a post-build step, not a Vite plugin:
//   npm run build:prerender   (vite build && node scripts/prerender.mjs)
// The crawler in scripts/prerender.mjs renders every sitemap route with headless
// Chromium and writes dist/<route>/index.html, making the SPA crawler-visible.

// Serves any public/<slug>/index.html file before Vite's SPA fallback intercepts it
const staticHtmlPlugin = {
  name: 'serve-public-html',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url || '').split('?')[0].replace(/\/$/, '')
      if (!url || url === '') return next()
      const filePath = path.join(process.cwd(), 'public', url, 'index.html')
      if (fs.existsSync(filePath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        fs.createReadStream(filePath).pipe(res)
        return
      }
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), staticHtmlPlugin],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('lucide-react') || id.includes('react-icons')) return 'vendor-icons';
          if (id.includes('react-helmet-async')) return 'vendor-helmet';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('react-router-dom')) return 'vendor-react';
        },
      },
    },
  },
})
