<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/create-custom-order.php
// Body: { amount, currency, reference?, description?, gstMode?, customer:{name,email} }
// Creates a Razorpay Order for a CUSTOM one-off amount (invoices, quotes, buyouts).
//
// The amount can't be checked against a price table, so it is bounded per
// currency and everything is logged. Only WE can open an order under our key, so
// any order that later pays was created here, within those bounds.
//
// GST on INR: `gstMode` mirrors the ?gst= param on /pay.
//   'add'       (default) — the amount is ex-GST and 18% is added on top.
//   'inclusive'            — the amount already contains GST; nothing is added.
// Either way the split is recorded so the tax invoice can be raised correctly.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in = rzp_read_json_body();

$currency = rzp_currency($in['currency'] ?? 'INR');
rzp_guard_inr_ready($currency);

$min = $currency === 'INR' ? RAZORPAY_CUSTOM_MIN_INR : RAZORPAY_CUSTOM_MIN_USD;
$max = $currency === 'INR' ? RAZORPAY_CUSTOM_MAX_INR : RAZORPAY_CUSTOM_MAX_USD;
$sym = rzp_symbol($currency);

$amount = isset($in['amount']) ? round((float) $in['amount'], 2) : 0.0;
if ($amount < $min || $amount > $max) {
    rzp_respond(['error' => 'Enter an amount between ' . $sym . number_format($min)
        . ' and ' . $sym . number_format($max) . '.'], 400);
}

$gstPercent = rzp_gst_percent($currency);
$gstMode    = ($in['gstMode'] ?? 'add') === 'inclusive' ? 'inclusive' : 'add';
$entered    = rzp_minor($amount, $currency);

if ($gstPercent === 0) {
    $subtotal = $entered;
    $gst      = 0;
} elseif ($gstMode === 'inclusive') {
    // Back out the tax already inside the figure: sub = total * 100 / (100 + p).
    $subtotal = (int) round($entered * 100 / (100 + $gstPercent));
    $gst      = $entered - $subtotal;
} else {
    $subtotal = $entered;
    $gst      = (int) round($subtotal * $gstPercent / 100);
}
$total = $subtotal + $gst;

// Labels only — trimmed and length-capped.
$reference   = rzp_clean_text($in['reference'] ?? '', 100);
$description = rzp_clean_text($in['description'] ?? '', 120);
if ($description === '') {
    $description = 'Novelio Technologies — payment' . ($reference !== '' ? ' (' . $reference . ')' : '');
}

$customer  = is_array($in['customer'] ?? null) ? $in['customer'] : [];
$custName  = rzp_clean_text($customer['name'] ?? '', 100);
$custEmail = rzp_clean_text($customer['email'] ?? '', 100);

$notes = [
    'type'           => 'custom',
    'plan_id'        => 'custom',
    'billing'        => 'one-time',
    'reference'      => $reference,
    'description'    => $description,
    'subtotal_minor' => (string) $subtotal,
    'gst_minor'      => (string) $gst,
    'gst_percent'    => (string) $gstPercent,
    'gst_mode'       => $gstMode,
    'customer_name'  => $custName,
    'customer_email' => $custEmail,
];

$receipt = 'cust_' . bin2hex(random_bytes(12));

[$code, $body] = rzp_create_order($total, $currency, $receipt, $notes);

if ($code !== 200 || empty($body['id'])) {
    error_log('[razorpay] create-custom-order failed (' . $code . '): ' . json_encode($body));
    $reason = $body['error']['description'] ?? '';
    rzp_respond(['error' => $reason !== ''
        ? 'Could not start the payment: ' . rzp_clean_text($reason, 160)
        : 'Could not start the payment. Please try again.'], 502);
}

rzp_respond([
    'orderId'     => $body['id'],
    'amount'      => $total,                            // minor units, for checkout.js
    'currency'    => $currency,
    'keyId'       => RAZORPAY_KEY_ID,
    'description' => $description,
    'subtotal'    => rzp_money_minor($subtotal),
    'gst'         => rzp_money_minor($gst),
    'gstPercent'  => $gstPercent,
    'gstMode'     => $gstMode,
    'total'       => rzp_money_minor($total),
    'name'        => $custName,
    'email'       => $custEmail,
]);
