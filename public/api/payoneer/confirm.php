<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payoneer/confirm.php
// Body: { ref }  (the txn id we put in the hosted-page returnUrl)
// Called by the /payoneer/return page after the buyer comes back. Looks up the
// server-side pending context, RE-READS the LIST from Payoneer (authoritative),
// and only reports success when the resource shows a paid status. Logs + emails
// exactly once. Never trusts the browser for the amount or the outcome.
//
// Returns one of:
//   { status:"COMPLETED", amount, currency, type, planId, billing, addonIds, customer }
//   { status:"PENDING" }        — paid state not visible yet; the page can retry
//   { status:"FAILED", error }  — cancelled/declined/expired
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in  = poyn_read_json_body();
$txn = isset($in['ref']) ? (string) $in['ref'] : '';
if ($txn === '') {
    poyn_respond(['error' => 'Missing payment reference.'], 400);
}

$ctx = poyn_pending_get($txn);
if ($ctx === null) {
    poyn_respond(['error' => 'We could not find this payment session. Please contact us before retrying.'], 404);
}

$longId = (string) ($ctx['long_id'] ?? '');
$self   = (string) ($ctx['self'] ?? '');

// Success shape the front-end uses to create the subscription / show the receipt.
$success = function ($ctx) use ($txn) {
    return [
        'status'   => 'COMPLETED',
        'type'     => $ctx['type'] ?? 'plan',
        'amount'   => (float) ($ctx['amount'] ?? 0),
        'currency' => $ctx['currency'] ?? PAYONEER_CURRENCY,
        'planId'   => $ctx['planId'] ?? null,
        'billing'  => $ctx['billing'] ?? null,
        'addonIds' => $ctx['addonIds'] ?? [],
        'reference'=> $ctx['reference'] ?? '',
        'customer' => $ctx['customer'] ?? [],
        'ref'      => $txn,
    ];
};

// Already recorded (webhook may have finalized first) → report success, no re-log.
if (poyn_already_finalized($longId)) {
    poyn_respond($success($ctx));
}

[$code, $body] = poyn_get_list($self, $longId);
if ($code < 200 || $code >= 300 || !is_array($body)) {
    error_log('[payoneer] confirm get-list failed (' . $code . '): ' . json_encode($body));
    poyn_respond(['status' => 'PENDING']);
}

$state = poyn_result_status($body);

if ($state === 'paid') {
    // Defense in depth: for plan orders, re-derive the expected amount and make
    // sure it matches the amount we set when creating the LIST.
    if (($ctx['type'] ?? '') === 'plan') {
        [$expected] = poyn_compute_charge($ctx['planId'] ?? '', $ctx['billing'] ?? 'monthly', $ctx['addonIds'] ?? []);
        if (poyn_money($expected) !== poyn_money($ctx['amount'] ?? 0)) {
            error_log('[payoneer] AMOUNT MISMATCH txn=' . $txn . ' long=' . $longId
                . ' expected=' . poyn_money($expected) . ' pending=' . poyn_money($ctx['amount'] ?? 0));
            poyn_respond(['error' => 'Payment amount mismatch. Please contact support — do not retry.'], 409);
        }
    }
    poyn_finalize_from_ctx($ctx);
    poyn_respond($success($ctx));
}

if ($state === 'failed') {
    poyn_respond(['status' => 'FAILED', 'error' => 'The payment was cancelled or could not be completed. You have not been charged.']);
}

// Interim / not-yet-visible → let the page poll a couple of times.
poyn_respond(['status' => 'PENDING']);
