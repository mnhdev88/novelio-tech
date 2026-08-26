<?php
// GET /api/admin/audit.php?page=&action=&user=   -> who changed what, newest first.
// Admin-only: it is the record that makes multi-user editing accountable, so an
// editor must not be able to read (or reason about) it.
//
// Backed by an append-only JSONL file. Filtering happens in PHP rather than SQL,
// which is fine at this size — the log gains a few thousand lines a year.

require_once __DIR__ . '/_lib.php';

a_method('GET');
a_require('audit.read');

$rows = store_all(A_AUDIT);        // newest first

$action = a_clean_line($_GET['action'] ?? '', 60);
$user   = a_clean_line($_GET['user'] ?? '', 190);

// Collected before filtering so the dropdown always offers every action that
// exists, not just the ones matching the current filter.
$actions = [];
foreach ($rows as $r) {
    if (!empty($r['action'])) $actions[$r['action']] = true;
}
$actions = array_keys($actions);
sort($actions);

if ($action !== '' || $user !== '') {
    $rows = array_values(array_filter($rows, function ($r) use ($action, $user) {
        if ($action !== '' && ($r['action'] ?? '') !== $action) return false;
        if ($user !== '' && ($r['user_email'] ?? '') !== $user) return false;
        return true;
    }));
}

$total = count($rows);
$per   = 100;
$page  = max(1, (int) ($_GET['page'] ?? 1));

a_respond([
    'items'   => array_slice($rows, ($page - 1) * $per, $per),
    'total'   => $total,
    'page'    => $page,
    'pages'   => max(1, (int) ceil($total / $per)),
    'actions' => $actions,
]);
