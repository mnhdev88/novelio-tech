<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/verify-payment.php
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
//
// The ONLY place a Razorpay payment becomes real. Four gates, in order:
//   1. HMAC-SHA256 over "order_id|payment_id" must match the signature, proving
//      the callback came from Razorpay and not from anyone who can POST here.
//   2. Re-read the ORDER and PAYMENT from the API — never trust posted amounts.
//   3. Capture if the payment is only authorised (accounts without auto-capture).
//   4. The captured amount and currency must equal what the order asked for.
//
// Nothing from the request body is used except the three identifiers. Plan
// details come from the order's notes, which only our server could have written.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in = rzp_read_json_body();

$orderId   = is_string($in['razorpay_order_id'] ?? null) ? trim($in['razorpay_order_id']) : '';
$paymentId = is_string($in['razorpay_payment_id'] ?? null) ? trim($in['razorpay_payment_id']) : '';
$signature = is_string($in['razorpay_signature'] ?? null) ? trim($in['razorpay_signature']) : '';

if ($orderId === '' || $paymentId === '') {
    rzp_respond(['error' => 'Missing payment reference.'], 400);
}

// ── 1. Signature ─────────────────────────────────────────────────────────────
if (!rzp_verify_checkout_signature($orderId, $paymentId, $signature)) {
    error_log('[razorpay] signature mismatch for order ' . $orderId . ' / payment ' . $paymentId);
    rzp_respond(['error' => 'Payment could not be verified. You have not been charged — please contact us.'], 400);
}

// ── 2. Authoritative re-read ─────────────────────────────────────────────────
[$oCode, $order] = rzp_get_order($orderId);
if ($oCode !== 200 || empty($order['id'])) {
    error_log('[razorpay] order fetch failed (' . $oCode . '): ' . json_encode($order));
    rzp_respond(['error' => 'Could not confirm your payment. Please contact us before retrying.'], 502);
}

[$pCode, $payment] = rzp_get_payment($paymentId);
if ($pCode !== 200 || empty($payment['id'])) {
    error_log('[razorpay] payment fetch failed (' . $pCode . '): ' . json_encode($payment));
    rzp_respond(['error' => 'Could not confirm your payment. Please contact us before retrying.'], 502);
}

// The payment must belong to the order it claims to.
if ((string) ($payment['order_id'] ?? '') !== $orderId) {
    error_log('[razorpay] payment ' . $paymentId . ' does not belong to order ' . $orderId);
    rzp_respond(['error' => 'Payment could not be verified. Please contact us.'], 400);
}

$expectedMinor = (int) ($order['amount'] ?? 0);
$currency      = (string) ($order['currency'] ?? '');
$status        = (string) ($payment['status'] ?? '');

if ($status === 'failed') {
    rzp_respond(['status' => 'FAILED', 'error' => 'The payment did not go through. You have not been charged.'], 200);
}

// ── 3. Capture if the account does not auto-capture ──────────────────────────
if ($status === 'authorized') {
    [$cCode, $captured] = rzp_capture_payment($paymentId, $expectedMinor, $currency);
    if ($cCode === 200 && !empty($captured['id'])) {
        $payment = $captured;
        $status  = (string) ($payment['status'] ?? '');
    } else {
        error_log('[razorpay] capture failed (' . $cCode . '): ' . json_encode($captured));
    }
    // Re-read the order so amount_paid reflects the capture.
    [$oCode2, $order2] = rzp_get_order($orderId);
    if ($oCode2 === 200 && !empty($order2['id'])) $order = $order2;
}

if ($status !== 'captured') {
    // Authorised-but-uncaptured, or an async method still settling. Never call
    // this paid — the webhook will finalise it if and when it completes.
    rzp_respond([
        'status'   => 'PENDING',
        'amount'   => rzp_money_minor((int) ($payment['amount'] ?? 0)),
        'currency' => $currency,
    ], 200);
}

// ── 4. Amount must match what we asked for ───────────────────────────────────
$paidMinor = (int) ($order['amount_paid'] ?? $payment['amount'] ?? 0);
if ($paidMinor !== $expectedMinor) {
    error_log('[razorpay] amount mismatch on ' . $orderId . ': expected ' . $expectedMinor . ', paid ' . $paidMinor);
    rzp_respond(['error' => 'The amount paid does not match your order. Please contact us — do not retry.'], 409);
}

[$record, $isNew] = rzp_finalize($order, $payment);

$notes = is_array($order['notes'] ?? null) ? $order['notes'] : [];

rzp_respond([
    'status'     => 'COMPLETED',
    'type'       => $record['type'],
    'amount'     => rzp_money_minor($paidMinor),
    'subtotal'   => rzp_money_minor($paidMinor - (int) ($notes['gst_minor'] ?? 0)),
    'gst'        => rzp_money_minor((int) ($notes['gst_minor'] ?? 0)),
    'gstPercent' => (int) ($notes['gst_percent'] ?? 0),
    'currency'   => $currency,
    'paymentId'  => $record['rzp_payment_id'],
    'reference'  => $record['reference'],
    // Echoed back so the SPA can create the local subscription record. These are
    // our own notes read back from Razorpay, not values the browser supplied.
    'planId'     => $record['plan_id'],
    'billing'    => $record['billing'],
    'addonIds'   => ($notes['addons'] ?? '') !== '' ? explode(',', (string) $notes['addons']) : [],
    'recorded'   => $isNew,
]);
