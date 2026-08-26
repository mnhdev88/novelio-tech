// ─────────────────────────────────────────────────────────────────────────────
// Build-time codegen from /content.
//
// Runs BEFORE `vite build`, because both outputs live in public/ and vite copies
// public/ into dist/ verbatim:
//
//   public/sitemap.xml      blog entries regenerated from content/blog/
//   public/api/_pricing.php server-side price table regenerated from pricing.json
//
// Why this exists: the admin panel writes only content/*.json. Without this step
// a post created in the panel would never appear in the sitemap — and prerender.mjs
// discovers its routes FROM the sitemap, so the post would ship as an empty SPA
// shell with no prerendered HTML, no meta tags and no schema. Likewise a price
// edited in the panel would change the page but not what the customer is charged.
//
// Both files stay committed in git. This overwrites them on every build, so a
// stale copy in the repo is harmless; keeping them tracked means a build that
// skips this step still ships something valid rather than nothing.
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CONTENT = path.join(ROOT, 'content')
const BASE = 'https://www.noveliotech.com'

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))

// ── Which posts are actually live ────────────────────────────────────────────
// Mirrors the publish/schedule logic in src/data/siteData.js. Both resolve at
// BUILD time from the same index, so the sitemap can never list a post the app
// won't render (or omit one it will).
const now = new Date()
const index = readJson(path.join(CONTENT, 'blog/index.json'))

const livePosts = index
  .filter((e) => {
    if (e.status === 'draft') return false
    if (e.status === 'scheduled') return !!e.publishAt && new Date(e.publishAt) <= now
    return true
  })
  .map((e) => {
    const file = path.join(CONTENT, 'blog', `${e.slug}.json`)
    if (!fs.existsSync(file)) {
      console.warn(`[gen-derived] blog/index.json lists "${e.slug}" but ${e.slug}.json is missing — skipping`)
      return null
    }
    return readJson(file)
  })
  .filter(Boolean)

// ── sitemap.xml ──────────────────────────────────────────────────────────────
// Only the /blog/<slug> entries are regenerated. The other ~43 URLs (services,
// locations, industries, comparisons) come from source code and route data, not
// from content/, so they are carried across verbatim — regenerating them from a
// guess is how routes silently disappear from a sitemap.
function lastmodFor(post) {
  const graph = post.schema?.['@graph'] || []
  const article = graph.find((n) => n['@type'] === 'Article') || {}
  const raw = article.dateModified || article.datePublished || post.date
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? new Date().toISOString().slice(0, 10) : d.toISOString().slice(0, 10)
}

const sitemapPath = path.join(ROOT, 'public/sitemap.xml')
const original = fs.readFileSync(sitemapPath, 'utf8')

const isPost = (block) => /<loc>[^<]*\/blog\/[^<]+<\/loc>/.test(block)

const blogBlocks = livePosts.map((post) => `  <url>
    <loc>${BASE}/blog/${post.slug}</loc>
    <lastmod>${lastmodFor(post)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`)

// Edit the file as text rather than rebuilding it from parsed blocks: the
// sitemap carries hand-written section comments ("<!-- Local landing pages -->")
// between the <url> entries, and reassembling from blocks alone silently eats them.
// So: cut out the existing post entries in place, then splice the regenerated
// ones back in exactly where the first one was.
let out = ''
let cursor = 0
let insertAt = null
for (const m of original.matchAll(/[ \t]*<url>[\s\S]*?<\/url>\n?/g)) {
  if (!isPost(m[0])) continue
  out += original.slice(cursor, m.index)
  if (insertAt === null) insertAt = out.length
  cursor = m.index + m[0].length
}
out += original.slice(cursor)

// No posts in the sitemap yet (first run on a fresh sitemap): put them before </urlset>.
if (insertAt === null) insertAt = out.lastIndexOf('</urlset>')

fs.writeFileSync(sitemapPath, out.slice(0, insertAt) + blogBlocks.join('') + out.slice(insertAt))

const urlCount = (fs.readFileSync(sitemapPath, 'utf8').match(/<url>/g) || []).length
console.log(`[gen-derived] sitemap.xml — ${urlCount} URLs (${blogBlocks.length} blog posts)`)

