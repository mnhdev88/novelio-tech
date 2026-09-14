<?php
// ─────────────────────────────────────────────────────────────────────────────
// Razorpay integration — shared helpers.
// HTTP + Basic auth, order create/read, capture, signature verification,
// dual-currency pricing with GST, logging, email. Loaded by the endpoint files.
//
// MONEY IS HANDLED IN MINOR UNITS (paise / cents) AS INTEGERS EVERYWHERE.
// Razorpay's API only speaks minor units, and integer arithmetic is the only way
// a GST split can't drift by a paisa. Floats appear solely at display time.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_config.php';

/** Send a JSON response and stop. */
function rzp_respond($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/** Read + decode the JSON request body (POST only). */
function rzp_read_json_body() {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        rzp_respond(['error' => 'Method not allowed'], 405);
    }
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

// ── Currency ─────────────────────────────────────────────────────────────────

/** Normalise + validate a requested currency against RAZORPAY_CURRENCIES. */
function rzp_currency($c) {
    $c = strtoupper(trim((string) $c));
    if ($c === '') $c = 'INR';
    $allowed = array_map('trim', explode(',', RAZORPAY_CURRENCIES));
    if (!in_array($c, $allowed, true)) {
        rzp_respond(['error' => 'That currency is not available. Please choose another payment option.'], 400);
    }
    return $c;
}

/** GST applies to INR (Novelio India) only; USD is billed by the US entity. */
function rzp_gst_percent($currency) {
    return $currency === 'INR' ? (int) RAZORPAY_GST_PERCENT : 0;
}

/** Rupees/dollars -> paise/cents. Both currencies are 2-decimal. */
function rzp_minor($amount, $currency = 'INR') {
    return (int) round(((float) $amount) * 100);
}

/** Minor units -> a display string, e.g. 1557600 -> "15576.00". */
function rzp_money_minor($minor) {
    return number_format(((int) $minor) / 100, 2, '.', '');
}

/** Currency symbol for log lines and notification emails. */
function rzp_symbol($currency) {
    return $currency === 'INR' ? '₹' : '$';
}

// ── HTTP ─────────────────────────────────────────────────────────────────────

/** Low-level Razorpay REST call via cURL. Returns [httpCode, decodedBody]. */
function rzp_http($method, $path, $body = null) {
    $ch = curl_init(RAZORPAY_API_BASE . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_USERPWD        => RAZORPAY_KEY_ID . ':' . RAZORPAY_KEY_SECRET,
        CURLOPT_HTTPAUTH       => CURLAUTH_BASIC,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT        => 30,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $resp = curl_exec($ch);
    if ($resp === false) {
        $err = curl_error($ch);
        curl_close($ch);
        error_log('[razorpay] cURL error: ' . $err);
        rzp_respond(['error' => 'Could not reach the payment provider. Please try again.'], 502);
    }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($resp, true)];
}

/** Create an order. $notes travels with it and is read back on verification. */
function rzp_create_order($amountMinor, $currency, $receipt, array $notes) {
    return rzp_http('POST', '/orders', json_encode([
        'amount'   => $amountMinor,
        'currency' => $currency,
        'receipt'  => mb_substr($receipt, 0, 40), // Razorpay caps receipt at 40 chars
        'notes'    => $notes,
    ]));
}

function rzp_get_order($orderId)     { return rzp_http('GET', '/orders/' . rawurlencode($orderId)); }
function rzp_get_payment($paymentId) { return rzp_http('GET', '/payments/' . rawurlencode($paymentId)); }

/** Capture an authorised payment. Harmless if auto-capture already ran. */
function rzp_capture_payment($paymentId, $amountMinor, $currency) {
    return rzp_http('POST', '/payments/' . rawurlencode($paymentId) . '/capture',
        json_encode(['amount' => $amountMinor, 'currency' => $currency]));
}

// ── Signatures ───────────────────────────────────────────────────────────────

/**
 * Checkout signature: HMAC-SHA256 of "order_id|payment_id" keyed with the API
 * secret. This is what proves the browser's success callback really came from
 * Razorpay and wasn't forged by anyone who can POST to our endpoint.
 */
function rzp_verify_checkout_signature($orderId, $paymentId, $signature) {
    if ($orderId === '' || $paymentId === '' || !is_string($signature) || $signature === '') return false;
    $expected = hash_hmac('sha256', $orderId . '|' . $paymentId, RAZORPAY_KEY_SECRET);
    return hash_equals($expected, $signature);
}

/** Webhook signature: HMAC-SHA256 of the RAW body keyed with the webhook secret. */
function rzp_verify_webhook_signature($rawBody, $signature) {
    if (!defined('RAZORPAY_WEBHOOK_SECRET') || RAZORPAY_WEBHOOK_SECRET === '') return false;
    if (!is_string($signature) || $signature === '') return false;
    $expected = hash_hmac('sha256', $rawBody, RAZORPAY_WEBHOOK_SECRET);
    return hash_equals($expected, $signature);
}

// ── Pricing ──────────────────────────────────────────────────────────────────

/** Per-currency price lookup. USD sits in the flat keys, INR under 'inr'. */
function rzp_plan_prices(array $plan, $currency) {
    if ($currency === 'INR') {
        $inr = is_array($plan['inr'] ?? null) ? $plan['inr'] : [];
        return [
            'monthly'      => $inr['monthly'] ?? 0,
            'yearly'       => $inr['yearly'] ?? 0,
            'yearly_total' => $inr['yearly_total'] ?? null,
        ];
    }
    return [
        'monthly'      => $plan['monthly'] ?? 0,
        'yearly'       => $plan['yearly'] ?? 0,
        'yearly_total' => $plan['yearly_total'] ?? null,
    ];
}

function rzp_addon_price(array $addon, $currency) {
    return $currency === 'INR' ? ($addon['price_inr'] ?? 0) : ($addon['price'] ?? 0);
}

/**
 * Compute the authoritative charge from plan + billing cycle + add-ons.
 * Mirrors compute_charge() in ../paypal/_lib.php, with a currency axis and GST.
 *
 * Returns minor-unit integers plus display labels:
 *   subtotal_minor, gst_minor, total_minor, gst_percent, description, breakdown
 */
function rzp_compute_charge($planId, $billing, $addonIds, $currency) {
    $plans  = $GLOBALS['RAZORPAY_PLANS'];
    $addons = $GLOBALS['RAZORPAY_ADDONS'];

    if (!isset($plans[$planId])) {
        rzp_respond(['error' => 'Unknown plan.'], 400);
    }
    rzp_guard_inr_ready($currency);

    $billing = ($billing === 'yearly') ? 'yearly' : 'monthly';
    $plan    = $plans[$planId];
    $price   = rzp_plan_prices($plan, $currency);
    $sym     = rzp_symbol($currency);

    $addonMinor = 0;
    $breakdown  = [];
    foreach ((array) $addonIds as $id) {
        if (isset($addons[$id])) {
            $p = rzp_addon_price($addons[$id], $currency);
            $addonMinor += rzp_minor($p, $currency);
            $breakdown[] = $addons[$id]['name'] . ' (+' . $sym . $p . '/mo)';
        }
    }

    // Plan portion due today. Add-ons are always billed monthly and are never
    // multiplied into a yearly or upfront total.
    if ($billing === 'yearly') {
        // A flat yearly_total is authoritative; otherwise fall back to 12x.
        $planMinor = $price['yearly_total'] !== null
            ? rzp_minor($price['yearly_total'], $currency)
            : rzp_minor($price['yearly'], $currency) * 12;
        $cycle = 'yearly (12 months, paid in full)';
    } elseif (isset($plan['upfront_months'])) {
        // 3 months upfront at checkout; the remaining 9 are billed monthly.
        $months    = (int) $plan['upfront_months'];
        $planMinor = rzp_minor($price['monthly'], $currency) * $months;
        $cycle = $months . ' months upfront, then ' . (12 - $months)
            . ' x ' . $sym . $price['monthly'] . '/mo';
    } else {
        $planMinor = rzp_minor($price['monthly'], $currency);
        $cycle = 'monthly';
    }

    $subtotal = $planMinor + $addonMinor;
    if ($subtotal <= 0) {
        rzp_respond(['error' => 'This plan does not require a payment.'], 400);
    }

    $gstPercent = rzp_gst_percent($currency);
    $gst        = (int) round($subtotal * $gstPercent / 100);

    return [
        'subtotal_minor' => $subtotal,
        'gst_minor'      => $gst,
        'total_minor'    => $subtotal + $gst,
        'gst_percent'    => $gstPercent,
        'description'    => $plan['name'] . ' plan — ' . $cycle,
        'breakdown'      => $breakdown,
    ];
}

/**
 * Refuse rupee charges while the INR table is still seeded placeholders.
 * The flag is generated into _pricing.php from content/pricing.json, so a wrong
 * price can't go live just because someone flipped an env var.
 */
function rzp_guard_inr_ready($currency) {
    if ($currency === 'INR' && empty($GLOBALS['NOVELIO_INR_CONFIRMED'])) {
        rzp_respond(['error' => 'INR pricing is not live yet. Please pay in USD or contact us.'], 409);
    }
}

/** Trim, strip control/newline chars, and length-cap a free-text label. */
function rzp_clean_text($s, $max = 120) {
    $s = is_string($s) ? $s : '';
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s);
    $s = trim(preg_replace('/\s+/u', ' ', $s));
    return mb_substr($s, 0, $max);
}

