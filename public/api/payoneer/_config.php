<?php
// ─────────────────────────────────────────────────────────────────────────────
// Payoneer Checkout integration — configuration + credential loading.
//
// Payoneer Checkout is the "optile / Open Payment Gateway" (OPG) API on *.oscato.com.
// Flow is a HOSTED redirect: server creates a LIST session, redirects the buyer to
// Payoneer's hosted payment page, then verifies the result server-side on return
// (and via webhook). Mirrors the PayPal integration's security model.
//
// WHY credentials live ABOVE the web root (identical reasoning to PayPal):
//   The site deploys via an FTPS *mirror* of dist/. Anything inside public_html
//   that isn't in dist/ gets DELETED on deploy, and anything inside is publicly
//   reachable. So the merchant token must sit one level ABOVE public_html.
//   Upload `novelio-payoneer-credentials.php` there ONCE (see PAYONEER-SETUP.md).
//   It defines PAYONEER_MERCHANT_CODE / PAYONEER_TOKEN / PAYONEER_ENV.
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
function __poyn_env($key) {
    $v = getenv($key);
    if ($v === false || $v === '') $v = $_SERVER[$key] ?? ($_ENV[$key] ?? '');
    return ($v === false) ? '' : $v;
}

// Load credentials, in priority order:
//   1) Environment variables (Hostinger hPanel env vars), if PHP exposes them.
//   2) The above-webroot credentials file.
//   3) A local dev file (credentials.local.php — gitignored, `php -S` only).
$__loaded = false;

if (__poyn_env('PAYONEER_MERCHANT_CODE') !== '' && __poyn_env('PAYONEER_TOKEN') !== '') {
    define('PAYONEER_MERCHANT_CODE', __poyn_env('PAYONEER_MERCHANT_CODE'));
    define('PAYONEER_TOKEN',         __poyn_env('PAYONEER_TOKEN'));
    if (__poyn_env('PAYONEER_ENV') !== '') define('PAYONEER_ENV', __poyn_env('PAYONEER_ENV'));
    // Optional host overrides (live host wording differs by account onboarding).
    if (__poyn_env('PAYONEER_API_BASE')  !== '') define('PAYONEER_API_BASE',  __poyn_env('PAYONEER_API_BASE'));
    if (__poyn_env('PAYONEER_PAGE_BASE') !== '') define('PAYONEER_PAGE_BASE', __poyn_env('PAYONEER_PAGE_BASE'));
    $__loaded = true;
}

if (!$__loaded) {
    foreach ([
        $SECRETS_DIR . '/novelio-payoneer-credentials.php',
        __DIR__ . '/credentials.local.php',
    ] as $__candidate) {
        if (is_file($__candidate)) {
            require $__candidate;
            $__loaded = true;
            break;
        }
    }
}

if (!$__loaded || !defined('PAYONEER_MERCHANT_CODE') || !defined('PAYONEER_TOKEN')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Payoneer is not configured yet. Please contact us to complete your order.']);
    exit;
}

// sandbox (default, safe) vs live.
if (!defined('PAYONEER_ENV')) {
    define('PAYONEER_ENV', 'sandbox');
}

// API + hosted-page hosts. Sandbox is confirmed. The LIVE hosts vary by account
// onboarding (api.oscato.com vs api.live.oscato.com) — CONFIRM yours from your
// Payoneer/optile merchant portal and override via PAYONEER_API_BASE /
// PAYONEER_PAGE_BASE (env or credentials file) before going live.
if (!defined('PAYONEER_API_BASE')) {
    define('PAYONEER_API_BASE', PAYONEER_ENV === 'live'
        ? 'https://api.oscato.com/api'
        : 'https://api.sandbox.oscato.com/api');
}
if (!defined('PAYONEER_PAGE_BASE')) {
    define('PAYONEER_PAGE_BASE', PAYONEER_ENV === 'live'
        ? 'https://resources.oscato.com/paymentpage/v3/responsive.html'
        : 'https://resources.sandbox.oscato.com/paymentpage/v3/responsive.html');
}

// OPG requires these vendor content types on every call.
define('PAYONEER_CONTENT_TYPE', 'application/vnd.optile.payment.enterprise-v1-extensible+json');

define('PAYONEER_CURRENCY', 'USD');
define('PAYONEER_BRAND_NAME', 'Novelio Technologies');

// Guard rails for custom / one-off payments (the /pay page) — same bounds as PayPal.
if (!defined('PAYONEER_CUSTOM_MIN')) define('PAYONEER_CUSTOM_MIN', 1);
if (!defined('PAYONEER_CUSTOM_MAX')) define('PAYONEER_CUSTOM_MAX', 50000);

// Completed orders + who to notify. Reuses the SAME order log as PayPal so all
// payments (both gateways) land in one place, above the web root.
if (!defined('PAYONEER_ORDER_LOG')) {
    define('PAYONEER_ORDER_LOG', $SECRETS_DIR . '/novelio-orders.log');
}
// Short-lived context for in-flight redirects (txn id -> LIST id + amount + meta),
// so the return page can verify a payment after the buyer comes back. Above web root.
if (!defined('PAYONEER_PENDING_LOG')) {
    define('PAYONEER_PENDING_LOG', $SECRETS_DIR . '/novelio-payoneer-pending.jsonl');
}
if (!defined('PAYONEER_NOTIFY_EMAIL')) {
    define('PAYONEER_NOTIFY_EMAIL', 'ajay@noveliotech.com');
}

// Public site origin, used to build absolute return/cancel/notification URLs.
// Derived from the request by default; override with PAYONEER_SITE_URL if needed.
if (!defined('PAYONEER_SITE_URL')) {
    $__envSite = __poyn_env('PAYONEER_SITE_URL');
    if ($__envSite !== '') {
        define('PAYONEER_SITE_URL', rtrim($__envSite, '/'));
    } else {
        // Callback URLs must be absolute + https (the live site is always https).
        $__host = $_SERVER['HTTP_HOST'] ?? 'www.noveliotech.com';
        define('PAYONEER_SITE_URL', 'https://' . $__host);
    }
}

// Shared price table (single source of truth, also used by PayPal).
require __DIR__ . '/../_pricing.php';
$GLOBALS['PAYONEER_PLANS']  = $GLOBALS['NOVELIO_PLANS'];
$GLOBALS['PAYONEER_ADDONS'] = $GLOBALS['NOVELIO_ADDONS'];
