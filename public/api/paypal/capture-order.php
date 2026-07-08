<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/paypal/capture-order.php
// Captures a PayPal order server-side, VERIFIES it completed, then logs + emails.
//
// Two modes:
//   plan   (default) — body: { orderID, planId, billing, addonIds, customer }
//                       recomputes the expected amount and checks it to the cent.
//   custom          — body: { orderID, mode:"custom", reference, description, customer }
//                       amount was fixed when the order was created server-side, so
//                       we log the actual captured value (no price table to match).
// Returns { status: "COMPLETED", ... } only when the money actually landed.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in = read_json_body();
$orderID  = isset($in['orderID']) ? (string) $in['orderID'] : '';
$mode     = (isset($in['mode']) && $in['mode'] === 'custom') ? 'custom' : 'plan';
$customer = isset($in['customer']) && is_array($in['customer']) ? $in['customer'] : [];

if ($orderID === '') {
    respond(['error' => 'Missing order reference.'], 400);
}

// For plan orders, recompute the expected amount independently (defense in depth).
$expected = null;
$description = '';
$breakdown = [];
if ($mode === 'plan') {
    $planId   = isset($in['planId']) ? (string) $in['planId'] : '';
    $billing  = isset($in['billing']) ? (string) $in['billing'] : 'monthly';
    $addonIds = isset($in['addonIds']) && is_array($in['addonIds']) ? $in['addonIds'] : [];
    [$expected, $description, $breakdown] = compute_charge($planId, $billing, $addonIds);
} else {
    $planId  = 'custom';
    $billing = 'one-time';
    $reference = clean_text($in['reference'] ?? '', 100);
    $description = clean_text($in['description'] ?? '', 120);
    if ($description === '') {
        $description = 'Custom payment' . ($reference !== '' ? ' (' . $reference . ')' : '');
    }
    if ($reference !== '') $breakdown[] = 'Ref: ' . $reference;
}

$token = paypal_access_token();

[$code, $body] = paypal_http('POST', '/v2/checkout/orders/' . rawurlencode($orderID) . '/capture', [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
]);

// PayPal returns 201 on a fresh capture (200 if already captured/idempotent).
if (($code !== 201 && $code !== 200) || ($body['status'] ?? '') !== 'COMPLETED') {
    error_log('[paypal] capture failed (' . $code . '): ' . json_encode($body));
    respond(['error' => 'Payment could not be confirmed. You were not charged, or the charge is pending.'], 402);
}

// Dig out the capture details.
$capture = $body['purchase_units'][0]['payments']['captures'][0] ?? null;
$paidValue    = $capture['amount']['value'] ?? null;
$paidCurrency = $capture['amount']['currency_code'] ?? null;

if ($paidValue === null || $paidCurrency !== PAYPAL_CURRENCY) {
    error_log('[paypal] capture missing amount: order=' . $orderID . ' body=' . json_encode($body));
    respond(['error' => 'Payment could not be confirmed. Please contact support.'], 402);
}

// Plan orders: the captured amount must match what we expected, to the cent.
if ($mode === 'plan' && money($paidValue) !== money($expected)) {
    error_log('[paypal] AMOUNT MISMATCH order=' . $orderID
        . ' expected=' . money($expected) . ' paid=' . $paidValue . ' ' . $paidCurrency);
    respond(['error' => 'Payment amount mismatch. Please contact support — do not retry.'], 409);
}

$record = [
    'ts'             => gmdate('c'),
    'env'            => PAYPAL_ENV,
    'type'           => $mode,
    'order_id'       => $orderID,
    'capture_id'     => $capture['id'] ?? '',
    'amount'         => (float) $paidValue,
    'currency'       => $paidCurrency,
    'plan_id'        => $planId,
    'billing'        => $billing,
    'description'    => $description,
    'breakdown'      => $breakdown,
    'customer_id'    => $customer['id'] ?? '',
    'customer_name'  => $customer['name'] ?? '',
    'customer_email' => $customer['email'] ?? '',
    'payer_email'    => $body['payer']['email_address'] ?? '',
];

log_order($record);
notify_team($record);

respond([
    'status'    => 'COMPLETED',
    'orderId'   => $orderID,
    'captureId' => $record['capture_id'],
    'amount'    => $record['amount'],
    'currency'  => $record['currency'],
]);
