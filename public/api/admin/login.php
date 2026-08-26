<?php
// POST /api/admin/login.php  { email, password }  -> { user, csrf }
// Also serves GET as a "who am I" probe so the panel can restore a session on
// page load without a round of guessing.

require_once __DIR__ . '/_lib.php';

$method = a_method(['POST', 'GET']);

// ── GET: session probe ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $u = a_user();
    if (!$u) a_respond(['user' => null], 200);
    a_respond(['user' => $u, 'csrf' => a_csrf_token(), 'caps' => A_CAPS[$u['role']] ?? []]);
}

// ── POST: sign in ────────────────────────────────────────────────────────────
$in = a_body();
$email    = strtolower(trim((string) ($in['email'] ?? '')));
$password = (string) ($in['password'] ?? '');

if ($email === '' || $password === '') a_fail('Enter your email and password.');

$user = a_find_user('email', $email);

// Constant-ish work whether or not the account exists, so response timing does
// not reveal which emails are registered.
if (!$user) {
    password_verify($password, '$2y$10$usesomesillystringfore7hnbRJHxXVLeakoG8K30M1MlGZ7EC.');
    usleep(300000);
    a_fail('Email or password is incorrect.', 401, 'bad_credentials');
}

if ($user['status'] !== 'active') {
    a_fail('This account has been disabled. Ask an admin to re-enable it.', 403, 'disabled');
}

if (a_is_locked($user)) {
    $mins = max(1, (int) ceil((strtotime($user['locked_until']) - time()) / 60));
    a_fail("Too many failed attempts. Try again in {$mins} minute(s).", 429, 'locked');
}

if (!password_verify($password, $user['password_hash'])) {
    a_note_failure($user);
    usleep(300000);
    a_fail('Email or password is incorrect.', 401, 'bad_credentials');
}

// Rehash if PHP's default cost has moved on since this password was set.
if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
    $newHash = password_hash($password, PASSWORD_DEFAULT);
    a_update_user($user['id'], function ($u) use ($newHash) {
        $u['password_hash'] = $newHash;
        return $u;
    });
}

// New session id on privilege change — stops session fixation.
session_regenerate_id(true);
$_SESSION['uid'] = $user['id'];
a_csrf_token();
a_clear_failures($user['id']);

$safe = ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'],
         'role' => $user['role'], 'status' => $user['status']];

a_audit('auth.login', $user['email']);

a_respond(['user' => $safe, 'csrf' => $_SESSION['csrf'], 'caps' => A_CAPS[$user['role']] ?? []]);