// ── Logging + notification (shared order log with PayPal) ────────────────────

/** True if a completed order for this payment was already recorded. */
function rzp_already_finalized($paymentId) {
    if ($paymentId === '' || !is_file(RAZORPAY_ORDER_LOG)) return false;
    $contents = @file_get_contents(RAZORPAY_ORDER_LOG);
    if ($contents === false) return false;
    return strpos($contents, '"rzp_payment_id":"' . $paymentId . '"') !== false;
}

/** Append one JSON line to the order log (above web root). */
function rzp_log_order(array $record) {
    $line = json_encode($record, JSON_UNESCAPED_UNICODE) . "\n";
    if (@file_put_contents(RAZORPAY_ORDER_LOG, $line, FILE_APPEND | LOCK_EX) === false) {
        error_log('[razorpay] order (log unwritable): ' . $line);
    }
}

/**
 * Record a captured payment — once. The trusted context comes from the ORDER's
 * notes as stored by Razorpay at creation time, never from the browser, so a
 * tampered callback can't relabel a ₹100 payment as a paid annual plan.
 *
 * Idempotent: if this payment id is already in the log (webhook beat the browser,
 * or vice-versa) it does nothing. Returns [record, wasNewlyWritten].
 */
function rzp_finalize(array $order, array $payment) {
    $notes      = is_array($order['notes'] ?? null) ? $order['notes'] : [];
    $paymentId  = (string) ($payment['id'] ?? '');
    $currency   = (string) ($order['currency'] ?? 'INR');
    // amount_paid is what Razorpay actually collected — the only figure to log.
    $paidMinor  = (int) ($order['amount_paid'] ?? $payment['amount'] ?? 0);
    $gstMinor   = (int) ($notes['gst_minor'] ?? 0);

    $record = [
        'ts'             => gmdate('c'),
        'env'            => RAZORPAY_ENV,
        'gateway'        => 'razorpay',
        'type'           => $notes['type'] ?? 'plan',
        'rzp_order_id'   => (string) ($order['id'] ?? ''),
        'rzp_payment_id' => $paymentId,
        'method'         => (string) ($payment['method'] ?? ''),
        'amount'         => (float) rzp_money_minor($paidMinor),
        'currency'       => $currency,
        'subtotal'       => (float) rzp_money_minor($paidMinor - $gstMinor),
        'gst'            => (float) rzp_money_minor($gstMinor),
        'gst_percent'    => (int) ($notes['gst_percent'] ?? 0),
        'plan_id'        => $notes['plan_id'] ?? 'custom',
        'billing'        => $notes['billing'] ?? 'one-time',
        'description'    => $notes['description'] ?? '',
        'breakdown'      => isset($notes['breakdown']) && $notes['breakdown'] !== ''
            ? explode(' | ', (string) $notes['breakdown']) : [],
        'reference'      => $notes['reference'] ?? '',
        'customer_id'    => $notes['customer_id'] ?? '',
        'customer_name'  => $notes['customer_name'] ?? '',
        'customer_email' => $notes['customer_email'] ?? ($payment['email'] ?? ''),
    ];

    if (rzp_already_finalized($paymentId)) {
        return [$record, false];
    }
    rzp_log_order($record);
    rzp_notify_team($record);
    return [$record, true];
}

