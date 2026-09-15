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
  server: {
    proxy: {
      // Vite cannot execute PHP, and its SPA fallback answers /api/anything.php
      // with index.html. A front-end calling the API in `npm run dev` therefore
      // gets a page of HTML where it expected JSON, and reports a mystery
      // failure — which is a confusing way to discover there is no backend.
      //
      // So point /api at a PHP server running the same public/ directory:
      //     npm run dev:api        (in a second terminal)
      //
      // Deployment is unaffected: on the real host, PHP serves these files
      // directly and this proxy does not exist.
      '/api': {
        // Matches the port in the `dev:api` script. Change both together if
        // 8000 is taken.
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure(proxy) {
          // Without this, a stopped PHP server surfaces as an empty 500 and the
          // page says "something went wrong" again. Say the actual thing.
          proxy.on('error', (err, req, res) => {
            if (!res || res.headersSent) return
            res.writeHead(502, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              error: 'The local PHP API is not running. Start it with `npm run dev:api` in a second terminal.',
              code: 'api_down',
            }))
          })
        },
      },
    },
  },
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
