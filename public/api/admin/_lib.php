<?php
// ─────────────────────────────────────────────────────────────────────────────
// Admin panel — shared helpers: JSON I/O, auth guard, roles, CSRF, audit log.
// Every endpoint in this directory starts by requiring this file.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_store.php';

// ── JSON I/O ─────────────────────────────────────────────────────────────────

function a_respond($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode($data);
    exit;
}

function a_fail($message, $status = 400, $code = null) {
    a_respond(array_filter(['error' => $message, 'code' => $code]), $status);
}

/** The raw request body, cached so it can be parsed more than once per request. */
function a_raw_body() {
    static $raw = null;
    if ($raw === null) $raw = (string) file_get_contents('php://input');
    return $raw;
}

function a_body() {
    $data = json_decode(a_raw_body(), true);
    return is_array($data) ? $data : [];
}

/**
 * Encode content EXACTLY the way the repo already stores it.
 *
 * Two details matter, and both would otherwise corrupt every published file:
 *
 *  1. Indentation. PHP's JSON_PRETTY_PRINT uses four spaces; every file in
 *     content/ was written by JS with two. Without this, the first publish
 *     reformats every line of every file into one unreadable diff.
 *     Halving the leading indent is safe because JSON never contains a literal
 *     newline inside a string, so every line break is structural.
 *
 *  2. Objects vs arrays. Callers MUST hand this stdClass-decoded data (i.e.
 *     json_decode($raw) with no `true`). An empty JSON object decoded as an
 *     associative array comes back as [], and re-encodes to "[]" — silently
 *     turning content/seo/pages.json from {} into [].
 */
function a_json_pretty($value) {
    $json = json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) return false;

    $json = preg_replace_callback('/^(?: {4})+/m', function ($m) {
        return str_repeat(' ', strlen($m[0]) / 2);
    }, $json);

    return $json . "
";   // the repo's files all end with a newline
}

function a_method($allowed) {
    $m = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($m, (array) $allowed, true)) a_fail('Method not allowed', 405);
    return $m;
}

function a_ip() {
    return substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
}

// ── CSRF ─────────────────────────────────────────────────────────────────────
// The session cookie is SameSite=Lax, which already blocks cross-site POSTs from
// forms. The token is the second layer, and is what makes a stolen-cookie-in-an-
// iframe scenario useless. Issued at login, echoed in X-Admin-Token.