/** Best-effort notification email to the team. Never blocks the response. */
function rzp_notify_team(array $order) {
    $sym = rzp_symbol($order['currency']);
    $to = RAZORPAY_NOTIFY_EMAIL;
    $subject = 'New payment (Razorpay): ' . $order['description'] . ' — ' . $sym . number_format($order['amount'], 2);
    $lines = [
        'A payment was captured via Razorpay (' . RAZORPAY_ENV . ').',
        '',
        'Amount:   ' . $sym . number_format($order['amount'], 2) . ' ' . $order['currency'],
        'Subtotal: ' . $sym . number_format($order['subtotal'], 2)
            . ($order['gst'] > 0 ? '   GST (' . $order['gst_percent'] . '%): ' . $sym . number_format($order['gst'], 2) : ''),
        'Plan:     ' . $order['description'],
        'Add-ons:  ' . (empty($order['breakdown']) ? 'none' : implode(', ', $order['breakdown'])),
        'Method:   ' . ($order['method'] ?: '—'),
        'Customer: ' . ($order['customer_name'] ?: '—') . ' <' . ($order['customer_email'] ?: '—') . '>',
        'Razorpay order:   ' . $order['rzp_order_id'],
        'Razorpay payment: ' . $order['rzp_payment_id'],
        'Reference:        ' . ($order['reference'] ?: '—'),
        '',
        'Reminder: this is a one-time charge. Follow up to onboard and confirm scope.',
    ];
    $headers = 'From: no-reply@noveliotech.com' . "\r\n" . 'Content-Type: text/plain; charset=UTF-8';
    @mail($to, $subject, implode("\n", $lines), $headers);
}
