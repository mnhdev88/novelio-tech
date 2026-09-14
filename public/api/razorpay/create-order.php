<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/create-order.php
// Body: { planId, billing, addonIds[], currency, customer:{id,name,email} }
// Creates a Razorpay Order for a PLAN purchase. The amount is computed here from
// the shared price table — the browser sends only the selection, never a price.
//
// The plan context is stored in the order's `notes` so verify-payment.php and
// webhook.php can read back what was bought from Razorpay itself rather than
// trusting whatever the browser posts on the way home.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in = rzp_read_json_body();

$planId   = is_string($in['planId'] ?? null) ? $in['planId'] : '';
$billing  = is_string($in['billing'] ?? null) ? $in['billing'] : 'monthly';
$addonIds = is_array($in['addonIds'] ?? null) ? $in['addonIds'] : [];
$currency = rzp_currency($in['currency'] ?? 'INR');

$charge = rzp_compute_charge($planId, $billing, $addonIds, $currency);

$customer = is_array($in['customer'] ?? null) ? $in['customer'] : [];
$custName  = rzp_clean_text($customer['name'] ?? '', 100);
$custEmail = rzp_clean_text($customer['email'] ?? '', 100);
$custId    = rzp_clean_text($customer['id'] ?? '', 64);

// Notes are capped at 15 keys by Razorpay; this uses 12.
$notes = [
    'type'           => 'plan',
    'plan_id'        => $planId,
    'billing'        => ($billing === 'yearly') ? 'yearly' : 'monthly',
    'addons'         => rzp_clean_text(implode(',', array_map('strval', $addonIds)), 400),
    'description'    => rzp_clean_text($charge['description'], 250),
    'breakdown'      => rzp_clean_text(implode(' | ', $charge['breakdown']), 400),
    'subtotal_minor' => (string) $charge['subtotal_minor'],
    'gst_minor'      => (string) $charge['gst_minor'],
    'gst_percent'    => (string) $charge['gst_percent'],
    'customer_id'    => $custId,
    'customer_name'  => $custName,
    'customer_email' => $custEmail,
];

// Receipt is capped at 40 chars by Razorpay and must be unique enough to trace.
$receipt = 'plan_' . substr(preg_replace('/[^a-zA-Z0-9]/', '', $planId), 0, 12) . '_' . bin2hex(random_bytes(8));

[$code, $body] = rzp_create_order($charge['total_minor'], $currency, $receipt, $notes);

if ($code !== 200 || empty($body['id'])) {
    error_log('[razorpay] create-order failed (' . $code . '): ' . json_encode($body));
    // Surface Razorpay's own reason where it is safe and actionable (e.g. an
    // international-payments block), otherwise stay generic.
    $reason = $body['error']['description'] ?? '';
    rzp_respond(['error' => $reason !== ''
        ? 'Could not start the payment: ' . rzp_clean_text($reason, 160)
        : 'Could not start the payment. Please try again.'], 502);
}

rzp_respond([
    'orderId'     => $body['id'],
    'amount'      => $charge['total_minor'],           // minor units, for checkout.js
    'currency'    => $currency,
    'keyId'       => RAZORPAY_KEY_ID,
    'description' => $charge['description'],
    'subtotal'    => rzp_money_minor($charge['subtotal_minor']),
    'gst'         => rzp_money_minor($charge['gst_minor']),
    'gstPercent'  => $charge['gst_percent'],
    'total'       => rzp_money_minor($charge['total_minor']),
    'name'        => $custName,
    'email'       => $custEmail,
]);
