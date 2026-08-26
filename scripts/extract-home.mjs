// One-shot extractor: pulls the hardcoded copy out of the homepage section
// components into content/homepage.json.
//
// Doing this by hand would mean retyping several thousand words of marketing
// copy, where a single silent typo becomes a live-site regression. So the data
// is read from the modules themselves: Vite strips the JSX, Node imports the
// result, and the lucide icon *components* are turned back into their names by
// identity lookup against the same lucide module the components import.
//
// This script is disposable — once content/homepage.json exists and the
// components read from it, there is nothing left to extract.
//
//   node scripts/extract-home.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'
import * as lucide from 'lucide-react'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const HOME = path.join(ROOT, 'src/components/home')
const TMP = path.join(ROOT, '.extract-tmp')

// Reverse map: icon component -> exported name. Built once, used to serialise
// every `icon:` field. lucide re-exports aliases, so prefer the shortest name
// (the canonical one) when several keys point at the same component.
const ICON_NAME = new Map()
for (const [name, value] of Object.entries(lucide)) {
  if (typeof value !== 'object' && typeof value !== 'function') continue
  const existing = ICON_NAME.get(value)
  if (!existing || name.length < existing.length) ICON_NAME.set(value, name)
}

function serialise(value) {
  if (Array.isArray(value)) return value.map(serialise)
  if (value && typeof value === 'object') {
    // A lucide icon reaches here as a React component object, not plain data.
    if (ICON_NAME.has(value)) return ICON_NAME.get(value)
    if (value.$$typeof || typeof value.render === 'function') {
      throw new Error('found a React component that is not a known lucide icon')
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialise(v)]))
  }
  return value
}

async function readConsts(file, names) {
  const outName = file.replace('.jsx', '.mjs')
  await build({
    root: ROOT,
    logLevel: 'silent',
    configFile: false,
    build: {
      write: true,
      outDir: TMP,
      emptyOutDir: false,
      minify: false,
      lib: {
        entry: path.join(HOME, file),
        formats: ['es'],
        fileName: () => outName,
      },
      rollupOptions: {
        // Keep every dependency external so `lucide-react` resolves to the SAME
        // module instance this script imported — icon identity is what the
        // reverse lookup above depends on.
        external: (id) => !id.startsWith('.') && !path.isAbsolute(id),
      },
    },
  })

  const mod = await import(pathToFileURL(path.join(TMP, outName)).href)
  const out = {}
  for (const name of names) {
    if (!(name in mod)) throw new Error(`${file} does not export ${name}`)
    out[name] = serialise(mod[name])
  }
  return out
}

const SOURCES = {
  'GrowthSystem.jsx':    ['AREAS'],
  'GrowthCycle.jsx':     ['CYCLE'],
  'GrowthFramework.jsx': ['PILLARS', 'COVERS'],
  'FreeWebsiteCTA.jsx':  ['BENEFITS'],
  'WhyChooseUs.jsx':     ['pillars', 'metrics'],
  'FAQSection.jsx':      ['FAQS'],
}

fs.mkdirSync(TMP, { recursive: true })

const extracted = {}
for (const [file, names] of Object.entries(SOURCES)) {
  Object.assign(extracted, await readConsts(file, names))
  console.log(`[extract-home] ${file} — ${names.join(', ')}`)
}

// Headings and standalone copy are read straight from the JSX by hand below:
// they are single strings, so there is no retyping risk worth automating away.
const homepage = {
  hero: {
    badge: 'Trusted Business Growth Partner for SMEs',
    // The headline has a gradient, clickable phrase in the middle of the
    // sentence, so it is stored as three parts rather than one string.
    headlineBefore: 'Your Small Business Deserves a',
    headlineHighlight: 'Growth Partner,',
    headlineAfter: 'Not Just a Vendor',
    tagline: 'Use Before You Trust. Trust Before You Pay.',
    subheadline:
      'We analyze your digital presence — website, Google listing, leads, automation, branding, and operations — then build and execute a tailored growth plan that drives real revenue.',
    ctaLabel: 'Yes, I Want to Grow',
    callPrompt: 'Prefer to talk?',
  },
  growthSystem: { areas: extracted.AREAS },
  growthCycle: { steps: extracted.CYCLE },
  growthFramework: { pillars: extracted.PILLARS, covers: extracted.COVERS },
  freeWebsiteCTA: { benefits: extracted.BENEFITS },
  whyChooseUs: { pillars: extracted.pillars, metrics: extracted.metrics },
  faq: { items: extracted.FAQS },
}

fs.writeFileSync(
  path.join(ROOT, 'content/homepage.json'),
  JSON.stringify(homepage, null, 2) + '\n'
)
fs.rmSync(TMP, { recursive: true, force: true })

const counts = [
  `${homepage.growthSystem.areas.length} growth areas`,
  `${homepage.growthCycle.steps.length} cycle steps`,
  `${homepage.growthFramework.pillars.length} pillars`,
  `${homepage.growthFramework.covers.length} covers`,
  `${homepage.freeWebsiteCTA.benefits.length} benefits`,
  `${homepage.whyChooseUs.pillars.length} why-us pillars`,
  `${homepage.whyChooseUs.metrics.length} metrics`,
  `${homepage.faq.items.length} FAQs`,
]
console.log(`[extract-home] content/homepage.json — ${counts.join(', ')}`)
