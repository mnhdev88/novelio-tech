<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/paypal/create-custom-order.php
// Body: { amount, reference?, description?, customer:{name,email} }
// Creates a PayPal order for a CUSTOM one-off amount (invoices, quotes, buyouts).
// The amount can't be checked against a price table, so it's bounded by
// PAYPAL_CUSTOM_MIN / PAYPAL_CUSTOM_MAX and everything is logged on capture.
// NOTE: only WE can create orders under our merchant account (needs the secret),
// so any order that later captures was created here with a bounded amount.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in = read_json_body();

$amount = isset($in['amount']) ? (float) $in['amount'] : 0.0;
$amount = round($amount, 2);
if ($amount < PAYPAL_CUSTOM_MIN || $amount > PAYPAL_CUSTOM_MAX) {
    respond(['error' => 'Enter an amount between $' . PAYPAL_CUSTOM_MIN . ' and $' . number_format(PAYPAL_CUSTOM_MAX) . '.'], 400);
}

// Labels only — trimmed and length-capped for PayPal's fields.
$reference   = clean_text($in['reference'] ?? '', 100);
$description = clean_text($in['description'] ?? '', 120);
if ($description === '') {
    $description = 'Novelio Technologies — payment' . ($reference !== '' ? ' (' . $reference . ')' : '');
}

$token = paypal_access_token();

$payload = json_encode([
    'intent' => 'CAPTURE',
    'purchase_units' => [[
        'description' => mb_substr($description, 0, 127),
        'custom_id'   => mb_substr('custom:' . ($reference !== '' ? $reference : 'adhoc'), 0, 127),
        'amount' => [
            'currency_code' => PAYPAL_CURRENCY,
            'value'         => money($amount),
        ],
    ]],
    'application_context' => [
        'brand_name'          => PAYPAL_BRAND_NAME,
        'shipping_preference' => 'NO_SHIPPING',
        'user_action'         => 'PAY_NOW',
    ],
]);

[$code, $body] = paypal_http('POST', '/v2/checkout/orders', [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
], $payload);

if ($code !== 201 || empty($body['id'])) {
    error_log('[paypal] create-custom-order failed: ' . json_encode($body));
    respond(['error' => 'Could not start the payment. Please try again.'], 502);
}

respond(['id' => $body['id']]);
