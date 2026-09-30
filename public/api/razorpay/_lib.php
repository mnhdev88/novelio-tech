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

/**
 * Split a quoted custom amount (minor units) into [subtotal, gst] per the /pay
 * ?gst= mode. 'add' (default): the amount is ex-GST and GST goes on top.
 * 'inclusive': the amount already contains GST, so it is backed out.
 * Shared by one-off custom orders and subscriptions so the two never drift.
 */
function rzp_custom_split($enteredMinor, $currency, $gstMode) {
    $gstPercent = rzp_gst_percent($currency);
    if ($gstPercent === 0) return [$enteredMinor, 0];
    if ($gstMode === 'inclusive') {
        // sub = total * 100 / (100 + p)
        $subtotal = (int) round($enteredMinor * 100 / (100 + $gstPercent));
        return [$subtotal, $enteredMinor - $subtotal];
    }
    return [$enteredMinor, (int) round($enteredMinor * $gstPercent / 100)];
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

// ── Subscriptions (/pay links with ?months=) ─────────────────────────────────
//
// A subscription is a Plan (amount + period) plus a Subscription on it. The
// buyer authorises a card / UPI / e-mandate in the same overlay, and Razorpay
// then charges each cycle on its own — every charge reaches us as a webhook.
//
// "Upfront + monthly" is Razorpay's upfront-amount pattern: the first N months
// go in as an add-on, which is collected WITH the authorisation, and start_at
// pushes the first regular cycle N months out. So months=12&upfront=3 is one
// charge of 3x today, then 9 monthly charges starting in three months.

/**
 * Find or create the monthly plan for this exact amount. Plans cannot be deleted
 * in Razorpay, so one is reused per (mode, currency, amount) instead of minting
 * a new one on every click and burying the dashboard in duplicates.
 */
function rzp_monthly_plan_id($cycleMinor, $currency) {
    $key   = RAZORPAY_ENV . '|' . $currency . '|' . (int) $cycleMinor;
    $cache = [];
    if (is_file(RAZORPAY_PLAN_CACHE)) {
        $cache = json_decode((string) @file_get_contents(RAZORPAY_PLAN_CACHE), true);
        if (!is_array($cache)) $cache = [];
    }
    if (!empty($cache[$key])) return $cache[$key];

    [$code, $body] = rzp_http('POST', '/plans', json_encode([
        'period'   => 'monthly',
        'interval' => 1,
        'item'     => [
            'name'     => RAZORPAY_BRAND_NAME . ' — monthly payment',
            'amount'   => (int) $cycleMinor,
            'currency' => $currency,
        ],
        'notes'    => ['source' => 'noveliotech.com/pay'],
    ]));
    if ($code !== 200 || empty($body['id'])) {
        error_log('[razorpay] plan create failed (' . $code . '): ' . json_encode($body));
        return null;
    }

    // Re-read under the lock so two first-time buyers can't drop each other's entry.
    $fh = @fopen(RAZORPAY_PLAN_CACHE, 'c+');
    if ($fh && flock($fh, LOCK_EX)) {
        $current = json_decode((string) stream_get_contents($fh), true);
        if (!is_array($current)) $current = [];
        $current[$key] = $body['id'];
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($current, JSON_PRETTY_PRINT));
        flock($fh, LOCK_UN);
    }
    if ($fh) fclose($fh);

    return $body['id'];
}

function rzp_create_subscription(array $payload) { return rzp_http('POST', '/subscriptions', json_encode($payload)); }
function rzp_get_subscription($id)               { return rzp_http('GET', '/subscriptions/' . rawurlencode($id)); }
function rzp_get_invoice($id)                    { return rzp_http('GET', '/invoices/' . rawurlencode($id)); }

/**
 * Cancel. At cycle end, the cycle already paid for runs out and nothing more is
 * charged; immediately, nothing more is charged from now. Neither refunds.
 */
function rzp_cancel_subscription($id, $atCycleEnd) {
    return rzp_http('POST', '/subscriptions/' . rawurlencode($id) . '/cancel',
        json_encode(['cancel_at_cycle_end' => $atCycleEnd ? 1 : 0]));
}

