<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/create-subscription.php
// Body: { amount, currency, gstMode?, months, upfront?, reference?, description?,
//         customer:{name,email} }
// Creates a Razorpay Subscription for a /pay link carrying ?months=.
//
//   amount   — the MONTHLY amount you quoted (ex-GST unless gstMode=inclusive)
//   months   — the whole term, e.g. 12
//   upfront  — months collected today with the authorisation (0 = just month 1)
//
// months=12&upfront=3 → one charge of 3 × monthly today, then 9 monthly charges
// starting three months from now. See the Subscriptions notes in _lib.php.
//
// Same trust model as create-custom-order.php: the amount is bounded per
// currency, only this server can open a subscription under our key, and every
// figure a charge is later checked against is stored in the subscription's notes.
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
    rzp_respond(['error' => 'The monthly amount must be between ' . $sym . number_format($min)
        . ' and ' . $sym . number_format($max) . '.'], 400);
}

$months  = (int) ($in['months'] ?? 0);
$upfront = (int) ($in['upfront'] ?? 0);
if ($months < 2 || $months > RAZORPAY_SUB_MAX_MONTHS) {
    rzp_respond(['error' => 'This payment link has an invalid term. Please ask us for a new link.'], 400);
}
// At least one month must be left to bill monthly, or it's just a one-off payment.
if ($upfront < 0 || $upfront >= $months) {
    rzp_respond(['error' => 'This payment link has an invalid upfront period. Please ask us for a new link.'], 400);
}

$gstMode    = ($in['gstMode'] ?? 'add') === 'inclusive' ? 'inclusive' : 'add';
$gstPercent = rzp_gst_percent($currency);
[$cycleSub, $cycleGst] = rzp_custom_split(rzp_minor($amount, $currency), $currency, $gstMode);
$cycleMinor = $cycleSub + $cycleGst;

// What the authorisation collects today.
$firstMinor = $upfront > 0 ? $cycleMinor * $upfront : $cycleMinor;
// Regular cycles Razorpay bills itself. With no upfront, the authorisation IS
// cycle 1, so all $months are regular cycles.
$totalCount = $months - $upfront;

$reference   = rzp_clean_text($in['reference'] ?? '', 100);
$description = rzp_clean_text($in['description'] ?? '', 120);
if ($description === '') {
    $description = RAZORPAY_BRAND_NAME . ' — monthly plan' . ($reference !== '' ? ' (' . $reference . ')' : '');
}

$customer  = is_array($in['customer'] ?? null) ? $in['customer'] : [];
$custName  = rzp_clean_text($customer['name'] ?? '', 100);
$custEmail = rzp_clean_text($customer['email'] ?? '', 100);

$planId = rzp_monthly_plan_id($cycleMinor, $currency);
if (!$planId) {
    rzp_respond(['error' => 'Could not start the subscription. Please try again or contact us.'], 502);
}

// Razorpay allows at most 15 notes of 256 chars each; this is 13.
$notes = [
    'type'                 => 'subscription',
    'currency'             => $currency,
    'reference'            => $reference,
    'description'          => $description,
    'cycle_subtotal_minor' => (string) $cycleSub,
    'cycle_gst_minor'      => (string) $cycleGst,
    'gst_percent'          => (string) $gstPercent,
    'gst_mode'             => $gstMode,
    'total_months'         => (string) $months,
    'upfront_months'       => (string) $upfront,
    'first_charge_minor'   => (string) $firstMinor,
    'customer_name'        => $custName,
    'customer_email'       => $custEmail,
];

$payload = [
    'plan_id'         => $planId,
    'total_count'     => $totalCount,
    'quantity'        => 1,
    // We send our own emails; Razorpay's would duplicate them.
    'customer_notify' => 0,
    'notes'           => $notes,
];

$firstCycleAt = null;
if ($upfront > 0) {
    $firstCycleAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
        ->modify('+' . $upfront . ' months')->getTimestamp();
    $payload['start_at'] = $firstCycleAt;
    $payload['addons'] = [[
        'item' => [
            'name'     => 'First ' . $upfront . ' months, paid upfront',
            'amount'   => $firstMinor,
            'currency' => $currency,
        ],
    ]];
}

[$code, $body] = rzp_create_subscription($payload);

if ($code !== 200 || empty($body['id'])) {
    error_log('[razorpay] create-subscription failed (' . $code . '): ' . json_encode($body));
    $reason = $body['error']['description'] ?? '';
    rzp_respond(['error' => $reason !== ''
        ? 'Could not start the subscription: ' . rzp_clean_text($reason, 160)
        : 'Could not start the subscription. Please try again.'], 502);
}

rzp_respond([
    'subscriptionId' => $body['id'],
    'keyId'          => RAZORPAY_KEY_ID,
    'currency'       => $currency,
    'description'    => $description,
    'cycle'          => rzp_money_minor($cycleMinor),
    'cycleSubtotal'  => rzp_money_minor($cycleSub),
    'cycleGst'       => rzp_money_minor($cycleGst),
    'gstPercent'     => $gstPercent,
    'firstCharge'    => rzp_money_minor($firstMinor),
    'months'         => $months,
    'upfront'        => $upfront,
    'firstCycleAt'   => $firstCycleAt,
    'name'           => $custName,
    'email'          => $custEmail,
]);
