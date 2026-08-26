<?php
// ─────────────────────────────────────────────────────────────────────────────
// Leads, newsletter subscribers and job applications.
//
//   GET  ?type=leads|newsletter|applications&status=&q=&page=
//   GET  ?type=leads&export=csv
//   POST { type, id, status }          -> update a status
//
// Capture (the public form posting a NEW lead) lives in capture.php, which is
// unauthenticated by necessity — keeping it separate keeps this file behind auth.
//
// Each type is an append-only JSONL file. Filtering and paging happen in PHP;
// at a few hundred records a year that is far cheaper than running a database.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_lib.php';

$method = a_method(['GET', 'POST']);
$user = a_require($method === 'GET' ? 'leads.read' : 'leads.write');

// The only types that exist, and the only statuses each may hold. Anything not
// named here is rejected — this list is also what stops a request choosing an
// arbitrary file to read.
const LEAD_TYPES = [
    'leads'        => ['new', 'contacted', 'won', 'lost', 'spam'],
    'newsletter'   => ['subscribed', 'unsubscribed'],
    'applications' => ['new', 'reviewing', 'rejected', 'hired'],
];

function lead_store($type) { return $type . '.jsonl'; }

$in = $method === 'POST' ? a_body() : [];
$type = $method === 'POST'
    ? (string) ($in['type'] ?? '')
    : (string) ($_GET['type'] ?? '');

if (!isset(LEAD_TYPES[$type])) a_fail('Unknown record type.', 400);

// ── POST: change a status ────────────────────────────────────────────────────
if ($method === 'POST') {
    $id = (string) ($in['id'] ?? '');
    $status = (string) ($in['status'] ?? '');
    if (!in_array($status, LEAD_TYPES[$type], true)) a_fail('Unknown status.', 400);

    $found = false;
    store_rewrite(lead_store($type), function ($rows) use ($id, $status, &$found) {
        foreach ($rows as $i => $r) {
            if ((string) ($r['id'] ?? '') === $id) {
                $rows[$i]['status'] = $status;
                $found = true;
                break;
            }
        }
        return $rows;
    });

    if (!$found) a_fail('No such record.', 404);

    a_audit('leads.status', $type . '#' . $id, ['status' => $status]);
    a_respond(['ok' => true]);
}

// ── GET: list / export ───────────────────────────────────────────────────────
$rows = store_all(lead_store($type));      // newest first

// Status counts come from the unfiltered set so the totals stay stable while
// someone is filtering.
$counts = [];
foreach ($rows as $r) {
    $s = $r['status'] ?? '';
    $counts[$s] = ($counts[$s] ?? 0) + 1;
}

$status = (string) ($_GET['status'] ?? '');
if ($status !== '' && in_array($status, LEAD_TYPES[$type], true)) {
    $rows = array_values(array_filter($rows, function ($r) use ($status) {
        return ($r['status'] ?? '') === $status;
    }));
}

$q = a_clean_line($_GET['q'] ?? '', 80);
if ($q !== '') {
    $cols = $type === 'newsletter' ? ['email'] : ['name', 'email', 'phone'];
    $needle = mb_strtolower($q);
    $rows = array_values(array_filter($rows, function ($r) use ($cols, $needle) {
        foreach ($cols as $c) {
            if (mb_strpos(mb_strtolower((string) ($r[$c] ?? '')), $needle) !== false) return true;
        }
        return false;
    }));
}

// ── CSV export ───────────────────────────────────────────────────────────────
if (($_GET['export'] ?? '') === 'csv') {
    a_audit('leads.export', $type, ['count' => count($rows)]);

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $type . '-' . gmdate('Y-m-d') . '.csv"');

    $out = fopen('php://output', 'w');
    if ($rows) {
        // Records are schemaless, so the header is the union of every key rather
        // than whatever the first row happens to have.
        $cols = [];
        foreach ($rows as $r) foreach (array_keys($r) as $k) $cols[$k] = true;
        $cols = array_keys($cols);
        fputcsv($out, $cols);

        foreach ($rows as $r) {
            $line = [];
            foreach ($cols as $c) {
                $v = $r[$c] ?? '';
                if (is_array($v)) $v = json_encode($v);
                $v = (string) $v;
                // A leading =, +, - or @ makes Excel treat the cell as a formula,
                // so any such value gets a quote prefix before it reaches a sheet.
                $line[] = ($v !== '' && strpbrk($v[0], "=+-@") !== false) ? "'" . $v : $v;
            }
            fputcsv($out, $line);
        }
    }
    fclose($out);
    exit;
}

$total = count($rows);
$per   = 50;
$page  = max(1, (int) ($_GET['page'] ?? 1));

a_respond([
    'type'   => $type,
    'items'  => array_slice($rows, ($page - 1) * $per, $per),
    'total'  => $total,
    'page'   => $page,
    'pages'  => max(1, (int) ceil($total / $per)),
    'counts' => $counts,
]);
