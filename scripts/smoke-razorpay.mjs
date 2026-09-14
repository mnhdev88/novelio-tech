// Proves the Razorpay server wiring is live, WITHOUT moving any money.
//
//   npm run smoke:razorpay                        # against www.noveliotech.com
//   npm run smoke:razorpay -- http://localhost:8000
//
// What it can prove without a payment:
//   · the credentials file above public_html is found and readable
//   · the key pair is valid (Razorpay accepts an order under it)
//   · the shared price table loaded and the INR placeholder guard is armed
//   · the includes and the credentials template are NOT web-reachable
//
// The last check creates one real, UNPAID order — free and harmless, an order
// nobody pays just expires — and it is the only way to prove the secret works
// short of paying. But against LIVE keys every run leaves another row in the
// dashboard, so pass --no-order to re-run the cheap checks without adding one.

const args = process.argv.slice(2)
const SKIP_ORDER = args.includes('--no-order')
const BASE = (args.find((a) => !a.startsWith('--')) || 'https://www.noveliotech.com').replace(/\/+$/, '')

let failures = 0
const pass = (m) => console.log('  [32m✓[0m ' + m)
const fail = (m, detail) => { failures++; console.log('  [31m✗[0m ' + m); if (detail) console.log('      ' + detail) }

// The site's .htaccess rewrites requests for MISSING files to index.html, so an
// endpoint that isn't deployed answers 200 with the React shell rather than 404.
// Without this the whole suite misreads "not deployed yet" as "broken".
const isSpaShell = (text) => /<!DOCTYPE html>/i.test(text) && /<html lang="en"/i.test(text)
const NOT_DEPLOYED = 'not deployed yet — the SPA shell came back instead of JSON. Push to main and let the deploy finish.'

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* keep the raw text for the error line */ }
  return { status: res.status, json, text, missing: json === null && isSpaShell(text) }
}

console.log(`\nRazorpay smoke test — ${BASE}\n`)

// ── 1. Private files must not be web-reachable ──────────────────────────────
console.log('Exposure')
for (const path of [
  '/api/razorpay/_config.php',
  '/api/razorpay/_lib.php',
  '/api/razorpay/credentials.example.php',
  '/api/_pricing.php',
]) {
  const res = await fetch(BASE + path)
  const body = await res.text()
  // Three outcomes worth telling apart:
  //   403/404            — the .htaccess is doing its job
  //   200 + SPA shell    — the file simply isn't on the server (safe, but unproven)
  //   200 + PHP source   — a real leak
  if (/RAZORPAY_KEY|PAYPAL_SECRET|define\(|NOVELIO_PLANS/.test(body)) {
    fail(`${path} is SERVING ITS CONTENTS`, 'Check the .htaccess in that folder — this leaks code.')
  } else if (res.status === 200 && isSpaShell(body)) {
    console.log(`  [33m-[0m ${path} absent from the server (nothing to leak, blocking unverified)`)
  } else if (res.status === 200 && body.trim() !== '') {
    fail(`${path} returned 200 with a body`, body.slice(0, 120))
  } else {
    pass(`${path} blocked (${res.status})`)
  }
}

// ── 2. Endpoint reachable + price table loaded ──────────────────────────────
console.log('\nWiring')
const unknown = await post('/api/razorpay/create-order.php', {
  planId: 'definitely-not-a-plan', billing: 'monthly', addonIds: [], currency: 'USD',
})
if (unknown.missing) {
  fail('create-order.php ' + NOT_DEPLOYED)
} else if (unknown.status === 400 && /unknown plan/i.test(unknown.json?.error || '')) {
  pass('create-order.php is live and reading the price table')
} else if (unknown.status === 500 && /not configured/i.test(unknown.json?.error || '')) {
  fail('credentials NOT found on the server',
    'novelio-razorpay-credentials.php is missing, misnamed, or not one level above public_html.')
} else {
  fail(`unexpected reply (${unknown.status})`, unknown.text.slice(0, 200))
}

// ── 3. The INR placeholder guard ────────────────────────────────────────────
const inr = await post('/api/razorpay/create-order.php', {
  planId: 'growth', billing: 'monthly', addonIds: [], currency: 'INR',
})
if (inr.missing) {
  fail('INR check skipped — ' + NOT_DEPLOYED)
} else if (inr.status === 409) {
  pass('INR is correctly REFUSED while the rupee prices are unconfirmed')
} else if (inr.status === 200 && inr.json?.orderId) {
  pass(`INR is live — order ${inr.json.orderId} for ₹${inr.json.total} (incl. ₹${inr.json.gst} GST)`)
} else {
  fail(`INR order gave ${inr.status}`, inr.text.slice(0, 200))
}

// ── 4. The key pair itself ──────────────────────────────────────────────────
const usd = SKIP_ORDER ? null : await post('/api/razorpay/create-order.php', {
  planId: 'growth', billing: 'monthly', addonIds: [], currency: 'USD',
  customer: { id: 'smoke', name: 'Smoke Test', email: 'smoke@example.com' },
})
if (SKIP_ORDER) {
  console.log('  [33m-[0m key-pair check skipped (--no-order), so no order was added to the dashboard')
} else if (usd.missing) {
  fail('key-pair check skipped — ' + NOT_DEPLOYED)
} else if (usd.status === 200 && /^order_/.test(usd.json?.orderId || '')) {
  pass(`key pair works — Razorpay opened order ${usd.json.orderId} for $${usd.json.total}`)
  console.log(`      (unpaid, costs nothing; key id in use: ${usd.json.keyId})`)
} else if (usd.status === 502 && /international/i.test(usd.json?.error || '')) {
  fail('USD refused — International Payments is not approved on the account',
    'Set VITE_RAZORPAY_USD_ENABLED to blank and RAZORPAY_CURRENCIES to \'INR\' until it is.')
} else if (usd.status === 502) {
  fail('Razorpay rejected the order — the key id/secret pair is probably wrong',
    usd.json?.error || usd.text.slice(0, 200))
} else {
  fail(`USD order gave ${usd.status}`, usd.text.slice(0, 200))
}

console.log(failures === 0
  ? '\n[32mAll checks passed.[0m The server side is ready; the button appears once VITE_RAZORPAY_KEY_ID is set in deploy.yml.\n'
  : `\n[31m${failures} check(s) failed.[0m See above.\n`)

process.exit(failures === 0 ? 0 : 1)