/** List subscriptions, newest first. Razorpay pages at most 100 per call. */
function rzp_list_subscriptions($count = 100, $skip = 0) {
    return rzp_http('GET', '/subscriptions?count=' . (int) $count . '&skip=' . (int) $skip);
}

/**
 * Subscription checkout signature: HMAC-SHA256 of "payment_id|subscription_id"
 * — note the order is the reverse of the one-off order signature.
 */
function rzp_verify_subscription_signature($paymentId, $subscriptionId, $signature) {
    if ($paymentId === '' || $subscriptionId === '' || !is_string($signature) || $signature === '') return false;
    $expected = hash_hmac('sha256', $paymentId . '|' . $subscriptionId, RAZORPAY_KEY_SECRET);
    return hash_equals($expected, $signature);
}

/** True for subscriptions created by create-subscription.php (not the dashboard). */
function rzp_is_our_subscription(array $sub) {
    return (($sub['notes']['type'] ?? '') === 'subscription');
}

/** Human schedule line, e.g. "3 months upfront, then 9 x $150.00/mo (12 months)". */
function rzp_subscription_schedule(array $notes, $currency) {
    $sym     = rzp_symbol($currency);
    $cycle   = (int) ($notes['cycle_subtotal_minor'] ?? 0) + (int) ($notes['cycle_gst_minor'] ?? 0);
    $months  = (int) ($notes['total_months'] ?? 0);
    $upfront = (int) ($notes['upfront_months'] ?? 0);
    $per     = $sym . rzp_money_minor($cycle) . '/mo';
    if (isset($notes['deposit_minor'])) {
        return $sym . rzp_money_minor((int) $notes['deposit_minor']) . ' down payment, then ' . $months . ' x ' . $per;
    }
    return $upfront > 0
        ? $upfront . ' months upfront, then ' . ($months - $upfront) . ' x ' . $per . ' (' . $months . ' months)'
        : $months . ' x ' . $per;
}

/**
 * Record one subscription charge — the upfront/first one or any later cycle —
 * once. Context comes from the SUBSCRIPTION's notes as stored at creation, never
 * from the browser or the webhook body. Idempotent on the payment id, shared
 * with rzp_finalize(), so the browser and webhook can race harmlessly.
 * Returns [record, wasNewlyWritten].
 */
function rzp_finalize_subscription_charge(array $sub, array $payment) {
    $notes     = is_array($sub['notes'] ?? null) ? $sub['notes'] : [];
    $paymentId = (string) ($payment['id'] ?? '');
    $currency  = (string) ($payment['currency'] ?? 'INR');
    $paidMinor = (int) ($payment['amount'] ?? 0);

    // When the first charge is an add-on (deposit or upfront months), the regular
    // cycles start a month or more later, so paid_count is still 0 while it is
    // being recorded. Otherwise the authorisation is cycle 1 itself.
    $addonFirst = isset($notes['deposit_minor']) || (int) ($notes['upfront_months'] ?? 0) > 0;
    $isFirst = $paidMinor === (int) ($notes['first_charge_minor'] ?? -1)
        && (int) ($sub['paid_count'] ?? 0) <= ($addonFirst ? 0 : 1);

    // Every regular charge is a whole number of cycles (1, or the upfront N), so
    // the GST inside it is that many cycles' GST — exact, no rounding drift. A
    // down payment carries its own GST figure, stored when it was quoted.
    $cycleMinor = (int) ($notes['cycle_subtotal_minor'] ?? 0) + (int) ($notes['cycle_gst_minor'] ?? 0);
    $cycleGst   = (int) ($notes['cycle_gst_minor'] ?? 0);
    $gstMinor   = $isFirst && isset($notes['deposit_gst_minor'])
        ? (int) $notes['deposit_gst_minor']
        : ($cycleMinor > 0 ? (int) round($paidMinor * $cycleGst / $cycleMinor) : 0);

    $record = [
        'ts'                  => gmdate('c'),
        'env'                 => RAZORPAY_ENV,
        'gateway'             => 'razorpay',
        'type'                => 'subscription',
        'charge'              => $isFirst ? 'first' : 'recurring',
        'rzp_subscription_id' => (string) ($sub['id'] ?? ''),
        'rzp_payment_id'      => $paymentId,
        'method'              => (string) ($payment['method'] ?? ''),
        'amount'              => (float) rzp_money_minor($paidMinor),
        'currency'            => $currency,
        'subtotal'            => (float) rzp_money_minor($paidMinor - $gstMinor),
        'gst'                 => (float) rzp_money_minor($gstMinor),
        'gst_percent'         => (int) ($notes['gst_percent'] ?? 0),
        'plan_id'             => 'custom',
        'billing'             => 'subscription',
        'schedule'            => rzp_subscription_schedule($notes, $currency),
        'paid_count'          => (int) ($sub['paid_count'] ?? 0),
        'total_count'         => (int) ($sub['total_count'] ?? 0),
        'description'         => $notes['description'] ?? '',
        'breakdown'           => [],
        'reference'           => $notes['reference'] ?? '',
        'customer_name'       => $notes['customer_name'] ?? '',
        'customer_email'      => $notes['customer_email'] ?? ($payment['email'] ?? ''),
    ];

    if (rzp_already_finalized($paymentId)) {
        return [$record, false];
    }
    rzp_log_order($record);
    rzp_notify_subscription_charge($record);
    return [$record, true];
}

