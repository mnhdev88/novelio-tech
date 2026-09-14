// Proves src/utils/pricing.js and public/api/razorpay/_lib.php agree on every
// price the checkout can produce.
//
// Why this exists: the browser shows a total, the server independently computes
// the one it charges, and Razorpay only ever sees the server's. If the two drift
// the buyer reads one number and pays another — or, with the amount pinned to the
// order, the payment is simply refused. Neither failure is visible in a unit test
// of either half alone, so they are diffed against each other here.
//
//   npm run test:pricing

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// pricing.js reads import.meta.env, which plain Node has no notion of, so the
// GST rate is stubbed to the documented default before the module loads.
process.env.VITE_GST_PERCENT = '18'
globalThis.import_meta_env_stub = true

const pricing = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/pricing.json'), 'utf8'))
const { computeCharge } = await import('../src/utils/pricing.js')

// Every plan × billing cycle × currency × a few add-on shapes.
const addonCombos = [
  [],
  [pricing.addons[0].id],
  [pricing.addons[0].id, pricing.addons[3].id],
  pricing.addons.map((a) => a.id),
]

const cases = []
for (const plan of pricing.plans) {
  if (plan.priceMonthly === 0) continue // free plan is never charged
  for (const billing of ['monthly', 'yearly']) {
    for (const currency of ['USD', 'INR']) {
      for (const [n, addonIds] of addonCombos.entries()) {
        cases.push({
          key: `${plan.id}/${billing}/${currency}/addons${n}`,
          planId: plan.id,
          billing,
          currency,
          addonIds,
        })
      }
    }
  }
}

// ── PHP side ────────────────────────────────────────────────────────────────
const php = spawnSync('php', [path.join(ROOT, 'scripts/pricing-parity.php')], {
  input: JSON.stringify(cases),
  encoding: 'utf8',
  env: {
    ...process.env,
    // Dummy credentials: _config.php refuses to load without a key pair, and no
    // network call is made — only the pricing functions are exercised.
    RAZORPAY_KEY_ID: 'rzp_test_parity',
    RAZORPAY_KEY_SECRET: 'parity',
  },
})

if (php.status !== 0) {
  console.error('[pricing-parity] PHP failed:\n' + (php.stderr || php.stdout))
  process.exit(1)
}

let serverResults
try {
  serverResults = JSON.parse(php.stdout)
} catch {
  console.error('[pricing-parity] PHP did not return JSON:\n' + php.stdout)
  process.exit(1)
}

const byKey = new Map(serverResults.map((r) => [r.key, r]))

// ── Diff ────────────────────────────────────────────────────────────────────
const failures = []
for (const c of cases) {
  const plan = pricing.plans.find((p) => p.id === c.planId)
  const client = computeCharge({
    plan,
    billing: c.billing,
    addonIds: c.addonIds,
    addons: pricing.addons,
    currency: c.currency,
  })
  const server = byKey.get(c.key)
  if (!server) {
    failures.push(`${c.key}: server returned nothing`)
    continue
  }
  for (const [clientKey, serverKey] of [
    ['subtotalMinor', 'subtotal_minor'],
    ['gstMinor', 'gst_minor'],
    ['totalMinor', 'total_minor'],
    ['gstPercent', 'gst_percent'],
  ]) {
    if (client[clientKey] !== server[serverKey]) {
      failures.push(`${c.key}: ${serverKey} — browser ${client[clientKey]}, server ${server[serverKey]}`)
    }
  }
}

if (failures.length) {
  console.error(`[pricing-parity] ${failures.length} mismatch(es):`)
  for (const f of failures) console.error('  ✗ ' + f)
  console.error('\nsrc/utils/pricing.js and public/api/razorpay/_lib.php have diverged.')
  process.exit(1)
}

console.log(`[pricing-parity] ✓ ${cases.length} combinations agree across browser and server`)
