<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/verify-subscription.php
// Body: { razorpay_payment_id, razorpay_subscription_id, razorpay_signature }
//
// The subscription twin of verify-payment.php. Same gates:
//   1. HMAC-SHA256 over "payment_id|subscription_id" must match the signature.
//   2. Re-read the SUBSCRIPTION and PAYMENT from the API — never trust the post.
//   3. Capture if the payment is only authorised.
//   4. The amount and currency must equal the first charge recorded in the
//      subscription's notes when we created it.
//
// Later cycles never come through here — Razorpay charges them on its own and
// webhook.php records them.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

$in = rzp_read_json_body();

$paymentId = is_string($in['razorpay_payment_id'] ?? null) ? trim($in['razorpay_payment_id']) : '';
$subId     = is_string($in['razorpay_subscription_id'] ?? null) ? trim($in['razorpay_subscription_id']) : '';
$signature = is_string($in['razorpay_signature'] ?? null) ? trim($in['razorpay_signature']) : '';

if ($paymentId === '' || $subId === '') {
    rzp_respond(['error' => 'Missing payment reference.'], 400);
}

// ── 1. Signature ─────────────────────────────────────────────────────────────
if (!rzp_verify_subscription_signature($paymentId, $subId, $signature)) {
    error_log('[razorpay] subscription signature mismatch for ' . $subId . ' / payment ' . $paymentId);
    rzp_respond(['error' => 'Payment could not be verified. You have not been charged — please contact us.'], 400);
}

// ── 2. Authoritative re-read ─────────────────────────────────────────────────
[$sCode, $sub] = rzp_get_subscription($subId);
if ($sCode !== 200 || empty($sub['id'])) {
    error_log('[razorpay] subscription fetch failed (' . $sCode . '): ' . json_encode($sub));
    rzp_respond(['error' => 'Could not confirm your payment. Please contact us before retrying.'], 502);
}
if (!rzp_is_our_subscription($sub)) {
    rzp_respond(['error' => 'Payment could not be verified. Please contact us.'], 400);
}

[$pCode, $payment] = rzp_get_payment($paymentId);
if ($pCode !== 200 || empty($payment['id'])) {
    error_log('[razorpay] payment fetch failed (' . $pCode . '): ' . json_encode($payment));
    rzp_respond(['error' => 'Could not confirm your payment. Please contact us before retrying.'], 502);
}

$notes         = $sub['notes'];
$expectedMinor = (int) ($notes['first_charge_minor'] ?? 0);
$currency      = (string) ($payment['currency'] ?? '');
$status        = (string) ($payment['status'] ?? '');

if ($status === 'failed') {
    rzp_respond(['status' => 'FAILED', 'error' => 'The payment did not go through. You have not been charged.'], 200);
}

// ── 3. Capture if the account does not auto-capture ──────────────────────────
if ($status === 'authorized') {
    [$cCode, $captured] = rzp_capture_payment($paymentId, (int) ($payment['amount'] ?? 0), $currency);
    if ($cCode === 200 && !empty($captured['id'])) {
        $payment = $captured;
        $status  = (string) ($payment['status'] ?? '');
    } else {
        error_log('[razorpay] subscription capture failed (' . $cCode . '): ' . json_encode($captured));
    }
}

if ($status !== 'captured') {
    rzp_respond([
        'status'   => 'PENDING',
        'amount'   => rzp_money_minor((int) ($payment['amount'] ?? 0)),
        'currency' => $currency,
    ], 200);
}

// ── 4. Amount must match the first charge we set up ──────────────────────────
$paidMinor = (int) ($payment['amount'] ?? 0);
if ($paidMinor !== $expectedMinor) {
    error_log('[razorpay] subscription amount mismatch on ' . $subId . ': expected ' . $expectedMinor . ', paid ' . $paidMinor);
    rzp_respond(['error' => 'The amount paid does not match your subscription. Please contact us — do not retry.'], 409);
}

[$record, $isNew] = rzp_finalize_subscription_charge($sub, $payment);

rzp_respond([
    'status'         => 'COMPLETED',
    'type'           => 'subscription',
    'amount'         => rzp_money_minor($paidMinor),
    'currency'       => $currency,
    'paymentId'      => $record['rzp_payment_id'],
    'subscriptionId' => $record['rzp_subscription_id'],
    'reference'      => $record['reference'],
    'schedule'       => $record['schedule'],
    'recorded'       => $isNew,
]);