/**
 * Status events (failed charge, halted, cancelled, completed) carry no payment id
 * to dedupe on, and Razorpay retries webhooks — so the event id is remembered
 * instead, keeping a retry from emailing the client twice.
 */
function rzp_event_seen($eventId) {
    if ($eventId === '' || !is_file(RAZORPAY_EVENT_LOG)) return false;
    $contents = @file_get_contents(RAZORPAY_EVENT_LOG);
    return $contents !== false && strpos($contents, '"event_id":"' . $eventId . '"') !== false;
}

function rzp_log_event($eventId, $name, $subscriptionId) {
    $line = json_encode([
        'ts' => gmdate('c'), 'event_id' => $eventId, 'event' => $name, 'subscription' => $subscriptionId,
    ]) . "\n";
    @file_put_contents(RAZORPAY_EVENT_LOG, $line, FILE_APPEND | LOCK_EX);
}

/** Plain-text email, best effort. */
function rzp_mail($to, $subject, array $lines) {
    if (!is_string($to) || !filter_var($to, FILTER_VALIDATE_EMAIL)) return;
    $headers = 'From: no-reply@noveliotech.com' . "\r\n"
        . 'Reply-To: ' . RAZORPAY_NOTIFY_EMAIL . "\r\n"
        . 'Content-Type: text/plain; charset=UTF-8';
    @mail($to, $subject, implode("\n", $lines), $headers);
}

