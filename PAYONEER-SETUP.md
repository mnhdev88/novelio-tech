# Payoneer Checkout — Setup & Testing

This adds **Payoneer** as a second gateway alongside PayPal, on both `/checkout`
(plans) and `/pay` (custom invoices). Like PayPal it takes a **one-time payment**;
renewals and the 12-month term are handled by you manually.

Payoneer Checkout is the **optile / Open Payment Gateway (OPG)** platform on
`*.oscato.com`. Unlike PayPal it has **no in-page button and no public browser
key** — it's a **hosted redirect**: our server creates a payment session, sends the
buyer to Payoneer's hosted page, and verifies the result server-side on the way
back (and via webhook).

## How it works

```
/checkout or /pay
   │  click "Pay with Payoneer"
   ▼
POST /api/payoneer/create-list.php        (server sets the amount, creates a LIST)
   │  returns { redirectUrl }
   ▼
browser redirects to Payoneer's HOSTED payment page (buyer pays by card)
   │  Payoneer redirects back to  /payoneer/return?ref=…
   ▼
/payoneer/return  →  POST /api/payoneer/confirm.php   (server RE-READS the LIST,
   │                                                    verifies it's paid, logs+emails)
   ▼
plan → subscription created → /dashboard      custom → "Payment received" receipt
```

Also: Payoneer POSTs an async **notification** to `/api/payoneer/notify.php`; that
re-reads the LIST and finalizes too, so the order is logged even if the buyer
closes the tab before the return page loads. Logging is **idempotent** (keyed by
the Payoneer LIST id) so return + webhook never double-count.

**Security model** (same as PayPal): the **price is computed on the server**
(shared table in `public/api/_pricing.php`), so it can't be tampered with in the
browser. The **merchant token is server-only** and lives **above** `public_html`
so the FTPS mirror-deploy can never overwrite or expose it. The browser only ever
holds an opaque, unguessable transaction id.

---

## One-time setup

### 1. Get your Payoneer Checkout credentials
1. Log in to your **Payoneer Checkout / OPG merchant** account.
2. Go to **Checkout → Integration → API access** (a.k.a. the merchant portal
   "Tokens" area).
3. Note your **Merchant code** (the store/company code) and generate a
   **Payment Token** for the **Sandbox** environment. The token is shown **once** —
   copy it now; regenerate if lost.
4. In sandbox you must also configure a **Provider Contract** using the test
   adapter **"TESTPSP"** (Dashboard → Provider Contracts) and activate its routes,
   or LIST calls will return no payment methods.

### 2. Put the SECRET on the server (above the web root)
Exactly like the PayPal secret — it must **not** live inside `public_html`.

1. In Hostinger **hPanel → File Manager**, go to your account **home directory**
   (the folder that *contains* `public_html`; do **not** go inside `public_html`).
2. Create a file there named exactly:
   ```
   novelio-payoneer-credentials.php
   ```
3. Paste this and fill in your keys (template also at
   `public/api/payoneer/credentials.example.php`):
   ```php
   <?php
   define('PAYONEER_ENV', 'sandbox');                 // 'live' when going real
   define('PAYONEER_MERCHANT_CODE', 'YOUR_MERCHANT_CODE');
   define('PAYONEER_TOKEN',         'YOUR_SANDBOX_PAYMENT_TOKEN');
   // define('PAYONEER_NOTIFY_EMAIL', 'ajay@noveliotech.com');
   ```
4. Save. This file is safe from deploys and never web-accessible.

> The server auto-detects `<home>/novelio-payoneer-credentials.php`. It reuses the
> same order log as PayPal (`<home>/novelio-orders.log`) and writes a small
> in-flight file `<home>/novelio-payoneer-pending.jsonl` (both above the web root).

### 3. Turn the button on in the front-end build
Payoneer has **no public key**, so the front-end just needs a flag to show the
option. Add these as **GitHub repo secrets** so the deploy build inlines them:

1. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.
2. Add:
   - `VITE_PAYONEER_ENABLED` = `1`
   - `VITE_PAYONEER_ENV` = `sandbox` (then `live` later — controls the sandbox banner)
3. Push to `main` (or run the deploy workflow).

> Make sure the deploy workflow passes these `VITE_*` vars into the build step,
> the same way it does `VITE_PAYPAL_CLIENT_ID` (check `.github/workflows/deploy.yml`).

For **local dev**, put the same in `.env`, and drop a
`public/api/payoneer/credentials.local.php` (copy of the template) so `php -S` can
read the token. If `VITE_PAYONEER_ENABLED` isn't `1`, the Payoneer button is simply
hidden — nothing breaks.

---

## Testing (sandbox)

