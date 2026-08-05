<?php
// ─────────────────────────────────────────────────────────────────────────────
// PayPal integration — shared helpers (HTTP, auth, pricing, logging, email).
// Loaded by create-order.php and capture-order.php.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_config.php';

/** Send a JSON response and stop. */
function respond($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/** Read + decode the JSON request body (POST only). */
function read_json_body() {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        respond(['error' => 'Method not allowed'], 405);
    }
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Low-level PayPal REST call via cURL. Returns [httpCode, decodedBody]. */
function paypal_http($method, $path, $headers = [], $body = null) {
    $ch = curl_init(PAYPAL_API_BASE . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 30,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $resp = curl_exec($ch);
    if ($resp === false) {
        $err = curl_error($ch);
        curl_close($ch);
        error_log('[paypal] cURL error: ' . $err);
        respond(['error' => 'Could not reach the payment provider. Please try again.'], 502);
    }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($resp, true)];
}

/** OAuth2 access token via client-credentials. */
function paypal_access_token() {
    [$code, $body] = paypal_http(
        'POST',
        '/v1/oauth2/token',
        [
            'Authorization: Basic ' . base64_encode(PAYPAL_CLIENT_ID . ':' . PAYPAL_SECRET),
            'Content-Type: application/x-www-form-urlencoded',
        ],
        'grant_type=client_credentials'
    );
    if ($code !== 200 || empty($body['access_token'])) {
        error_log('[paypal] token error: ' . json_encode($body));
        respond(['error' => 'Payment authorization failed. Please try again.'], 502);
    }
    return $body['access_token'];
}

/**
 * Compute the authoritative charge from a plan + billing cycle + add-ons.
 * Mirrors the CheckoutPage math: yearly pays the flat yearly_total, monthly
 * collects upfront_months at checkout (or one month on legacy plans).
 * Returns [amountFloat, description, breakdown[]] or respond()s with an error.
 */
function compute_charge($planId, $billing, $addonIds) {
    $plans  = $GLOBALS['PAYPAL_PLANS'];
    $addons = $GLOBALS['PAYPAL_ADDONS'];

    if (!isset($plans[$planId])) {
        respond(['error' => 'Unknown plan.'], 400);
    }
    $billing = ($billing === 'yearly') ? 'yearly' : 'monthly';
    $plan = $plans[$planId];

    $addonTotal = 0;
    $breakdown = [];
    foreach ((array) $addonIds as $id) {
        if (isset($addons[$id])) {
            $addonTotal += $addons[$id]['price'];
            $breakdown[] = $addons[$id]['name'] . ' (+$' . $addons[$id]['price'] . '/mo)';
        }
    }

    // Plan portion due today. Add-ons are always billed monthly and are never
    // multiplied into a yearly or upfront total.
    if ($billing === 'yearly') {
        // A flat yearly_total is authoritative; otherwise fall back to 12x.
        $planDue = isset($plan['yearly_total'])
            ? $plan['yearly_total']
            : $plan['yearly'] * 12;
        $cycle = 'yearly (12 months, paid in full)';
    } elseif (isset($plan['upfront_months'])) {
        // 3 months upfront at checkout; the remaining 9 are billed monthly.
        $months  = (int) $plan['upfront_months'];
        $planDue = $plan['monthly'] * $months;
        $cycle = $months . ' months upfront, then ' . (12 - $months)
            . ' x $' . $plan['monthly'] . '/mo';
    } else {
        $planDue = $plan['monthly'];
        $cycle = 'monthly';
    }

    $dueToday = $planDue + $addonTotal;

    if ($dueToday <= 0) {
        respond(['error' => 'This plan does not require a payment.'], 400);
    }

    $desc = $plan['name'] . ' plan — ' . $cycle;

    return [(float) $dueToday, $desc, $breakdown];
}

/** Format a number as a PayPal amount string, e.g. 249 -> "249.00". */
function money($n) {
    return number_format((float) $n, 2, '.', '');
}

/** Trim, strip control/newline chars, and length-cap a free-text label. */
function clean_text($s, $max = 120) {
    $s = is_string($s) ? $s : '';
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s); // drop control chars/newlines
    $s = trim(preg_replace('/\s+/u', ' ', $s));
    return mb_substr($s, 0, $max);
}

/** Append one JSON line to the order log (above web root); fall back to error_log. */
function log_order(array $record) {
    $line = json_encode($record) . "\n";
    if (@file_put_contents(PAYPAL_ORDER_LOG, $line, FILE_APPEND | LOCK_EX) === false) {
        error_log('[paypal] order (log unwritable): ' . $line);
    }
}

/** Best-effort notification email to the team. Never blocks the response. */
function notify_team(array $order) {
    $to = PAYPAL_NOTIFY_EMAIL;
    $subject = 'New payment: ' . $order['description'] . ' — $' . money($order['amount']);
    $lines = [
        'A payment was captured via PayPal (' . PAYPAL_ENV . ').',
        '',
        'Amount:   $' . money($order['amount']) . ' ' . PAYPAL_CURRENCY,
        'Plan:     ' . $order['description'],
        'Add-ons:  ' . (empty($order['breakdown']) ? 'none' : implode(', ', $order['breakdown'])),
        'Customer: ' . ($order['customer_name'] ?? '—') . ' <' . ($order['customer_email'] ?? '—') . '>',
        'PayPal order:   ' . $order['order_id'],
        'PayPal capture: ' . $order['capture_id'],
        'Payer email:    ' . ($order['payer_email'] ?? '—'),
        '',
        'Reminder: this is a one-time charge. Follow up to onboard and confirm scope.',
    ];
    $headers = 'From: no-reply@noveliotech.com' . "\r\n" . 'Content-Type: text/plain; charset=UTF-8';
    @mail($to, $subject, implode("\n", $lines), $headers);
}
