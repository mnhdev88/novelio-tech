# PayPal Checkout — Setup & Testing

This site takes a **one-time payment** (deposit / first payment) via PayPal on the
`/checkout` page. Renewals and the 12-month term are handled by you manually — PayPal
just collects the money. No recurring auto-billing, no database.

## How it works

```
/checkout  →  PayPal button (public Client ID in the browser)
     │  createOrder → POST /api/paypal/create-order.php   (server sets the amount)
     ▼
  buyer approves in PayPal
     │  onApprove  → POST /api/paypal/capture-order.php   (server captures + verifies)
     ▼
  server logs the order + emails the team → React sends buyer to /dashboard
```

The **price is computed on the server** (`_config.php` price table), so it can't be
tampered with in the browser. The capture step verifies the money actually landed and
that the amount matches before anyone is sent to the dashboard.

**Security model:** the PayPal **Client ID is public** (fine in the browser). The
**Secret is server-only** and lives in a file **above** `public_html` so the FTPS
mirror-deploy can never overwrite or expose it.

---

## One-time setup

### 1. Get PayPal API credentials
1. Create/log in to a **PayPal Business** account.
2. Go to <https://developer.paypal.com/dashboard/> → **Apps & Credentials**.
3. Toggle **Sandbox** (top right) while testing. Click **Create App**, name it
   (e.g. "Novelio Checkout"), create.
4. Copy the **Client ID** and **Secret**. (There's a separate pair under the **Live**
   tab for when you go real.)

### 2. Put the SECRET on the server (above the web root)
The secret must **not** live inside `public_html` (it would be public and wiped on
each deploy). Upload it one level up instead:

1. In Hostinger **hPanel → File Manager**, go to your account **home directory** —
   the folder that *contains* `public_html` (do NOT go inside `public_html`).
2. Create a new file there named exactly:
   ```
   novelio-paypal-credentials.php
   ```
3. Paste this and fill in your keys (template also at
   `public/api/paypal/credentials.example.php`):
   ```php
   <?php
   define('PAYPAL_ENV', 'sandbox');            // 'live' when going real
   define('PAYPAL_CLIENT_ID', 'YOUR_CLIENT_ID');
   define('PAYPAL_SECRET',    'YOUR_SECRET');
   // define('PAYPAL_NOTIFY_EMAIL', 'ajay@noveliotech.com');
   ```
4. Save. This file is safe from deploys and never web-accessible.

> The server auto-detects this file at `<home>/novelio-paypal-credentials.php`.
> If your host lays out folders differently, confirm `DOCUMENT_ROOT`'s parent is
> your home dir; otherwise set `PAYPAL_ORDER_LOG` / adjust the path.

### 3. Put the PUBLIC Client ID in the front-end build
The browser needs the **Client ID** (public). Add it as **GitHub repo secrets** so the
deploy build picks it up:

1. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.
2. Add:
   - `VITE_PAYPAL_CLIENT_ID` = your **Client ID** (sandbox one first)
   - `VITE_PAYPAL_ENV` = `sandbox` (then `live` later)
3. Push to `main` (or run the deploy workflow). The build inlines these.

For **local dev**, put the same in `.env`:
```
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id
VITE_PAYPAL_ENV=sandbox
```
> If `VITE_PAYPAL_CLIENT_ID` is empty, checkout stays in click-through **Demo mode** —
> nothing breaks, no real charge.

---

## Testing (sandbox)

1. Set sandbox Client ID (front-end) + sandbox Secret (server file), `*_ENV=sandbox`.
2. PayPal gives you **sandbox test accounts** at
   <https://developer.paypal.com/dashboard/accounts/> — use the **Personal** (buyer)
   account's email + password to pay, and check the **Business** account's activity.
3. Go to `/checkout`, sign in (checkout requires an account), pick a plan, click the
   PayPal button, log in with the **sandbox buyer**, and complete payment.
4. Confirm: you land on `/dashboard`, the buyer shows in the sandbox Business account,
   the order is appended to `novelio-orders.log` (next to the credentials file), and
   the team notification email is sent (sandbox email may not deliver — the log is the
   source of truth).

### Going live
1. Swap all three to **Live** values: `VITE_PAYPAL_CLIENT_ID` (live), `VITE_PAYPAL_ENV=live`,
   and in the server file `PAYPAL_ENV=live` + live Client ID/Secret.
2. Do one **small real payment** end-to-end, then refund it from PayPal to confirm.

---

## Custom / one-off payments (the `/pay` page)

For invoices, custom quotes, deposits or 12-month buyouts — amounts that aren't a
fixed plan — use the **`/pay`** page. Same PayPal keys, no extra setup.

**Send a client a ready-to-pay link** with the amount prefilled (and locked so they
can't mistype it):

```
https://www.noveliotech.com/pay?amount=2222&ref=Invoice-014&desc=Website%20build
```
- `amount` — the exact charge (locks the field when present).
- `ref` — your invoice/quote number, shown to the client and saved in the order log.
- `desc` — optional line-item text on the PayPal receipt.

Or just tell a client to go to `/pay` and type the amount you quoted (the field is
editable when no `amount` is in the URL). They enter name + email, pay, and the order
is verified, logged to `novelio-orders.log` (marked `"type":"custom"`), and emailed to
you — exactly like plan checkouts.

**Guard rails:** the server rejects amounts outside `$1`–`$50,000`
(`PAYPAL_CUSTOM_MIN` / `PAYPAL_CUSTOM_MAX` in `_config.php`). Because only our server
can create an order under our merchant account, no one can pay an amount we didn't
generate. Always reconcile the received amount against your invoice before delivering
work (the log + email make this easy).

## What gets charged
Currently the button charges exactly the **"Due today"** amount shown in the order
summary (monthly total, or ×12 for yearly). To charge a **deposit or setup fee only**
instead, edit `compute_charge()` in `public/api/paypal/_lib.php` (and update the UI
copy in `src/pages/portal/CheckoutPage.jsx`). Keep the server as the source of truth.

## Keeping prices in sync
The authoritative price table is in `public/api/paypal/_config.php`
(`$PAYPAL_PLANS` / `$PAYPAL_ADDONS`). If you change prices in
`src/data/siteData.js`, update that table too — otherwise create-order will use the
old amount.

## Files
| File | Role |
|------|------|
| `public/api/paypal/_config.php` | Loads credentials, price table |
| `public/api/paypal/_lib.php` | PayPal API + pricing + logging helpers |
| `public/api/paypal/create-order.php` | Creates a PLAN order (server-set amount) |
| `public/api/paypal/create-custom-order.php` | Creates a CUSTOM order (`/pay`, bounded amount) |
| `public/api/paypal/capture-order.php` | Captures + verifies + logs (plan & custom) |
| `src/pages/portal/CustomPaymentPage.jsx` | The `/pay` custom-payment page |
| `public/api/paypal/.htaccess` | Blocks direct access to includes/credentials/logs |
| `src/utils/paypal.js` | Loads the PayPal JS SDK |
| `src/pages/portal/CheckoutPage.jsx` | Renders the PayPal buttons |
| `<home>/novelio-paypal-credentials.php` | **Secret** (above web root, manual upload) |
| `<home>/novelio-orders.log` | Order records (above web root) |
