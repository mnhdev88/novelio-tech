<?php
// ─────────────────────────────────────────────────────────────────────────────
// Team management (admin only, except "change my own password").
//
//   GET                                  -> list users
//   POST { name, email, password, role } -> invite/create
//   POST { id, ... }                     -> update name/role/status/password
//   DELETE ?id=                          -> remove
//
// Users live in one small JSON document. Every write goes through store_mutate(),
// which holds an exclusive lock across the read-modify-write, so two admins
// editing the team at the same moment cannot overwrite each other's change.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_lib.php';

$method = a_method(['GET', 'POST', 'DELETE']);
$me = a_require();          // capability checked per-branch below

$MIN_PASSWORD = 12;

/** Strip the hash before anything leaves the server. */
function a_public_user(array $u) {
    return [
        'id'            => $u['id'],
        'name'          => $u['name'],
        'email'         => $u['email'],
        'role'          => $u['role'],
        'status'        => $u['status'],
        'last_login_at' => $u['last_login_at'] ?? null,
        'created_at'    => $u['created_at'] ?? null,
    ];
}

/** Active admins, counted from a list we already hold (no second read). */
function a_admin_count(array $users) {
    $n = 0;
    foreach ($users as $u) {
        if (($u['role'] ?? '') === 'admin' && ($u['status'] ?? '') === 'active') $n++;
    }
    return $n;
}

// ── GET ──────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    a_require('users.manage');
    $users = a_users();
    usort($users, function ($a, $b) { return strcmp($a['created_at'] ?? '', $b['created_at'] ?? ''); });
    a_respond(['users' => array_map('a_public_user', $users)]);
}

// ── DELETE ───────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    a_require('users.manage');
    $id = (string) ($_GET['id'] ?? '');
    if ($id === (string) $me['id']) a_fail('You cannot delete your own account.', 400);

    $target = a_find_user('id', $id);
    if (!$target) a_fail('No such user.', 404);

    // Locking everyone out of user management is not a recoverable mistake here.
    if (($target['role'] ?? '') === 'admin' && a_admin_count(a_users()) <= 1) {
        a_fail('This is the last admin account — promote someone else first.', 400, 'last_admin');
    }

    store_mutate(A_USERS, function ($users) use ($id) {
        return array_values(array_filter($users, function ($u) use ($id) {
            return (string) $u['id'] !== $id;
        }));
    });

    a_audit('users.delete', $target['email']);
    a_respond(['ok' => true]);
}

// ── POST ─────────────────────────────────────────────────────────────────────
$in = a_body();
$id = isset($in['id']) ? (string) $in['id'] : '';

// Anyone may change their OWN password; everything else needs users.manage.
$selfPasswordChange = $id !== '' && $id === (string) $me['id']
    && isset($in['password'])
    && !isset($in['role']) && !isset($in['status']) && !isset($in['email']);

if (!$selfPasswordChange) a_require('users.manage');

// ── Create ───────────────────────────────────────────────────────────────────
if ($id === '') {
    $name  = a_clean_line($in['name'] ?? '', 120);
    $email = strtolower(trim((string) ($in['email'] ?? '')));
    $pass  = (string) ($in['password'] ?? '');
    $role  = ($in['role'] ?? 'editor') === 'admin' ? 'admin' : 'editor';

    if ($name === '') a_fail('Name is required.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) a_fail('A valid email is required.');
    if (strlen($pass) < $MIN_PASSWORD) a_fail("Choose a password of at least {$MIN_PASSWORD} characters.");

    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $newId = store_id();
    $duplicate = false;

    // The uniqueness check has to happen INSIDE the lock. Checking first and
    // inserting after would let two simultaneous invites create the same email
    // twice — the race a UNIQUE index used to rule out for us.
    store_mutate(A_USERS, function ($users) use ($email, $name, $hash, $role, $newId, &$duplicate) {
        foreach ($users as $u) {
            if (strtolower($u['email'] ?? '') === $email) { $duplicate = true; return $users; }
        }
        $users[] = [
            'id'            => $newId,
            'name'          => $name,
            'email'         => $email,
            'password_hash' => $hash,
            'role'          => $role,
            'status'        => 'active',
            'failed_count'  => 0,
            'locked_until'  => null,
            'last_login_at' => null,
            'created_at'    => gmdate('c'),
        ];
        return $users;
    });

    if ($duplicate) a_fail('That email already has an account.', 409, 'duplicate');

    a_audit('users.create', $email, ['role' => $role]);
    a_respond(['ok' => true, 'id' => $newId]);
}

// ── Update ───────────────────────────────────────────────────────────────────
$target = a_find_user('id', $id);
if (!$target) a_fail('No such user.', 404);

$users = a_users();
$patch = [];

if (isset($in['name'])) {
    $name = a_clean_line($in['name'], 120);
    if ($name === '') a_fail('Name cannot be empty.');
    $patch['name'] = $name;
}

if (isset($in['role'])) {
    $role = $in['role'] === 'admin' ? 'admin' : 'editor';
    if ($role !== $target['role'] && $target['role'] === 'admin' && a_admin_count($users) <= 1) {
        a_fail('This is the last admin account — promote someone else first.', 400, 'last_admin');
    }
    $patch['role'] = $role;
}

if (isset($in['status'])) {
    $status = $in['status'] === 'disabled' ? 'disabled' : 'active';
    if ($id === (string) $me['id'] && $status === 'disabled') a_fail('You cannot disable your own account.', 400);
    if ($status === 'disabled' && $target['role'] === 'admin' && a_admin_count($users) <= 1) {
        a_fail('This is the last admin account — promote someone else first.', 400, 'last_admin');
    }
    $patch['status'] = $status;
}

if (isset($in['password'])) {
    $pass = (string) $in['password'];
    if (strlen($pass) < $MIN_PASSWORD) a_fail("Choose a password of at least {$MIN_PASSWORD} characters.");

    // Changing your own password requires proving you know the current one, so a
    // walk-up to an unlocked laptop can't quietly take the account over.
    if ($id === (string) $me['id']
        && !password_verify((string) ($in['current_password'] ?? ''), $target['password_hash'])) {
        a_fail('Your current password is incorrect.', 403, 'bad_current_password');
    }
    $patch['password_hash'] = password_hash($pass, PASSWORD_DEFAULT);
    $patch['failed_count']  = 0;
    $patch['locked_until']  = null;
}

if (!$patch) a_fail('Nothing to update.');

a_update_user($id, function ($u) use ($patch) { return array_merge($u, $patch); });

a_audit('users.update', $target['email'], [
    'fields' => array_keys(array_diff_key($in, ['id' => 1, 'password' => 1, 'current_password' => 1])),
]);
a_respond(['ok' => true]);
