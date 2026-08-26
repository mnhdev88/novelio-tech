// Round-trip every real blog post through the editor's block model.
//
// This is the test that has to pass before the panel is allowed near the 12
// hand-authored posts: opening a post in the editor and saving it without
// touching anything must not change one byte of its HTML. Run it in a real
// browser because the parser depends on DOMParser, exactly as it will in the panel.
//
//   node scripts/test-blockmodel.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const source = fs.readFileSync(path.join(ROOT, 'src/admin/blog/blockModel.js'), 'utf8')
  .replace(/^export /gm, '')   // inline it as a plain script

const posts = fs.readdirSync(path.join(ROOT, 'content/blog'))
  .filter((f) => f.endsWith('.json') && f !== 'index.json')
  .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'content/blog', f), 'utf8')))

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setContent('<!doctype html><html><body></body></html>')
await page.evaluate(source)

const results = await page.evaluate((posts) => posts.map((p) => {
  try {
    const parsed = parseBody(p.content)
    const out = serializeBody(parsed)
    const norm = (s) => String(s).replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim()
    // Baseline = the browser's own re-serialization, so entity normalisation
    // (&middot; -> ·) is not mistaken for the block model losing content.
    const d = new DOMParser().parseFromString('<div id="__b">' + p.content + '</div>', 'text/html')
    const baseline = d.getElementById('__b').innerHTML
    const counts = {}
    for (const b of parsed.blocks) counts[b.type] = (counts[b.type] || 0) + 1
    return {
      slug: p.slug,
      lossless: parsed.lossless,
      identical: norm(out) === norm(baseline),
      blocks: parsed.blocks.length,
      counts,
    }
  } catch (e) {
    return { slug: p.slug, error: e.message }
  }
}), posts)

await browser.close()

let failed = 0
const totals = {}
for (const r of results) {
  if (r.error) {
    console.log(`FAIL  ${r.slug} — threw: ${r.error}`)
    failed++
    continue
  }
  for (const [k, v] of Object.entries(r.counts)) totals[k] = (totals[k] || 0) + v

  if (!r.identical) {
    console.log(`FAIL  ${r.slug} — round-trip changed the HTML`)
    failed++
  } else if (!r.lossless) {
    console.log(`RAW   ${r.slug} — falls back to HTML mode (${r.blocks} block)`)
  } else {
    const shape = Object.entries(r.counts).map(([k, v]) => `${k}:${v}`).join(' ')
    console.log(`ok    ${r.slug} — ${r.blocks} blocks  [${shape}]`)
  }
}

console.log('\nblock types found: ' + Object.entries(totals).map(([k, v]) => `${k}=${v}`).join(', '))
console.log(failed ? `\n${failed} post(s) FAILED` : `\nall ${results.length} posts round-trip cleanly`)
process.exitCode = failed ? 1 : 0
