// One-shot Phase-1 migration: siteData.js -> content/*.json
//
// Reads the current hand-authored siteData.js and writes the same data out as
// structured JSON that the admin panel can safely rewrite. Run once; after
// src/data/siteData.js becomes a loader this script is dead weight, but it is
// kept so the migration is reproducible/auditable from git history.
//
//   node scripts/extract-content.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CONTENT = path.join(ROOT, 'content')

// Windows: a bare 'd:\...' path is not a valid ESM specifier.
const src = await import(pathToFileURL(path.join(ROOT, 'src/data/siteData.js')).href)

// lucide component refs can't be serialized; store the display name instead.
// The loader maps it back through its own ICON_MAP.
const iconName = (icon) => {
  if (typeof icon === 'string') return icon
  const n = icon?.displayName || icon?.name || icon?.render?.displayName
  if (!n) throw new Error(`cannot resolve icon name for ${String(icon)}`)
  return n
}

const write = (rel, data) => {
  const file = path.join(CONTENT, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
  return rel
}

const written = []
const put = (rel, data) => written.push(write(rel, data))

// ── Singletons ───────────────────────────────────────────────────────────────
put('settings.json', src.COMPANY)
put('stats.json', src.STATS)
put('services.json', src.SERVICES)
put('testimonials.json', src.TESTIMONIALS)
put('team.json', src.TEAM)
put('process.json', src.PROCESS_STEPS)
put('industries.json', src.INDUSTRIES.map((i) => ({ ...i, icon: iconName(i.icon) })))
put('pricing.json', {
  plans: src.PRICING_PLANS,
  comparison: src.PRICING_COMPARISON,
  addons: src.PRICING_ADDONS,
  faq: src.PRICING_FAQ,
})

// ── Blog: one file per post + an index that owns ordering ────────────────────
// Ordering lives in the index so the panel can reorder/unpublish without
// rewriting every post file (and so two editors touching two posts don't conflict).
for (const post of src.BLOG_POSTS) put(`blog/${post.slug}.json`, post)
put('blog/index.json', src.BLOG_POSTS.map((p) => ({
  slug: p.slug,
  id: p.id,
  status: 'published',   // published | draft | scheduled
  publishAt: null,
})))

console.log(`wrote ${written.length} files to content/`)
for (const w of written.slice(0, 12)) console.log('  ' + w)
if (written.length > 12) console.log(`  ... +${written.length - 12} more`)
