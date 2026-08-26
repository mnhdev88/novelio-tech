<?php
// POST /api/admin/logout.php

require_once __DIR__ . '/_lib.php';

a_method('POST');

if (a_user()) {
    a_check_csrf();
    a_audit('auth.logout');
}

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $p = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
}
session_destroy();

a_respond(['ok' => true]);
