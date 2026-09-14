<?php
// ─────────────────────────────────────────────────────────────────────────────
// Razorpay credentials — TEMPLATE. Do NOT put real secrets in this file (it ships
// publicly). Copy its contents into a file named:
//
//     novelio-razorpay-credentials.php
//
// and upload THAT one level ABOVE public_html (your Hostinger home directory),
// so it is never web-accessible and never wiped by the FTPS mirror deploy.
// See RAZORPAY-SETUP.md for step-by-step instructions.
//
// For LOCAL development only, you may instead save it next to this file as
// `credentials.local.php` (already gitignored).
// ─────────────────────────────────────────────────────────────────────────────

// From Razorpay Dashboard → Account & Settings → API Keys.
// There is no separate test host: rzp_test_… keys ARE test mode, rzp_live_… ARE
// live mode. The Key ID also goes in VITE_RAZORPAY_KEY_ID (it is public); the
// secret belongs ONLY here.
define('RAZORPAY_KEY_ID',     'rzp_test_PASTE_YOUR_KEY_ID');
define('RAZORPAY_KEY_SECRET', 'PASTE_YOUR_KEY_SECRET_HERE');

// From Dashboard → Settings → Webhooks, when you add the webhook. Without it
// webhook.php rejects every event, so the browser callback becomes the only way
// a payment gets recorded — set it.
define('RAZORPAY_WEBHOOK_SECRET', 'PASTE_YOUR_WEBHOOK_SECRET_HERE');

// Optional overrides:
// Currencies offered. Drop USD if "International Payments" is not approved on
// the account, so buyers never reach an order the API will refuse.
// define('RAZORPAY_CURRENCIES', 'INR,USD');
// GST added to INR charges (percent). 0 disables it.
// define('RAZORPAY_GST_PERCENT', 18);
// define('RAZORPAY_NOTIFY_EMAIL', 'ajay@noveliotech.com');
// define('RAZORPAY_ORDER_LOG', __DIR__ . '/novelio-orders.log');
