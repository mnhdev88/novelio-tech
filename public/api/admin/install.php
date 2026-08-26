<?php
// ─────────────────────────────────────────────────────────────────────────────
// One-time installer: creates the data folder and the first admin account.
//
//   POST /api/admin/install.php
//   { "key": "<ADMIN_INSTALL_KEY>", "name": "...", "email": "...", "password": "..." }
//
// Refuses to run once an admin account exists, so it is safe to leave deployed
// (it ships in dist/ and the FTPS mirror would restore it anyway if deleted).
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_lib.php';

a_method('POST');
$in = a_body();

if (ADMIN_INSTALL_KEY === '' || !hash_equals(ADMIN_INSTALL_KEY, (string) ($in['key'] ?? ''))) {
    // Same delay/message either way so this can't be used to probe for the key.
    usleep(400000);
    a_fail('Install key is missing or incorrect.', 403, 'bad_install_key');
}

// Touching the store creates the data directory (above the web root) and
// surfaces a permissions problem here, at install time, rather than on the
// client's first save.
store_dir();

foreach (a_users() as $u) {
    if (($u['role'] ?? '') === 'admin') {
        a_respond([
            'ok'      => true,
            'created' => false,
            'message' => 'Storage is ready. An admin account already exists, so none was created.',
        ]);
    }
}

$name     = trim((string) ($in['name'] ?? ''));
$email    = strtolower(trim((string) ($in['email'] ?? '')));
$password = (string) ($in['password'] ?? '');

if ($name === '') a_fail('Name is required.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) a_fail('A valid email is required.');
if (strlen($password) < 12) a_fail('Choose a password of at least 12 characters.');

$hash = password_hash($password, PASSWORD_DEFAULT);
store_mutate(A_USERS, function ($users) use ($name, $email, $hash) {
    $users[] = [
        'id'            => store_id(),
        'name'          => $name,
        'email'         => $email,
        'password_hash' => $hash,
        'role'          => 'admin',
        'status'        => 'active',
        'failed_count'  => 0,
        'locked_until'  => null,
        'last_login_at' => null,
        'created_at'    => gmdate('c'),
    ];
    return $users;
});

a_respond([
    'ok'      => true,
    'created' => true,
    'message' => 'Admin account created. Sign in at /admin, then delete ADMIN_INSTALL_KEY from the credentials file.',
]);
