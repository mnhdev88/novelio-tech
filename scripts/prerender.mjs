// Post-build prerenderer.
// Boots `vite preview`, visits every route in public/sitemap.xml with a headless
// browser (reduced-motion emulated so framer-motion renders its final state), then
// writes the fully-rendered HTML to dist/<route>/index.html. This makes every route
// crawler- and AI-visible without changing the app's client-side architecture.
//
// Vercel serves these static files before applying the SPA rewrite in vercel.json,
// so prerendered pages win while unknown paths still fall back to the SPA shell.

import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const PORT = 4319
const ORIGIN = `http://localhost:${PORT}`

// ── Collect routes from the sitemap ───────────────────────────────────────────
function routesFromSitemap() {
  const xml = fs.readFileSync(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const paths = new Set()
  for (const loc of locs) {
    let p
    try { p = new URL(loc).pathname } catch { continue }
    p = p.replace(/\/+$/, '') || '/'
    // Skip routes that already ship as hand-authored static HTML in dist
    const existing = path.join(DIST, p, 'index.html')
    if (p !== '/' && fs.existsSync(existing)) continue
    paths.add(p)
  }
  return [...paths]
}

// ── Wait for the preview server to accept connections ─────────────────────────
async function waitForServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return true
    } catch { /* not up yet */ }
    await sleep(500)
  }
  throw new Error(`preview server did not start at ${url}`)
}

// react-helmet-async appends per-route head tags AFTER the static defaults that
// already live in index.html, producing duplicate title/description/canonical/OG tags.
// Helmet's (correct, per-route) tag is always the last of each kind, so we keep the
// last occurrence of every singleton/keyed head tag and drop the earlier static ones.
// Scoped to <head> so SVG <title> elements in the body are never touched.
function dedupeHead(html) {
  const m = html.match(/(<head[^>]*>)([\s\S]*?)(<\/head>)/i)
  if (!m) return html
  let head = m[2]
  const keyers = [
    { re: /<title[^>]*>[\s\S]*?<\/title>/gi, key: () => 'title' },
    { re: /<meta\s+name="description"[^>]*>/gi, key: () => 'description' },
    { re: /<link\s+[^>]*rel="canonical"[^>]*>/gi, key: () => 'canonical' },
    { re: /<meta\s+name="keywords"[^>]*>/gi, key: () => 'keywords' },
    { re: /<meta\s+name="robots"[^>]*>/gi, key: () => 'robots' },
    { re: /<meta\s+property="(og:[a-zA-Z:]+)"[^>]*>/gi, key: (m2) => m2[1] },
    { re: /<meta\s+name="(twitter:[a-zA-Z:]+)"[^>]*>/gi, key: (m2) => m2[1] },
  ]
  for (const { re, key } of keyers) {
    const matches = [...head.matchAll(re)]
    const groups = new Map()
    for (const mm of matches) {
      const k = key(mm)
      if (!groups.has(k)) groups.set(k, [])
      groups.get(k).push(mm[0])
    }
    for (const arr of groups.values()) {
      for (let i = 0; i < arr.length - 1; i++) head = head.replace(arr[i], '')
    }
  }
  return html.replace(m[0], () => m[1] + head + m[3])
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0
      const step = 600
      const timer = setInterval(() => {
        window.scrollBy(0, step)
        total += step
        if (total >= document.body.scrollHeight + 1000) {
          clearInterval(timer)
          window.scrollTo(0, 0)
          resolve()
        }
      }, 60)
    })
  })
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('dist/index.html missing — run `vite build` first')
  }

  const routes = routesFromSitemap()
  console.log(`[prerender] ${routes.length} routes to render`)

  // Start vite preview (SPA fallback serves the shell for each route)
  const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  })

  let browser
  try {
    await waitForServer(ORIGIN)
    // On constrained/shared Linux hosts, puppeteer's bundled Chromium often can't run
    // (missing system libs, tiny /dev/shm). Allow pointing at a system/installed Chromium
    // via PUPPETEER_EXECUTABLE_PATH, and pass the flags such hosts need.
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    })

    const rendered = []
    for (const route of routes) {
      const page = await browser.newPage()
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
      await page.setViewport({ width: 1366, height: 1200 })
      await page.goto(`${ORIGIN}${route}`, { waitUntil: 'networkidle0', timeout: 45000 })
      // Wait until React has populated #root and a real <h1> (or article) exists
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root')
          return root && root.children.length > 0 &&
            (document.querySelector('h1, article, main') !== null)
        },
        { timeout: 20000 },
      ).catch(() => console.warn(`[prerender] ${route}: content check timed out, capturing anyway`))
      await autoScroll(page)
      await sleep(250)
      const html = '<!DOCTYPE html>\n' + dedupeHead(await page.evaluate(() => document.documentElement.outerHTML))
      rendered.push({ route, html })
      await page.close()
      console.log(`[prerender] ✓ ${route}`)
    }

    for (const { route, html } of rendered) {
      const dir = route === '/' ? DIST : path.join(DIST, route)
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8')
    }
    console.log(`[prerender] wrote ${rendered.length} static HTML files`)
  } finally {
    if (browser) await browser.close()
    preview.kill()
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err)
  process.exit(1)
})