/** Team + client emails for a successful subscription charge. */
function rzp_notify_subscription_charge(array $r) {
    $sym    = rzp_symbol($r['currency']);
    $amount = $sym . number_format($r['amount'], 2) . ' ' . $r['currency'];
    $label  = $r['description'] . ($r['reference'] ? ' (' . $r['reference'] . ')' : '');
    $first  = $r['charge'] === 'first';
    $tax    = $r['gst'] > 0
        ? 'Subtotal ' . $sym . number_format($r['subtotal'], 2) . ' + GST (' . $r['gst_percent'] . '%) ' . $sym . number_format($r['gst'], 2)
        : null;

    rzp_mail(RAZORPAY_NOTIFY_EMAIL,
        ($first ? 'Subscription started (Razorpay): ' : 'Subscription charge (Razorpay): ') . $label . ' — ' . $amount,
        array_values(array_filter([
            ($first ? 'A client set up a subscription' : 'A subscription renewed') . ' via Razorpay (' . RAZORPAY_ENV . ').',
            '',
            'Amount:       ' . $amount,
            $tax ? 'Tax:          ' . $tax : null,
            'Schedule:     ' . $r['schedule'],
            'Charges paid: ' . $r['paid_count'] . ' of ' . $r['total_count'] . ' monthly cycles',
            'Method:       ' . ($r['method'] ?: '—'),
            'Customer:     ' . ($r['customer_name'] ?: '—') . ' <' . ($r['customer_email'] ?: '—') . '>',
            'Subscription: ' . $r['rzp_subscription_id'],
            'Payment:      ' . $r['rzp_payment_id'],
            'Reference:    ' . ($r['reference'] ?: '—'),
        ], 'is_string')));

    rzp_mail($r['customer_email'],
        ($first ? 'Your subscription with Novelio Technologies is set up' : 'Payment received — Novelio Technologies'),
        array_values(array_filter([
            'Hi ' . ($r['customer_name'] ?: 'there') . ',',
            '',
            $first
                ? 'Thank you — your subscription is set up and your first payment of ' . $amount . ' has been received.'
                : 'We have received your scheduled payment of ' . $amount . '.',
            $tax,
            '',
            'For:       ' . $label,
            'Schedule:  ' . $r['schedule'],
            'Payment ID: ' . $r['rzp_payment_id'],
            '',
            'Payments are collected automatically by Razorpay on our behalf. Reply to this',
            'email if you have any question about your billing.',
            '',
            '— Novelio Technologies',
        ], 'is_string')));
}

/**
 * Team + client emails for a subscription status change. Only the events worth
 * interrupting someone for are handled; everything else is ignored.
 */
function rzp_notify_subscription_status($event, array $sub) {
    $notes    = is_array($sub['notes'] ?? null) ? $sub['notes'] : [];
    $label    = ($notes['description'] ?? 'Subscription') . (!empty($notes['reference']) ? ' (' . $notes['reference'] . ')' : '');
    $customer = ($notes['customer_name'] ?? '') ?: 'there';
    $email    = $notes['customer_email'] ?? '';
    $id       = (string) ($sub['id'] ?? '');
    $progress = (int) ($sub['paid_count'] ?? 0) . ' of ' . (int) ($sub['total_count'] ?? 0) . ' monthly cycles paid';

    $copy = [
        'subscription.pending' => [
            'team'   => 'A scheduled charge FAILED. Razorpay will retry automatically.',
            'client' => 'We could not collect your scheduled payment. Razorpay will retry it automatically over the next few days — please make sure your card or bank mandate is active and has sufficient funds.',
        ],
        'subscription.halted' => [
            'team'   => 'All retries FAILED — the subscription is halted and will not charge again until it is fixed. Contact the client.',
            'client' => 'We were unable to collect your scheduled payment after several attempts, so the subscription is on hold. Please reply to this email and we will help you update your payment method.',
        ],
        'subscription.cancelled' => [
            'team'   => 'The subscription was cancelled. No further charges will be made.',
            'client' => 'Your subscription has been cancelled. No further payments will be collected.',
        ],
        'subscription.completed' => [
            'team'   => 'The subscription completed its final cycle.',
            'client' => 'Your final scheduled payment has been collected and your subscription is now complete. Thank you!',
        ],
    ];
    if (!isset($copy[$event])) return;

    $short = substr($event, strlen('subscription.'));
    rzp_mail(RAZORPAY_NOTIFY_EMAIL, 'Subscription ' . $short . ' (Razorpay): ' . $label, [
        $copy[$event]['team'],
        '',
        'Subscription: ' . $id . ' (' . RAZORPAY_ENV . ')',
        'Progress:     ' . $progress,
        'Customer:     ' . ($notes['customer_name'] ?? '—') . ' <' . ($email ?: '—') . '>',
        'Reference:    ' . (($notes['reference'] ?? '') ?: '—'),
    ]);

    rzp_mail($email, 'Your subscription with Novelio Technologies — ' . $short, [
        'Hi ' . $customer . ',',
        '',
        $copy[$event]['client'],
        '',
        'For: ' . $label,
        '',
        '— Novelio Technologies',
    ]);
}
