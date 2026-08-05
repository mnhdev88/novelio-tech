<?php
// ─────────────────────────────────────────────────────────────────────────────
// Payoneer Checkout (optile OPG) integration — shared helpers.
// HTTP + Basic auth, LIST create/read, signed return-ref, charge detection,
// pricing, logging, email. Loaded by the endpoint files.
// ─────────────────────────────────────────────────────────────────────────────

require __DIR__ . '/_config.php';

/** Send a JSON response and stop. */
function poyn_respond($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/** Read + decode the JSON request body (POST only). */
function poyn_read_json_body() {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
        poyn_respond(['error' => 'Method not allowed'], 405);
    }
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Basic-auth + vendor content-type headers required on every OPG call. */
function poyn_auth_headers() {
    return [
        'Authorization: Basic ' . base64_encode(PAYONEER_MERCHANT_CODE . ':' . PAYONEER_TOKEN),
        'Content-Type: ' . PAYONEER_CONTENT_TYPE,
        'Accept: ' . PAYONEER_CONTENT_TYPE,
    ];
}

/**
 * Low-level OPG call via cURL against a FULL url (OPG hands back absolute URLs
 * for the LIST resource and its operations, so callers pass those verbatim).
 * Returns [httpCode, decodedBody].
 */
function poyn_http($method, $url, $body = null) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => poyn_auth_headers(),
        CURLOPT_TIMEOUT        => 30,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $resp = curl_exec($ch);
    if ($resp === false) {
        $err = curl_error($ch);
        curl_close($ch);
        error_log('[payoneer] cURL error: ' . $err);
        poyn_respond(['error' => 'Could not reach the payment provider. Please try again.'], 502);
    }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($resp, true)];
}

/** Create a LIST session. $transaction is the OPG Transaction array. */
function poyn_create_list(array $transaction) {
    return poyn_http('POST', PAYONEER_API_BASE . '/lists', json_encode($transaction));
}

/** Read a LIST resource by its self URL (falls back to /lists/{longId}). */
function poyn_get_list($selfUrl, $longId = '') {
    $url = ($selfUrl !== '') ? $selfUrl : (PAYONEER_API_BASE . '/lists/' . rawurlencode($longId));
    return poyn_http('GET', $url);
}

/**
 * Compute the authoritative charge from a plan + billing cycle + add-ons.
 * Identical math to the PayPal integration (shared price table).
 * Returns [amountFloat, description, breakdown[]] or poyn_respond()s an error.
 */
function poyn_compute_charge($planId, $billing, $addonIds) {
    $plans  = $GLOBALS['PAYONEER_PLANS'];
    $addons = $GLOBALS['PAYONEER_ADDONS'];

    if (!isset($plans[$planId])) {
        poyn_respond(['error' => 'Unknown plan.'], 400);
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
        poyn_respond(['error' => 'This plan does not require a payment.'], 400);
    }

    $desc = $plan['name'] . ' plan — ' . $cycle;

    return [(float) $dueToday, $desc, $breakdown];
}

/** Format a number as an amount string, e.g. 249 -> "249.00". */
function poyn_money($n) {
    return number_format((float) $n, 2, '.', '');
}

/** Trim, strip control/newline chars, and length-cap a free-text label. */
function poyn_clean_text($s, $max = 120) {
    $s = is_string($s) ? $s : '';
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s);
    $s = trim(preg_replace('/\s+/u', ' ', $s));
    return mb_substr($s, 0, $max);
}

/** A unique, unguessable transaction id for a new LIST. */
function poyn_new_txn_id() {
    return 'nov_' . bin2hex(random_bytes(12));
}

// ── Pending-context store (survives the hosted-page redirect) ────────────────
// The buyer round-trips through Payoneer's hosted page and back to our return
// URL. The LIST's returnUrl must be set BEFORE the LIST exists, so we can't carry
// the LIST id in it — instead we mint an unguessable txn id (in the returnUrl)
// and stash the trusted context (LIST id/self URL, server-set amount, plan meta)
// server-side, ABOVE the web root. The browser only ever holds the opaque txn id;
// it can't read or tamper with the amount. Holds no card data.

/** Stash context for an in-flight payment, keyed by txn id. */
function poyn_pending_put($txnId, array $ctx) {
    $ctx['txn'] = $txnId;
    $ctx['ts']  = gmdate('c');
    $line = json_encode($ctx) . "\n";
    if (@file_put_contents(PAYONEER_PENDING_LOG, $line, FILE_APPEND | LOCK_EX) === false) {
        error_log('[payoneer] pending (log unwritable): ' . $line);
    }
}

/** Fetch stashed context by txn id (last write wins). Null if unknown. */
function poyn_pending_get($txnId) {
    if ($txnId === '' || !is_file(PAYONEER_PENDING_LOG)) return null;
    $fh = @fopen(PAYONEER_PENDING_LOG, 'r');
    if (!$fh) return null;
    $found = null;
    while (($line = fgets($fh)) !== false) {
        $rec = json_decode(trim($line), true);
        if (is_array($rec) && ($rec['txn'] ?? '') === $txnId) $found = $rec;
    }
    fclose($fh);
    return $found;
}