1. Credentials in place (server token + `VITE_PAYONEER_ENABLED=1`, all `*_ENV=sandbox`).
2. Go to `/checkout` (sign in first) or `/pay`, click **Pay with Payoneer**.
3. On Payoneer's hosted page use the sandbox **TESTPSP** test card:
   ```
   Card number:   5500000000000004
   Expiry:        any future date
   CVC:           any 3 digits
   Name:          John Doe
   ```
4. Complete payment → you're redirected to `/payoneer/return`, which confirms the
   payment server-side and then (plan) sends you to `/dashboard` or (custom) shows a
   receipt.
5. Confirm the order was appended to `novelio-orders.log` (marked
   `"gateway":"payoneer"`) and the team email was attempted.

### ⚠️ Two things to VERIFY in your sandbox before going live
The public OPG docs don't pin down a couple of runtime details, so the code is
written **defensively** (it treats anything it can't positively read as *paid* as
"pending", never as paid). Please confirm against a real sandbox payment:

1. **Paid-status vocabulary.** After a successful hosted payment, note the
   `status.code` / `interaction.code` the LIST resource returns (visible in your
   server error log if a payment shows as `PENDING` on the return page). If the paid
   code isn't already in `poyn_paid_statuses()` in
   `public/api/payoneer/_lib.php`, add it there. (Current set: `charged`, `paid`,
   `paid_out`, `preauthorized`, `captured`, `completed`, `settled`.)
2. **Live hosts.** The sandbox host `api.sandbox.oscato.com` is confirmed. The
   **live** host wording varies by account (`api.oscato.com` vs
   `api.live.oscato.com`). Confirm yours from your onboarding/portal and, if it
   differs from the default, set `PAYONEER_API_BASE` + `PAYONEER_PAGE_BASE` in the
   credentials file before switching `PAYONEER_ENV=live`.
3. **Webhook signature (hardening).** `notify.php` deliberately does **not** trust
   the notification body — it re-reads the LIST from Payoneer and acts on that. Once
   you confirm your account's notification signature scheme (e.g. an HMAC header),
   add verification at the top of `notify.php`. Set the notification URL in your
   Payoneer account to `https://www.noveliotech.com/api/payoneer/notify.php` if a
   division-level URL is required (per-transaction it's already set by our server).

### Going live
1. Swap to **Live** values: server file `PAYONEER_ENV=live` + live merchant
   code/token (+ live hosts if they differ), and `VITE_PAYONEER_ENV=live`.
2. Do one **small real payment** end-to-end, then refund it from the Payoneer
   dashboard to confirm. (Refunds aren't testable in sandbox.)

---

## Custom / one-off payments (the `/pay` page)
Same as PayPal: send a client `https://www.noveliotech.com/pay?amount=2222&ref=Invoice-014&desc=Website%20build`.
They pick **Pay with Payoneer**, pay on the hosted page, and land on a receipt.
Bounds are `PAYONEER_CUSTOM_MIN` / `PAYONEER_CUSTOM_MAX` ($1–$50,000) in `_config.php`.

## Keeping prices in sync
Plan prices now live in **one** shared server file: `public/api/_pricing.php`
(used by both PayPal and Payoneer). It mirrors `PRICING_PLANS` / `PRICING_ADDONS`
in `src/data/siteData.js` — keep those two in sync when prices change.

## Files
| File | Role |
|------|------|
| `public/api/_pricing.php` | **Shared** authoritative price table (PayPal + Payoneer) |
| `public/api/payoneer/_config.php` | Loads credentials, hosts, bounds, price table |
| `public/api/payoneer/_lib.php` | OPG HTTP/auth, LIST create/read, pending store, charge detection, logging/email |
| `public/api/payoneer/create-list.php` | Creates a PLAN LIST (server-set amount) |
| `public/api/payoneer/create-custom-list.php` | Creates a CUSTOM LIST (`/pay`, bounded amount) |
| `public/api/payoneer/confirm.php` | Verifies + logs on return (authoritative re-read) |
| `public/api/payoneer/notify.php` | Async webhook — re-reads + finalizes idempotently |
| `public/api/payoneer/.htaccess` | Blocks direct access to includes/credentials/logs |
| `src/utils/payoneer.js` | Front-end helpers (start checkout, confirm) |
| `src/pages/portal/PayoneerReturnPage.jsx` | The `/payoneer/return` landing page |
| `<home>/novelio-payoneer-credentials.php` | **Token** (above web root, manual upload) |
| `<home>/novelio-payoneer-pending.jsonl` | In-flight payment context (above web root) |
| `<home>/novelio-orders.log` | Completed orders — shared with PayPal (above web root) |
