import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Dynamic import for prerender (optional — install vite-plugin-prerender to enable)
let prerenderPlugin = null
try {
  const { default: prerender } = await import('vite-plugin-prerender')
  prerenderPlugin = prerender({
    staticDir: path.join(process.cwd(), 'dist'),
    routes: [
      '/', '/about', '/services', '/contact', '/blog',
      '/services/website-seo', '/services/google-business',
      '/services/lead-generation', '/services/automation',
      '/services/branding', '/services/tech-ops',
      '/services/email-marketing', '/services/email-validator',
      '/blog/seo-trends-2025', '/blog/high-converting-landing-page',
      '/blog/google-ads-small-business', '/blog/social-media-algorithm-2025',
      '/blog/wordpress-vs-react', '/blog/email-marketing-best-practices',
    ],
  })
} catch {
  // vite-plugin-prerender not installed — run: npm install vite-plugin-prerender --save-dev
}

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
  plugins: [react(), staticHtmlPlugin, prerenderPlugin].filter(Boolean),
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