// ── Result interpretation ────────────────────────────────────────────────────
// NOTE: the exact LIST-level status vocabulary after a HOSTED payment is not
// fully documented publicly — VERIFY these sets against a real sandbox payment
// (see PAYONEER-SETUP.md "Confirm the status codes"). We read the authoritative
// server-side resource and classify defensively: only an explicit paid status
// counts as success; unknown/interim states are treated as "pending", never paid.

function poyn_paid_statuses()   { return ['charged', 'paid', 'paid_out', 'preauthorized', 'captured', 'completed', 'settled']; }
function poyn_failed_statuses() { return ['aborted', 'expired', 'failed', 'declined', 'canceled', 'cancelled', 'rejected', 'chargeback']; }

/** Recursively collect all status.code strings found anywhere in the response. */
function poyn_collect_status_codes($node, array &$out) {
    if (!is_array($node)) return;
    if (isset($node['status']) && is_array($node['status']) && isset($node['status']['code'])) {
        $out[] = strtolower((string) $node['status']['code']);
    }
    foreach ($node as $v) {
        if (is_array($v)) poyn_collect_status_codes($v, $out);
    }
}

/**
 * Classify a LIST/charge response as 'paid' | 'failed' | 'pending'.
 * Success requires an explicit paid status code somewhere in the resource.
 */
function poyn_result_status(array $body) {
    $codes = [];
    poyn_collect_status_codes($body, $codes);
    $paid   = array_intersect($codes, poyn_paid_statuses());
    if (!empty($paid)) return 'paid';
    $failed = array_intersect($codes, poyn_failed_statuses());
    // A hard-abort interaction with no paid status is a definitive failure.
    $interaction = strtoupper((string) ($body['interaction']['code'] ?? ''));
    if (!empty($failed) || $interaction === 'ABORT') return 'failed';
    return 'pending';
}

// ── Logging + notification (shared order log with PayPal) ─────────────────────

/** True if a completed order for this LIST was already recorded (idempotency). */
function poyn_already_finalized($longId) {
    if ($longId === '' || !is_file(PAYONEER_ORDER_LOG)) return false;
    $contents = @file_get_contents(PAYONEER_ORDER_LOG);
    if ($contents === false) return false;
    return strpos($contents, '"poyn_long_id":"' . $longId . '"') !== false;
}

/** Append one JSON line to the order log (above web root). */
function poyn_log_order(array $record) {
    $line = json_encode($record) . "\n";
    if (@file_put_contents(PAYONEER_ORDER_LOG, $line, FILE_APPEND | LOCK_EX) === false) {
        error_log('[payoneer] order (log unwritable): ' . $line);
    }
}

/**
 * Record a completed payment from its pending context — once. Idempotent: if a
 * completed order for this LIST already exists (e.g. webhook beat the return
 * page, or vice-versa), it does nothing. Returns the order record (always), and
 * whether it was newly written.
 */
function poyn_finalize_from_ctx(array $ctx) {
    $longId = (string) ($ctx['long_id'] ?? '');
    $cust   = is_array($ctx['customer'] ?? null) ? $ctx['customer'] : [];
    $record = [
        'ts'             => gmdate('c'),
        'env'            => PAYONEER_ENV,
        'gateway'        => 'payoneer',
        'type'           => $ctx['type'] ?? 'plan',
        'poyn_long_id'   => $longId,
        'poyn_txn_id'    => (string) ($ctx['txn'] ?? ''),
        'amount'         => (float) ($ctx['amount'] ?? 0),
        'currency'       => $ctx['currency'] ?? PAYONEER_CURRENCY,
        'plan_id'        => $ctx['planId'] ?? 'custom',
        'billing'        => $ctx['billing'] ?? 'one-time',
        'description'    => $ctx['description'] ?? '',
        'breakdown'      => $ctx['breakdown'] ?? [],
        'reference'      => $ctx['reference'] ?? '',
        'customer_id'    => $cust['id'] ?? '',
        'customer_name'  => $cust['name'] ?? '',
        'customer_email' => $cust['email'] ?? '',
    ];
    if (poyn_already_finalized($longId)) {
        return [$record, false];
    }
    poyn_log_order($record);
    poyn_notify_team($record);
    return [$record, true];
}

/** Best-effort notification email to the team. Never blocks the response. */
function poyn_notify_team(array $order) {
    $to = PAYONEER_NOTIFY_EMAIL;
    $subject = 'New payment (Payoneer): ' . $order['description'] . ' — $' . poyn_money($order['amount']);
    $lines = [
        'A payment was completed via Payoneer (' . PAYONEER_ENV . ').',
        '',
        'Amount:   $' . poyn_money($order['amount']) . ' ' . $order['currency'],
        'Plan:     ' . $order['description'],
        'Add-ons:  ' . (empty($order['breakdown']) ? 'none' : implode(', ', $order['breakdown'])),
        'Customer: ' . ($order['customer_name'] ?? '—') . ' <' . ($order['customer_email'] ?? '—') . '>',
        'Payoneer LIST:  ' . $order['poyn_long_id'],
        'Transaction id: ' . $order['poyn_txn_id'],
        '',
        'Reminder: this is a one-time charge. Follow up to onboard and confirm scope.',
    ];
    $headers = 'From: no-reply@noveliotech.com' . "\r\n" . 'Content-Type: text/plain; charset=UTF-8';
    @mail($to, $subject, implode("\n", $lines), $headers);
}
