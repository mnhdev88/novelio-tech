<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payoneer/create-list.php
// Body: { planId, billing:"monthly"|"yearly", addonIds:[], customer:{id,name,email} }
// Creates a Payoneer LIST session for the SERVER-computed amount and returns
// { redirectUrl, ref }. The browser then redirects the buyer to redirectUrl
// (Payoneer's hosted payment page). The price is set here — never by the browser.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in = poyn_read_json_body();
$planId   = isset($in['planId']) ? (string) $in['planId'] : '';
$billing  = isset($in['billing']) ? (string) $in['billing'] : 'monthly';
$addonIds = isset($in['addonIds']) && is_array($in['addonIds']) ? array_values($in['addonIds']) : [];
$customer = isset($in['customer']) && is_array($in['customer']) ? $in['customer'] : [];

[$amount, $description, $breakdown] = poyn_compute_charge($planId, $billing, $addonIds);

$txn = poyn_new_txn_id();
$returnBase = PAYONEER_SITE_URL . '/payoneer/return?ref=' . rawurlencode($txn);

$transaction = [
    'transactionId' => $txn,
    'country'       => 'US',
    'payment' => [
        'amount'    => (float) $amount,
        'currency'  => PAYONEER_CURRENCY,
        'reference' => poyn_clean_text($description, 120),
    ],
    'callback' => [
        'returnUrl'       => $returnBase,
        'cancelUrl'       => $returnBase . '&cancelled=1',
        'notificationUrl' => PAYONEER_SITE_URL . '/api/payoneer/notify.php?txn=' . rawurlencode($txn),
    ],
    'style'    => ['hostedVersion' => 'v3', 'language' => 'en'],
    'customer' => [
        'number' => poyn_clean_text($customer['id'] ?? '', 60),
        'email'  => poyn_clean_text($customer['email'] ?? '', 120),
    ],
];

[$code, $body] = poyn_create_list($transaction);

$self   = $body['links']['self'] ?? '';
$longId = $body['identification']['longId'] ?? '';

if ($code < 200 || $code >= 300 || $self === '') {
    error_log('[payoneer] create-list failed (' . $code . '): ' . json_encode($body));
    poyn_respond(['error' => 'Could not start the payment. Please try again.'], 502);
}

poyn_pending_put($txn, [
    'type'        => 'plan',
    'long_id'     => $longId,
    'self'        => $self,
    'amount'      => (float) $amount,
    'currency'    => PAYONEER_CURRENCY,
    'description' => $description,
    'breakdown'   => $breakdown,
    'planId'      => $planId,
    'billing'     => ($billing === 'yearly') ? 'yearly' : 'monthly',
    'addonIds'    => $addonIds,
    'customer'    => [
        'id'    => $customer['id'] ?? '',
        'name'  => poyn_clean_text($customer['name'] ?? '', 120),
        'email' => poyn_clean_text($customer['email'] ?? '', 120),
    ],
]);

poyn_respond([
    'redirectUrl' => PAYONEER_PAGE_BASE . '?listUrl=' . rawurlencode($self),
    'ref'         => $txn,
]);
