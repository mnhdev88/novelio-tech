<?php
// ─────────────────────────────────────────────────────────────────────────────
// Admin panel — configuration + credential loading.
//
// Mirrors the PayPal integration's approach (see ../paypal/_config.php): secrets
// live ABOVE the web root because the site deploys as an FTPS mirror of dist/,
// which both deletes stray files inside public_html and exposes everything in it.
// ─────────────────────────────────────────────────────────────────────────────

error_reporting(E_ALL);
ini_set('display_errors', '0');

$__docroot = isset($_SERVER['DOCUMENT_ROOT']) && $_SERVER['DOCUMENT_ROOT']
    ? $_SERVER['DOCUMENT_ROOT']
    : dirname(__DIR__, 3);
$ADMIN_SECRETS_DIR = dirname($__docroot);

function __admin_env($key) {
    $v = getenv($key);
    if ($v === false || $v === '') $v = $_SERVER[$key] ?? ($_ENV[$key] ?? '');
    return ($v === false) ? '' : $v;
}

// Env vars first (Hostinger hPanel), then the above-webroot file, then a local
// dev copy for `php -S` work.
$__admin_loaded = false;
foreach (['ADMIN_GH_OWNER','ADMIN_GH_REPO','ADMIN_GH_BRANCH','ADMIN_GH_TOKEN',
          'ADMIN_INSTALL_KEY','ADMIN_NOTIFY_EMAIL'] as $__k) {
    $__v = __admin_env($__k);
    if ($__v !== '' && !defined($__k)) define($__k, $__v);
}
if (defined('ADMIN_GH_TOKEN')) $__admin_loaded = true;

if (!$__admin_loaded) {
    foreach ([
        $ADMIN_SECRETS_DIR . '/novelio-admin-credentials.php',
        __DIR__ . '/credentials.local.php',
    ] as $__candidate) {
        if (is_file($__candidate)) { require $__candidate; $__admin_loaded = true; break; }
    }
}

if (!$__admin_loaded || !defined('ADMIN_GH_TOKEN')) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'The admin panel is not configured on this server yet.', 'code' => 'not_configured']);
    exit;
}

if (!defined('ADMIN_GH_BRANCH'))   define('ADMIN_GH_BRANCH', 'main');
if (!defined('ADMIN_NOTIFY_EMAIL')) define('ADMIN_NOTIFY_EMAIL', 'ajay@noveliotech.com');
if (!defined('ADMIN_INSTALL_KEY'))  define('ADMIN_INSTALL_KEY', '');

// Content files the panel is allowed to write, as a whitelist of path prefixes.
// A save request naming anything outside these is rejected — the GitHub token can
// write the whole repo, so this is the boundary that keeps the panel from being
// able to rewrite source code or the deploy workflow.
$GLOBALS['ADMIN_WRITABLE'] = [
    'content/',      // all site content JSON
    'public/blog/',  // blog/media images
];

// Where an unrecoverable server-side error gets logged (above the web root).
if (!defined('ADMIN_LOG')) define('ADMIN_LOG', $ADMIN_SECRETS_DIR . '/novelio-admin.log');

// Panel data (users, drafts, leads, audit). A constant rather than a global so
// it still resolves correctly no matter what scope this file gets included in.
// Must stay ABOVE the web root: the FTPS deploy mirrors dist/ and deletes
// anything under public_html that isn't part of the build.
if (!defined('ADMIN_DATA_DIR')) define('ADMIN_DATA_DIR', $ADMIN_SECRETS_DIR . '/novelio-admin-data');

// Session cookie hardening. The panel is same-origin with the site, so a plain
// PHP session is enough — no token juggling in localStorage.
if (session_status() === PHP_SESSION_NONE) {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('novelio_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,
        'secure'   => $https,
        'samesite' => 'Lax',
    ]);
    session_start();
}
