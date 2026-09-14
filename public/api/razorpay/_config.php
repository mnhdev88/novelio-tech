<?php
// ─────────────────────────────────────────────────────────────────────────────
// Razorpay integration — configuration + credential loading.
//
// Flow is Razorpay STANDARD CHECKOUT (an overlay on our own page, no redirect):
//   1. create-order.php / create-custom-order.php compute the amount SERVER-SIDE
//      and open a Razorpay Order, stashing the plan context in the order notes.
//   2. checkout.js collects the payment and hands back an order/payment/signature
//      triplet.
//   3. verify-payment.php checks the HMAC signature, re-reads the order from the
//      API, captures if needed, and only then records the sale.
//   4. webhook.php records it anyway if the buyer closes the tab mid-way.
//
// WHY credentials live ABOVE the web root (identical reasoning to PayPal):
//   The site deploys via an FTPS *mirror* of dist/. Anything inside public_html
//   that isn't in dist/ gets DELETED on deploy, and anything inside is publicly
//   reachable. So the key secret must sit one level ABOVE public_html. Upload
//   `novelio-razorpay-credentials.php` there ONCE (see RAZORPAY-SETUP.md). It
//   defines RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET.
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
function __rzp_env($key) {
    $v = getenv($key);
    if ($v === false || $v === '') $v = $_SERVER[$key] ?? ($_ENV[$key] ?? '');
    return ($v === false) ? '' : $v;
}

// Load credentials, in priority order:
//   1) Environment variables (Hostinger hPanel env vars), if PHP exposes them.
//   2) The above-webroot credentials file.
//   3) A local dev file (credentials.local.php — gitignored, `php -S` only).
$__loaded = false;

if (__rzp_env('RAZORPAY_KEY_ID') !== '' && __rzp_env('RAZORPAY_KEY_SECRET') !== '') {
    define('RAZORPAY_KEY_ID',     __rzp_env('RAZORPAY_KEY_ID'));
    define('RAZORPAY_KEY_SECRET', __rzp_env('RAZORPAY_KEY_SECRET'));
    if (__rzp_env('RAZORPAY_WEBHOOK_SECRET') !== '') define('RAZORPAY_WEBHOOK_SECRET', __rzp_env('RAZORPAY_WEBHOOK_SECRET'));
    $__loaded = true;
}

if (!$__loaded) {
    foreach ([
        $SECRETS_DIR . '/novelio-razorpay-credentials.php',
        __DIR__ . '/credentials.local.php',
    ] as $__candidate) {
        if (is_file($__candidate)) {
            require $__candidate;
            $__loaded = true;
            break;
        }
    }
}

if (!$__loaded || !defined('RAZORPAY_KEY_ID') || !defined('RAZORPAY_KEY_SECRET')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Razorpay is not configured yet. Please contact us to complete your order.']);
    exit;
}

// Razorpay has ONE API host for both modes — test vs live is decided purely by
// which key pair is in use (rzp_test_… vs rzp_live_…), never by a base URL.
define('RAZORPAY_API_BASE', 'https://api.razorpay.com/v1');
define('RAZORPAY_ENV', strpos(RAZORPAY_KEY_ID, 'rzp_live_') === 0 ? 'live' : 'test');

define('RAZORPAY_BRAND_NAME', 'Novelio Technologies');

// Currencies we will accept. USD needs "International Payments" approved on the
// Razorpay account; if it is switched off there, drop 'USD' from this list so
// buyers never reach an order that the API will reject.
if (!defined('RAZORPAY_CURRENCIES')) define('RAZORPAY_CURRENCIES', 'INR,USD');

// GST added on top of INR charges — Novelio India bills ex-GST plus tax (see the
// Terms page). USD charges are made by the US entity and carry no GST.
if (!defined('RAZORPAY_GST_PERCENT')) define('RAZORPAY_GST_PERCENT', 18);

// Guard rails for custom / one-off payments (the /pay page), per currency. The
// amount is one you quoted rather than one from the price table, so it can't be
// checked against anything — these bounds just reject 0, negatives and absurdity.
if (!defined('RAZORPAY_CUSTOM_MIN_USD')) define('RAZORPAY_CUSTOM_MIN_USD', 1);
if (!defined('RAZORPAY_CUSTOM_MAX_USD')) define('RAZORPAY_CUSTOM_MAX_USD', 50000);
if (!defined('RAZORPAY_CUSTOM_MIN_INR')) define('RAZORPAY_CUSTOM_MIN_INR', 100);
if (!defined('RAZORPAY_CUSTOM_MAX_INR')) define('RAZORPAY_CUSTOM_MAX_INR', 4000000);

// Completed orders + who to notify. Reuses the SAME order log as PayPal so all
// payments (both gateways) land in one place, above the web root.
if (!defined('RAZORPAY_ORDER_LOG')) {
    define('RAZORPAY_ORDER_LOG', $SECRETS_DIR . '/novelio-orders.log');
}
if (!defined('RAZORPAY_NOTIFY_EMAIL')) {
    define('RAZORPAY_NOTIFY_EMAIL', 'ajay@noveliotech.com');
}

// Shared price table (single source of truth, also used by PayPal).
require __DIR__ . '/../_pricing.php';
$GLOBALS['RAZORPAY_PLANS']  = $GLOBALS['NOVELIO_PLANS'];
$GLOBALS['RAZORPAY_ADDONS'] = $GLOBALS['NOVELIO_ADDONS'];
