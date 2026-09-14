<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/webhook.php
// Razorpay server-to-server notification. Subscribe it to `payment.captured`
// (and optionally `order.paid`) in Dashboard → Settings → Webhooks, with the
// same secret you put in RAZORPAY_WEBHOOK_SECRET.
//
// This is the safety net for the case verify-payment.php can never cover: the
// buyer pays, then closes the tab before the browser reports back. Razorpay
// still tells us, and rzp_finalize() is idempotent, so whichever arrives second
// changes nothing.
//
// Unlike the PayPal integration there is a real signature scheme here, so the
// body is authenticated before a single field of it is read.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    exit;
}

$raw = file_get_contents('php://input');
$sig = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';

if (!rzp_verify_webhook_signature($raw, $sig)) {
    // A missing RAZORPAY_WEBHOOK_SECRET lands here too — better to drop the
    // event than to act on an unauthenticated one.
    error_log('[razorpay] webhook signature rejected');
    http_response_code(400);
    echo json_encode(['error' => 'invalid signature']);
    exit;
}

$event   = json_decode($raw, true);
$name    = is_array($event) ? (string) ($event['event'] ?? '') : '';
$payload = is_array($event['payload'] ?? null) ? $event['payload'] : [];

// Acknowledge anything we don't act on, so Razorpay stops retrying it.
if ($name !== 'payment.captured' && $name !== 'order.paid') {
    http_response_code(200);
    echo json_encode(['ok' => true, 'ignored' => $name]);
    exit;
}

$payment = is_array($payload['payment']['entity'] ?? null) ? $payload['payment']['entity'] : [];
$orderId = (string) ($payment['order_id'] ?? ($payload['order']['entity']['id'] ?? ''));

if ($orderId === '' || empty($payment['id'])) {
    http_response_code(200);
    echo json_encode(['ok' => true, 'skipped' => 'no order/payment id']);
    exit;
}

// Read the order back rather than trusting the webhook body for the notes and
// the paid amount — same rule as verify-payment.php.
[$code, $order] = rzp_get_order($orderId);
if ($code !== 200 || empty($order['id'])) {
    error_log('[razorpay] webhook order fetch failed (' . $code . ') for ' . $orderId);
    // 500 asks Razorpay to retry, which is what we want for a transient failure.
    http_response_code(500);
    echo json_encode(['error' => 'order fetch failed']);
    exit;
}

if ((string) ($payment['status'] ?? '') !== 'captured') {
    http_response_code(200);
    echo json_encode(['ok' => true, 'skipped' => 'not captured']);
    exit;
}

[, $isNew] = rzp_finalize($order, $payment);

http_response_code(200);
echo json_encode(['ok' => true, 'recorded' => $isNew]);
