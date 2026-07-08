<?php
// ─────────────────────────────────────────────────────────────────────────────
// PayPal credentials — TEMPLATE. Do NOT put real secrets in this file (it ships
// publicly). Copy its contents into a file named:
//
//     novelio-paypal-credentials.php
//
// and upload THAT one level ABOVE public_html (your Hostinger home directory),
// so it is never web-accessible and never wiped by the FTPS mirror deploy.
// See PAYPAL-SETUP.md for step-by-step instructions.
//
// For LOCAL development only, you may instead save it next to this file as
// `credentials.local.php` (already gitignored).
// ─────────────────────────────────────────────────────────────────────────────

// 'sandbox' while testing, 'live' when you go real.
define('PAYPAL_ENV', 'sandbox');

// From developer.paypal.com → Apps & Credentials → your app.
define('PAYPAL_CLIENT_ID', 'PASTE_YOUR_CLIENT_ID_HERE');
define('PAYPAL_SECRET',    'PASTE_YOUR_SECRET_HERE');

// Optional overrides:
// define('PAYPAL_NOTIFY_EMAIL', 'ajay@noveliotech.com');
// define('PAYPAL_ORDER_LOG', __DIR__ . '/novelio-orders.log');
