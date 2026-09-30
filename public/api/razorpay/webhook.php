<?php
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/razorpay/webhook.php
// Razorpay server-to-server notification. Subscribe it to `payment.captured`
// (and optionally `order.paid`) in Dashboard → Settings → Webhooks, with the
// same secret you put in RAZORPAY_WEBHOOK_SECRET. For /pay subscriptions also
// tick `subscription.charged`, `subscription.pending`, `subscription.halted`,
// `subscription.cancelled` and `subscription.completed`.
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
$payment = is_array($payload['payment']['entity'] ?? null) ? $payload['payment']['entity'] : [];

/** Acknowledge and stop. 200 tells Razorpay not to retry. */
function rzp_webhook_done(array $body, $status = 200) {
    http_response_code($status);
    echo json_encode($body);
    exit;
}

/**
 * Record a subscription charge. The subscription is re-read from the API rather
 * than taken from the event body — same rule as the one-off path below.
 */
function rzp_webhook_subscription_charge($subId, array $payment) {
    if ($subId === '' || empty($payment['id'])) rzp_webhook_done(['ok' => true, 'skipped' => 'no subscription/payment id']);
    if ((string) ($payment['status'] ?? '') !== 'captured') rzp_webhook_done(['ok' => true, 'skipped' => 'not captured']);

    [$code, $sub] = rzp_get_subscription($subId);
    if ($code !== 200 || empty($sub['id'])) {
        error_log('[razorpay] webhook subscription fetch failed (' . $code . ') for ' . $subId);
        rzp_webhook_done(['error' => 'subscription fetch failed'], 500);   // retry
    }
    // Subscriptions made by hand in the dashboard have none of our notes.
    if (!rzp_is_our_subscription($sub)) rzp_webhook_done(['ok' => true, 'skipped' => 'not a /pay subscription']);

    [, $isNew] = rzp_finalize_subscription_charge($sub, $payment);
    rzp_webhook_done(['ok' => true, 'recorded' => $isNew]);
}

// ── Subscriptions ────────────────────────────────────────────────────────────
// Every cycle Razorpay bills fires subscription.charged. A subscription payment
// also fires payment.captured (handled below via its invoice), so whichever of
// the two events the dashboard is subscribed to, the charge gets recorded —
// and if both are, rzp_finalize_subscription_charge() dedupes on the payment id.
if ($name === 'subscription.charged') {
    rzp_webhook_subscription_charge((string) ($payload['subscription']['entity']['id'] ?? ''), $payment);
}

if (in_array($name, ['subscription.pending', 'subscription.halted', 'subscription.cancelled', 'subscription.completed'], true)) {
    $subId   = (string) ($payload['subscription']['entity']['id'] ?? '');
    $eventId = (string) ($_SERVER['HTTP_X_RAZORPAY_EVENT_ID'] ?? '');
    if ($subId === '') rzp_webhook_done(['ok' => true, 'skipped' => 'no subscription id']);
    if (rzp_event_seen($eventId)) rzp_webhook_done(['ok' => true, 'duplicate' => true]);

    [$code, $sub] = rzp_get_subscription($subId);
    if ($code !== 200 || empty($sub['id'])) {
        error_log('[razorpay] webhook subscription fetch failed (' . $code . ') for ' . $subId);
        rzp_webhook_done(['error' => 'subscription fetch failed'], 500);
    }
    if (!rzp_is_our_subscription($sub)) rzp_webhook_done(['ok' => true, 'skipped' => 'not a /pay subscription']);

    rzp_log_event($eventId, $name, $subId);
    rzp_notify_subscription_status($name, $sub);
    rzp_webhook_done(['ok' => true, 'notified' => $name]);
}

// Acknowledge anything we don't act on, so Razorpay stops retrying it.
if ($name !== 'payment.captured' && $name !== 'order.paid') {
    rzp_webhook_done(['ok' => true, 'ignored' => $name]);
}

// A captured payment with an invoice is a subscription charge, not a one-off
// order — its order has none of our notes, so rzp_finalize() would mislabel it.
if (!empty($payment['invoice_id'])) {
    [$iCode, $invoice] = rzp_get_invoice((string) $payment['invoice_id']);
    if ($iCode !== 200 || empty($invoice['id'])) {
        error_log('[razorpay] webhook invoice fetch failed (' . $iCode . ') for ' . $payment['invoice_id']);
        rzp_webhook_done(['error' => 'invoice fetch failed'], 500);
    }
    if (!empty($invoice['subscription_id'])) {
        rzp_webhook_subscription_charge((string) $invoice['subscription_id'], $payment);
    }
}

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