// ── content/seo/routes.json ──────────────────────────────────────────────────
// The list of editable pages shown in the panel's "Pages & SEO" section, taken
// from the sitemap so it can never drift from what is actually published.
// Read-only to the panel — it edits seo/pages.json, which is keyed by these paths.
const routes = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => {
    try { return new URL(m[1]).pathname.replace(/\/+$/, '') || '/' } catch { return null }
  })
  .filter(Boolean)

fs.writeFileSync(
  path.join(CONTENT, 'seo/routes.json'),
  JSON.stringify([...new Set(routes)], null, 2) + '\n'
)
console.log(`[gen-derived] seo/routes.json — ${new Set(routes).size} routes`)

// ── public/api/_pricing.php ──────────────────────────────────────────────────
// The server recomputes every charge from this table so a tampered browser can't
// change what it pays. Keeping it generated is what stops the panel from editing
// the displayed price while the charged price silently stays put.
const pricing = readJson(path.join(CONTENT, 'pricing.json'))

const php = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const pad = (arr) => Math.max(...arr.map((x) => x.length))

// Column alignment is preserved because this file is read by humans when a price
// dispute comes up — a wall of ragged arrays is where a wrong number hides.
// Each cell already carries its own trailing comma, so cells are joined with a
// space, never with ', ' (that is what produced `'name' => 'Free',,`).
const planKeyW  = pad(pricing.plans.map((p) => `'${p.id}'`))
const planNameW = pad(pricing.plans.map((p) => `'${php(p.name)}',`))
const planMonW  = pad(pricing.plans.map((p) => `'monthly' => ${p.priceMonthly},`))

const planLines = pricing.plans.map((p) => {
  const cells = [
    `'name' => ${`'${php(p.name)}',`.padEnd(planNameW)}`,
    `${`'monthly' => ${p.priceMonthly},`.padEnd(planMonW)}`,
    `'yearly' => ${p.priceYearly}`,
  ]
  const tail = []
  if (p.yearlyTotal !== undefined) tail.push(`'yearly_total' => ${p.yearlyTotal}`)
  if (p.upfrontMonths !== undefined) tail.push(`'upfront_months' => ${p.upfrontMonths}`)

  const body = cells.join(' ') + (tail.length ? ', ' + tail.join(', ') : '')
  return `    ${`'${p.id}'`.padEnd(planKeyW)} => [${body}],`
}).join('\n')

const addonKeyW  = pad(pricing.addons.map((a) => `'${a.id}'`))
const addonNameW = pad(pricing.addons.map((a) => `'${php(a.name)}',`)) + 2
const addonLines = pricing.addons.map((a) =>
  `    ${`'${a.id}'`.padEnd(addonKeyW)} => ['name' => ${`'${php(a.name)}',`.padEnd(addonNameW)}'price' => ${a.price}],`
).join('\n')

fs.writeFileSync(path.join(ROOT, 'public/api/_pricing.php'), `<?php
// ─────────────────────────────────────────────────────────────────────────────
// GENERATED FILE — DO NOT EDIT BY HAND.
// Written by scripts/gen-derived.mjs from content/pricing.json on every build.
// Edit prices in the admin panel (or content/pricing.json); this file follows.
//
// SINGLE SOURCE OF TRUTH for server-side pricing. Shared by BOTH payment
// integrations (paypal/ and payoneer/) so a price can never differ between
// gateways, and so the amount charged can never be set by the browser.
//
// Never web-served directly (leading-underscore files are denied in .htaccess,
// and it holds no secrets — only the public price list). Included server-side.
//
// Plan fields:
//   monthly        per-month price on the monthly option
//   yearly         per-month equivalent of the yearly price (display only)
//   yearly_total   flat one-payment price for 12 months. When present it is the
//                  authoritative yearly charge — do NOT compute monthly * 12.
//   upfront_months months collected at checkout on the monthly option; the
//                  remaining (12 - upfront_months) are billed later.
// ─────────────────────────────────────────────────────────────────────────────

$GLOBALS['NOVELIO_PLANS'] = [
${planLines}
];

$GLOBALS['NOVELIO_ADDONS'] = [
${addonLines}
];
`)
console.log(`[gen-derived] _pricing.php — ${pricing.plans.length} plans, ${pricing.addons.length} add-ons`)
