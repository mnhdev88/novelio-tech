<?php
// ─────────────────────────────────────────────────────────────────────────────
// Free SEO Audit — configuration + credential loading.
//
// Mirrors the other integrations (see ../razorpay/_config.php): the API key
// lives ABOVE the web root because the site deploys as an FTPS mirror of dist/,
// which both deletes stray files inside public_html and exposes everything in it.
//
// Unlike the payment gateways, a missing key is NOT fatal here. The audit is
// mostly HTML analysis the server does itself; PageSpeed only adds the Speed
// section. So an unconfigured server still returns a useful report, minus that
// one section — a lead magnet that half-works beats one that 503s.
// ─────────────────────────────────────────────────────────────────────────────

error_reporting(E_ALL);
ini_set('display_errors', '0');

$__docroot = isset($_SERVER['DOCUMENT_ROOT']) && $_SERVER['DOCUMENT_ROOT']
    ? $_SERVER['DOCUMENT_ROOT']
    : dirname(__DIR__, 3);
$AUDIT_SECRETS_DIR = dirname($__docroot);

function __audit_env($key) {
    $v = getenv($key);
    if ($v === false || $v === '') $v = $_SERVER[$key] ?? ($_ENV[$key] ?? '');
    return ($v === false) ? '' : $v;
}

// Env vars first (Hostinger hPanel), then the above-webroot file, then a local
// dev copy for `php -S` work.
foreach (['AUDIT_PSI_KEY', 'AUDIT_NOTIFY_EMAIL'] as $__k) {
    $__v = __audit_env($__k);
    if ($__v !== '' && !defined($__k)) define($__k, $__v);
}

if (!defined('AUDIT_PSI_KEY')) {
    foreach ([
        $AUDIT_SECRETS_DIR . '/novelio-audit-credentials.php',
        __DIR__ . '/credentials.local.php',
    ] as $__candidate) {
        if (is_file($__candidate)) { require $__candidate; break; }
    }
}

// Placeholders count as absent — the template ships with one, and a server where
// nobody finished the setup must behave exactly like a server with no key.
if (!defined('AUDIT_PSI_KEY') || strpos(AUDIT_PSI_KEY, 'PASTE_') === 0) {
    if (!defined('AUDIT_PSI_KEY')) define('AUDIT_PSI_KEY', '');
    define('AUDIT_HAS_PSI', false);
} else {
    define('AUDIT_HAS_PSI', true);
}

if (!defined('AUDIT_CACHE_TTL'))     define('AUDIT_CACHE_TTL', 86400);   // 24h
if (!defined('AUDIT_RATE_PER_HOUR')) define('AUDIT_RATE_PER_HOUR', 10);
if (!defined('AUDIT_NOTIFY_EMAIL'))  define('AUDIT_NOTIFY_EMAIL', 'ajay@noveliotech.com');

// Cached audit results. Sits beside the admin panel's data, above the web root,
// for the same reason: the FTPS deploy wipes anything under public_html that
// isn't part of the build.
if (!defined('AUDIT_CACHE_DIR')) {
    define('AUDIT_CACHE_DIR', $AUDIT_SECRETS_DIR . '/novelio-admin-data/audit-cache');
}

// Fetch limits. A lead magnet must not become a way to make this server hold a
// connection open forever, or download a 4GB "page" into memory.
if (!defined('AUDIT_FETCH_TIMEOUT'))   define('AUDIT_FETCH_TIMEOUT', 15);   // seconds
if (!defined('AUDIT_MAX_BODY_BYTES'))  define('AUDIT_MAX_BODY_BYTES', 3145728); // 3 MB
if (!defined('AUDIT_MAX_REDIRECTS'))   define('AUDIT_MAX_REDIRECTS', 4);
if (!defined('AUDIT_USER_AGENT')) {
    define('AUDIT_USER_AGENT', 'NovelioTechAuditBot/1.0 (+https://www.noveliotech.com/free-seo-audit)');
}
