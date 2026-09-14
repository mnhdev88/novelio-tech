# Razorpay — setup

How Razorpay is wired into the site, and the exact steps to take it from hidden to
live. Companion to `PAYPAL-SETUP.md`; it follows the same credential conventions.

Razorpay replaced Payoneer as the second gateway. PayPal is unchanged and keeps
running alongside it.

---

## What it does

**Razorpay Standard Checkout** — an overlay that opens on our own page. No
redirect, no return route. It accepts cards, UPI, net banking, wallets and EMI.

```
browser                     our server                    Razorpay
  │ selection (no amount) ──▶ │
  │                           │ price it from _pricing.php
  │                           │ POST /v1/orders ─────────▶ │
  │ ◀──────── order id ────── │ ◀──────── order ────────── │
  │ checkout.js overlay ─────────────────────────────────▶ │
  │ ◀── order+payment+signature ────────────────────────── │
  │ verify ─────────────────▶ │ HMAC check
  │                           │ GET /orders + /payments ─▶ │
  │                           │ capture if authorised ──▶  │
  │ ◀──── COMPLETED ───────── │ log + email the team
                              │ ◀──── webhook (safety net) │
```

**The browser never sends an amount.** It sends the selection; the server prices
it from `public/api/_pricing.php` and pins that amount to the order. On the way
back, only the three Razorpay identifiers are trusted — everything else is re-read
from Razorpay's own API, so a tampered callback can't relabel a ₹100 payment as a
paid annual plan.

## Currencies and GST

| | INR | USD |
|---|---|---|
| Gateway | Razorpay | PayPal, and Razorpay where approved |
| Entity | Novelio India | Novelio Technologies LLC |
| GST | +18% added at checkout, shown as its own line | none |
| Prices from | the `*INR` fields in `content/pricing.json` | the original fields |

USD on Razorpay needs **International Payments** approved on the account. If it
isn't, set `VITE_RAZORPAY_USD_ENABLED` to blank (and drop `USD` from
`RAZORPAY_CURRENCIES`) so buyers never reach an order the API will refuse.

### The INR prices are placeholders

They were seeded from the USD figures at ₹88 per $1, rounded to ₹100. Until
someone confirms them, **every INR charge is refused server-side** with a message
asking the customer to pay in USD or get in touch. USD is unaffected.

To confirm: **Admin → Pricing**, check each ₹ figure, tick *"The ₹ prices above
are correct and may be charged"*, publish. (Or edit `content/pricing.json`
directly and set `inrPricing.confirmed` to `true`.) The flag is generated into
`_pricing.php`, so it travels with the prices rather than sitting in an env var.

---

## Files

| Path | What it is |
|---|---|
| `public/api/razorpay/_config.php` | credentials, currencies, GST rate, bounds |
| `public/api/razorpay/_lib.php` | HTTP, signatures, pricing, logging, email |
| `public/api/razorpay/create-order.php` | plan orders (`/checkout`) |
| `public/api/razorpay/create-custom-order.php` | one-off orders (`/pay`) |
| `public/api/razorpay/verify-payment.php` | the only place a payment becomes real |
| `public/api/razorpay/webhook.php` | records payments the browser never reported |
| `src/utils/razorpay.js` | SDK loader + the three fetch helpers |
| `src/utils/pricing.js` | the browser's copy of the price maths |
| `public/api/_pricing.php` | generated price table, shared with PayPal |

Completed payments append to `novelio-orders.log` above the web root — the same
log PayPal writes to, so all sales are in one file.

---

## Setup

### 1. Get the keys

Razorpay Dashboard → **Account & Settings → API Keys → Generate Test Key**.
You get a Key ID (`rzp_test_…`) and a Key Secret shown **once**.

There is no separate test host. `rzp_test_…` keys *are* test mode and
`rzp_live_…` keys *are* live mode — the same code path serves both.

### 2. Put the secret on the server

Copy `public/api/razorpay/credentials.example.php`, fill it in, and save it as:

```
novelio-razorpay-credentials.php
```

Upload it **one level above `public_html`** (your Hostinger home directory) via
the File Manager. Not inside `public_html` — the FTPS deploy mirrors `dist/` and
would both expose it and wipe it.

