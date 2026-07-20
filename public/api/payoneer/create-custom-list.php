<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payoneer/create-custom-list.php
// Body: { amount, reference?, description?, customer:{name,email} }
// Creates a Payoneer LIST session for a CUSTOM one-off amount (invoices, quotes,
// buyouts) and returns { redirectUrl, ref }. The amount can't be checked against
// a price table, so it's bounded by PAYONEER_CUSTOM_MIN / PAYONEER_CUSTOM_MAX.
// Only WE can create a LIST under our merchant account (needs the token).
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in = poyn_read_json_body();

$amount = isset($in['amount']) ? round((float) $in['amount'], 2) : 0.0;
if ($amount < PAYONEER_CUSTOM_MIN || $amount > PAYONEER_CUSTOM_MAX) {
    poyn_respond(['error' => 'Enter an amount between $' . PAYONEER_CUSTOM_MIN . ' and $' . number_format(PAYONEER_CUSTOM_MAX) . '.'], 400);
}

$reference   = poyn_clean_text($in['reference'] ?? '', 100);
$description = poyn_clean_text($in['description'] ?? '', 120);
if ($description === '') {
    $description = 'Novelio Technologies — payment' . ($reference !== '' ? ' (' . $reference . ')' : '');
}
$customer = isset($in['customer']) && is_array($in['customer']) ? $in['customer'] : [];

$txn = poyn_new_txn_id();
$returnBase = PAYONEER_SITE_URL . '/payoneer/return?ref=' . rawurlencode($txn);

$transaction = [
    'transactionId' => $txn,
    'country'       => 'US',
    'payment' => [
        'amount'    => (float) $amount,
        'currency'  => PAYONEER_CURRENCY,
        'reference' => $reference !== '' ? $reference : poyn_clean_text($description, 120),
    ],
    'callback' => [
        'returnUrl'       => $returnBase,
        'cancelUrl'       => $returnBase . '&cancelled=1',
        'notificationUrl' => PAYONEER_SITE_URL . '/api/payoneer/notify.php?txn=' . rawurlencode($txn),
    ],
    'style'    => ['hostedVersion' => 'v3', 'language' => 'en'],
    'customer' => ['email' => poyn_clean_text($customer['email'] ?? '', 120)],
];

[$code, $body] = poyn_create_list($transaction);

$self   = $body['links']['self'] ?? '';
$longId = $body['identification']['longId'] ?? '';

if ($code < 200 || $code >= 300 || $self === '') {
    error_log('[payoneer] create-custom-list failed (' . $code . '): ' . json_encode($body));
    poyn_respond(['error' => 'Could not start the payment. Please try again.'], 502);
}

poyn_pending_put($txn, [
    'type'        => 'custom',
    'long_id'     => $longId,
    'self'        => $self,
    'amount'      => (float) $amount,
    'currency'    => PAYONEER_CURRENCY,
    'description' => $description,
    'breakdown'   => $reference !== '' ? ['Ref: ' . $reference] : [],
    'reference'   => $reference,
    'customer'    => [
        'name'  => poyn_clean_text($customer['name'] ?? '', 120),
        'email' => poyn_clean_text($customer['email'] ?? '', 120),
    ],
]);

poyn_respond([
    'redirectUrl' => PAYONEER_PAGE_BASE . '?listUrl=' . rawurlencode($self),
    'ref'         => $txn,
]);