function a_csrf_token() {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function a_check_csrf() {
    $sent = $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    if (empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sent)) {
        a_fail('Your session expired. Please sign in again.', 419, 'csrf');
    }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

// ── Users ────────────────────────────────────────────────────────────────────
// A handful of records, so the whole list is read and written as one document.
// Every mutation goes through store_mutate(), which holds an exclusive lock for
// the read-modify-write — two admins editing the team at once cannot clobber
// each other.

const A_USERS = 'users.json';

function a_users() { return store_get(A_USERS, []); }

function a_find_user($field, $value) {
    foreach (a_users() as $u) {
        if (isset($u[$field]) && (string) $u[$field] === (string) $value) return $u;
    }
    return null;
}

/** Apply $fn to the user with this id and save. Returns the updated user. */
function a_update_user($id, callable $fn) {
    $updated = null;
    store_mutate(A_USERS, function ($users) use ($id, $fn, &$updated) {
        foreach ($users as $i => $u) {
            if ((string) $u['id'] === (string) $id) {
                $users[$i] = $fn($u);
                $updated = $users[$i];
                break;
            }
        }
        return $users;
    });
    return $updated;
}

/** The signed-in user, or null. Re-read per request so a disabled account
 *  loses access immediately instead of at next login. */
function a_user() {
    static $user = null;
    if ($user !== null) return $user ?: null;
    $id = $_SESSION['uid'] ?? null;
    if (!$id) { $user = false; return null; }

    $row = a_find_user('id', $id);
    if (!$row || ($row['status'] ?? '') !== 'active') {
        $_SESSION = [];
        $user = false;
        return null;
    }
    // Never let the hash travel further than it has to.
    unset($row['password_hash']);
    $user = $row;
    return $row;
}

/**
 * Gate an endpoint. Pass a capability (see A_CAPS) to also require permission.
 * Mutating requests additionally require a valid CSRF token.
 */
function a_require($capability = null) {
    $u = a_user();
    if (!$u) a_fail('Not signed in.', 401, 'unauthenticated');

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') a_check_csrf();

    if ($capability !== null && !a_can($u, $capability)) {
        a_fail('Your account does not have permission to do that.', 403, 'forbidden');
    }
    return $u;
}

// What each role may do. Editors run the site's content day to day; anything
// that can cost money, change who has access, or rewrite history is admin-only.
const A_CAPS = [
    'admin' => [
        'content.read', 'content.write', 'content.publish',
        'media.upload', 'leads.read', 'leads.write',
        'pricing.write', 'users.manage', 'audit.read',
    ],
    'editor' => [
        'content.read', 'content.write', 'content.publish',
        'media.upload', 'leads.read', 'leads.write',
    ],
];

function a_can($user, $capability) {
    $caps = A_CAPS[$user['role']] ?? [];
    return in_array($capability, $caps, true);
}

// ── Login throttling ─────────────────────────────────────────────────────────
// Lockout is per-account rather than per-IP: the panel has a handful of known
// users, so locking the account is the behaviour that actually stops a guessing
// run, and it can't be used to lock out an entire office by spoofing an IP.

const A_MAX_ATTEMPTS = 6;
const A_LOCK_MINUTES = 15;

function a_note_failure(array $user) {
    a_update_user($user['id'], function ($u) {
        $count = (int) ($u['failed_count'] ?? 0) + 1;
        if ($count >= A_MAX_ATTEMPTS) {
            $u['failed_count'] = 0;
            $u['locked_until'] = gmdate('c', time() + A_LOCK_MINUTES * 60);
        } else {
            $u['failed_count'] = $count;
        }
        return $u;
    });
}

function a_clear_failures($id) {
    a_update_user($id, function ($u) {
        $u['failed_count']  = 0;
        $u['locked_until']  = null;
        $u['last_login_at'] = gmdate('c');
        return $u;
    });
}

/** Is this account inside a lockout window right now? */
function a_is_locked(array $user) {
    $until = $user['locked_until'] ?? null;
    return $until && strtotime($until) > time();
}

// ── Audit ────────────────────────────────────────────────────────────────────

const A_AUDIT = 'audit.jsonl';

function a_audit($action, $target = null, $meta = null) {
    $u = a_user();
    try {
        store_append(A_AUDIT, [
            'user_id'    => $u['id'] ?? null,
            'user_email' => $u['email'] ?? null,
            'action'     => $action,
            'target'     => $target !== null ? mb_substr((string) $target, 0, 255) : null,
            'meta'       => $meta,
            'ip'         => a_ip(),
        ]);
    } catch (Throwable $e) {
        // An audit write must never take down the action it is recording.
        @error_log('[admin] audit write failed: ' . $e->getMessage());
    }
}

// ── Content path safety ──────────────────────────────────────────────────────

/**
 * Validate a repo-relative content path against the write whitelist.
 * The GitHub token can write the whole repo, so this is the boundary that stops
 * the panel from ever touching src/, workflows, or PHP.
 */
function a_safe_path($path) {
    $path = (string) $path;
    if ($path === '' || strlen($path) > 200) a_fail('Invalid content path.', 400);
    if (strpos($path, '..') !== false || strpos($path, '//') !== false || $path[0] === '/') {
        a_fail('Invalid content path.', 400);
    }
    if (!preg_match('#^[A-Za-z0-9._/-]+$#', $path)) a_fail('Invalid content path.', 400);

    foreach ($GLOBALS['ADMIN_WRITABLE'] as $prefix) {
        if (strncmp($path, $prefix, strlen($prefix)) === 0) return $path;
    }
    a_fail('That file is not editable from the panel.', 403, 'not_writable');
}

/** Collapse free text to one clean, length-capped line (commit messages, labels). */
function a_clean_line($s, $max = 120) {
    $s = is_string($s) ? $s : '';
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s);
    $s = trim(preg_replace('/\s+/u', ' ', $s));
    return mb_substr($s, 0, $max);
}

/** Slug used for blog files and image names. */
function a_slug($s) {
    $s = strtolower(trim((string) $s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-');
}
