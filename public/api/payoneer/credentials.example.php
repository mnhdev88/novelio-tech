<?php
// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE — copy this to your account HOME directory (one level ABOVE
// public_html) as:   novelio-payoneer-credentials.php   and fill in your keys.
// Do NOT leave a filled-in copy inside public_html (it would be public and wiped
// on each deploy). See PAYONEER-SETUP.md.
//
// For LOCAL dev only, you may instead copy this to credentials.local.php in this
// same folder (it's gitignored and only used by `php -S`).
// ─────────────────────────────────────────────────────────────────────────────

// 'sandbox' while testing, 'live' when going real.
define('PAYONEER_ENV', 'sandbox');

// From Payoneer Account → Checkout → Integration → API access.
// Merchant/store code = Basic-auth username; Payment Token = Basic-auth password.
define('PAYONEER_MERCHANT_CODE', 'YOUR_MERCHANT_CODE');
define('PAYONEER_TOKEN',         'YOUR_SANDBOX_PAYMENT_TOKEN');

// OPTIONAL — only set these for LIVE if your onboarding gives different hosts.
// The live API host wording varies by account (api.oscato.com vs api.live.oscato.com).
// Confirm yours in the merchant portal, then uncomment + set both.
// define('PAYONEER_API_BASE',  'https://api.oscato.com/api');
// define('PAYONEER_PAGE_BASE', 'https://resources.oscato.com/paymentpage/v3/responsive.html');

// OPTIONAL overrides.
// define('PAYONEER_NOTIFY_EMAIL', 'ajay@noveliotech.com');
// define('PAYONEER_SITE_URL',     'https://www.noveliotech.com'); // for absolute callback URLs
