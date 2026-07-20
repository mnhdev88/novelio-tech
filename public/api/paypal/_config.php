<?php
// ─────────────────────────────────────────────────────────────────────────────
// PayPal integration — configuration + credential loading.
//
// WHY credentials live ABOVE the web root:
//   The site deploys via an FTPS *mirror* of dist/ (see .github/workflows/deploy.yml).
//   Anything inside public_html that isn't in dist/ gets DELETED on the next deploy,
//   and anything inside public_html is publicly reachable. So the real secret file
//   must sit one level ABOVE public_html, where the mirror never touches it.
//
// On Hostinger, DOCUMENT_ROOT is .../public_html and its parent is your home dir.
// Upload `novelio-paypal-credentials.php` there ONCE via the Hostinger File Manager
// (see PAYPAL-SETUP.md). It defines PAYPAL_CLIENT_ID / PAYPAL_SECRET / PAYPAL_ENV.
// ─────────────────────────────────────────────────────────────────────────────

// Never leak PHP warnings into a JSON response body.
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Where non-public files (credentials, order log) live — above the web root.
$__docroot = isset($_SERVER['DOCUMENT_ROOT']) && $_SERVER['DOCUMENT_ROOT']
    ? $_SERVER['DOCUMENT_ROOT']
    : dirname(__DIR__, 2);
$SECRETS_DIR = dirname($__docroot);

// Read a value from the environment across SAPIs (getenv / $_SERVER / $_ENV).
// Hostinger's hPanel "Environment variables" land in one of these.
function __env($key) {
    $v = getenv($key);
    if ($v === false || $v === '') $v = $_SERVER[$key] ?? ($_ENV[$key] ?? '');
    return ($v === false) ? '' : $v;
}

// Load credentials, in priority order:
//   1) Environment variables (Hostinger hPanel env vars), if PHP exposes them.
//   2) The above-webroot credentials file.
//   3) A local dev file (credentials.local.php — gitignored, `php -S` only).
$__loaded = false;

if (__env('PAYPAL_CLIENT_ID') !== '' && __env('PAYPAL_SECRET') !== '') {
    define('PAYPAL_CLIENT_ID', __env('PAYPAL_CLIENT_ID'));
    define('PAYPAL_SECRET',    __env('PAYPAL_SECRET'));
    if (__env('PAYPAL_ENV') !== '') define('PAYPAL_ENV', __env('PAYPAL_ENV'));
    $__loaded = true;
}

if (!$__loaded) {
    foreach ([
        $SECRETS_DIR . '/novelio-paypal-credentials.php',
        __DIR__ . '/credentials.local.php',
    ] as $__candidate) {
        if (is_file($__candidate)) {
            require $__candidate;
            $__loaded = true;
            break;
        }
    }
}

if (!$__loaded || !defined('PAYPAL_CLIENT_ID') || !defined('PAYPAL_SECRET')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Payment is not configured yet. Please contact us to complete your order.']);
    exit;
}

// sandbox (default, safe) vs live.
if (!defined('PAYPAL_ENV')) {
    define('PAYPAL_ENV', 'sandbox');
}
define('PAYPAL_API_BASE', PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com');

define('PAYPAL_CURRENCY', 'USD');
define('PAYPAL_BRAND_NAME', 'Novelio Technologies');

// Guard rails for custom / one-off payments (the /pay page). The amount is set by
// you (or typed by the client from your quote), so it can't be validated against a
// price table — these bounds reject $0, negatives, and absurd values.
if (!defined('PAYPAL_CUSTOM_MIN')) define('PAYPAL_CUSTOM_MIN', 1);
if (!defined('PAYPAL_CUSTOM_MAX')) define('PAYPAL_CUSTOM_MAX', 50000);

// Where to record completed orders and who to notify. Both can be overridden in
// the credentials file. The log path is above the web root so it can't be fetched.
if (!defined('PAYPAL_ORDER_LOG')) {
    define('PAYPAL_ORDER_LOG', $SECRETS_DIR . '/novelio-orders.log');
}
if (!defined('PAYPAL_NOTIFY_EMAIL')) {
    define('PAYPAL_NOTIFY_EMAIL', 'ajay@noveliotech.com');
}

// ── Authoritative price table ────────────────────────────────────────────────
// The server computes the charge from this table so the amount can never be
// tampered with in the browser. It's the SHARED source of truth (also used by the
// Payoneer integration) — edit prices in ../_pricing.php, which mirrors
// PRICING_PLANS / PRICING_ADDONS in src/data/siteData.js.
require __DIR__ . '/../_pricing.php';
$GLOBALS['PAYPAL_PLANS']  = $GLOBALS['NOVELIO_PLANS'];
$GLOBALS['PAYPAL_ADDONS'] = $GLOBALS['NOVELIO_ADDONS'];