> For local dev only, you can instead save it as
> `public/api/razorpay/credentials.local.php` (gitignored, and excluded from the
> deploy).

### 3. Publish the Key ID to the build

The Key ID is public — it is sent to every browser. In
`.github/workflows/deploy.yml`:

```yaml
VITE_RAZORPAY_KEY_ID: 'rzp_test_xxxxxxxxxxxx'
VITE_RAZORPAY_ENV: test
```

Blank Key ID = the Razorpay option is hidden entirely and PayPal is the only
gateway. Push to deploy.

### 4. Add the webhook

Dashboard → **Settings → Webhooks → Add New Webhook**.

- URL: `https://www.noveliotech.com/api/razorpay/webhook.php`
- Secret: any strong random string — the same one you put in
  `RAZORPAY_WEBHOOK_SECRET`
- Events: `payment.captured` (and optionally `order.paid`)

This is the safety net for a buyer who pays and then closes the tab before the
browser reports back. Without the secret, `webhook.php` rejects every event and
the browser callback becomes the only way a payment gets recorded — so set it.

### 5. Test

Test cards: `4111 1111 1111 1111`, any future expiry, any CVV, OTP `1234`.
For UPI in test mode, use `success@razorpay`.

Run through both pages:

- `/checkout?plan=growth` — plan purchase, both billing cycles
- `/pay?amount=500&ref=Invoice-001` — one-off payment
- `/pay?amount=500&currency=INR` — the GST line should appear
- `/pay?amount=590&currency=INR&gst=inclusive` — GST backed out of the total

Then confirm each one:

- the amount on the overlay matches the "Due today" line exactly
- the order appears in `novelio-orders.log` with `"gateway":"razorpay"`
- the notification email arrives
- the webhook shows a 200 in the dashboard's delivery log
- paying twice from the same order does **not** write two log lines

### 6. Go live

1. Complete Razorpay KYC and activate the account.
2. Generate live keys; update `novelio-razorpay-credentials.php`.
3. Set `VITE_RAZORPAY_KEY_ID` to the `rzp_live_…` id and `VITE_RAZORPAY_ENV` to
   `live` in `deploy.yml`.
4. Re-create the webhook against the live account (the secret is per-mode).
5. Confirm the INR prices in Admin → Pricing, or INR stays blocked.
6. Do one real ₹1–₹100 payment and refund it from the dashboard.

---

## Keeping the two price calculators honest

The browser shows a total and the server independently computes the one it
charges. If they drift, the buyer reads one number and pays another — or the
payment is simply refused. So they are diffed against each other:

```
npm run test:pricing
```

48 combinations (every plan × billing cycle × currency × several add-on shapes).
Run it after touching `src/utils/pricing.js`, `public/api/razorpay/_lib.php`, or
any price in `content/pricing.json`.

---

## Notes

- **Amounts are in minor units.** Razorpay's API speaks paise and cents, so the
  code works in integers end to end and only divides by 100 for display. A GST
  split can't drift by a rounding unit that way.
- **Capture.** If the account isn't set to auto-capture, `verify-payment.php`
  captures an authorised payment itself, then re-reads the order. A payment that
  is authorised but not captured is reported as `PENDING`, never as paid.
- **Idempotency.** `rzp_finalize()` keys on the payment id, so whichever of the
  browser callback and the webhook arrives second changes nothing.
- **Custom payments and GST.** `/pay` adds 18% to an INR amount by default,
  matching the Terms page. Add `&gst=inclusive` to the link when the figure you
  sent already contains the tax; the split is recorded either way so the tax
  invoice can be raised correctly.

## Removing the old Payoneer install

The FTPS deploy mirrors `dist/`, so `public_html/api/payoneer/` is deleted on the
next push automatically. Two things it will **not** touch, both above the web root
— delete them by hand in the Hostinger File Manager:

- `novelio-payoneer-credentials.php`
- `novelio-payoneer-pending.jsonl`

`novelio-orders.log` must stay: it holds the historical Payoneer orders alongside
the PayPal and Razorpay ones.
