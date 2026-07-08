<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/paypal/create-order.php
// Body: { planId, billing: "monthly"|"yearly", addonIds: [] }
// Creates a PayPal order for the SERVER-computed amount and returns { id }.
// The browser never dictates the price — compute_charge() is the source of truth.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in = read_json_body();
$planId   = isset($in['planId']) ? (string) $in['planId'] : '';
$billing  = isset($in['billing']) ? (string) $in['billing'] : 'monthly';
$addonIds = isset($in['addonIds']) && is_array($in['addonIds']) ? $in['addonIds'] : [];

[$amount, $description, $breakdown] = compute_charge($planId, $billing, $addonIds);

$token = paypal_access_token();

$payload = json_encode([
    'intent' => 'CAPTURE',
    'purchase_units' => [[
        'description' => mb_substr($description, 0, 127),
        'custom_id'   => mb_substr($planId . ':' . $billing, 0, 127),
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
    error_log('[paypal] create-order failed: ' . json_encode($body));
    respond(['error' => 'Could not start the payment. Please try again.'], 502);
}

respond(['id' => $body['id']]);
