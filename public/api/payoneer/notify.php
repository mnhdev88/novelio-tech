<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payoneer/notify.php?txn=...
// Payoneer's asynchronous status notification (webhook) for a LIST. Because the
// exact notification body + signature scheme is account-specific, we do NOT trust
// the POST body for the decision — we only use it to learn WHICH payment changed,
// then RE-READ the LIST from Payoneer (authoritative) and finalize idempotently.
// Always answers 200 so Payoneer doesn't retry forever.
//
// HARDENING TODO (see PAYONEER-SETUP.md): once you confirm the signature scheme
// in your account (e.g. an HMAC header), verify it here before acting.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

// Identify the payment: prefer our own ?txn= on the URL; fall back to the body.
$txn = isset($_GET['txn']) ? (string) $_GET['txn'] : '';
$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
if ($txn === '' && is_array($body)) {
    $txn = (string) ($body['transactionId']
        ?? ($body['identification']['transactionId'] ?? ''));
}

$ctx = ($txn !== '') ? poyn_pending_get($txn) : null;
if ($ctx === null) {
    error_log('[payoneer] notify: unknown txn=' . $txn . ' body=' . substr($raw, 0, 500));
    poyn_respond(['ok' => true]); // ack anyway
}

$longId = (string) ($ctx['long_id'] ?? '');
if (poyn_already_finalized($longId)) {
    poyn_respond(['ok' => true]); // nothing to do
}

// Re-read the authoritative resource and finalize only if it shows a paid state.
[$code, $listBody] = poyn_get_list((string) ($ctx['self'] ?? ''), $longId);
if ($code >= 200 && $code < 300 && is_array($listBody) && poyn_result_status($listBody) === 'paid') {
    poyn_finalize_from_ctx($ctx);
}

poyn_respond(['ok' => true]);
