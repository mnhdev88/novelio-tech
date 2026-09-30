<?php
// ─────────────────────────────────────────────────────────────────────────────
// Razorpay subscriptions opened from /pay links.
//
//   GET  ?all=1        -> list (all=1 also shows checkouts never completed)
//   POST { id }        -> cancel: no further charges, nothing refunded
//
// Read live from Razorpay on every request rather than mirrored locally —
// Razorpay is the system of record for what has been charged, and a copy here
// could only ever drift from it. The one thing stored locally is who cancelled
// what and when, because "cancel at cycle end" is otherwise invisible until the
// cycle actually ends.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_lib.php';

$method = a_method(['GET', 'POST']);
$user = a_require($method === 'GET' ? 'payments.read' : 'payments.write');

// Loads the Razorpay credentials; answers 500 with a clear message if they are
// not on this server.
require_once __DIR__ . '/../razorpay/_lib.php';

const SUB_CANCELS = 'subscription-cancels.json';

// Statuses in which Razorpay may still charge something, i.e. worth cancelling.
const SUB_CANCELLABLE = ['authenticated', 'active', 'pending', 'halted'];

// ── POST: cancel ─────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $in = a_body();
    $id = (string) ($in['id'] ?? '');
    if (!preg_match('/^sub_[A-Za-z0-9]+$/', $id)) a_fail('Unknown subscription.', 400);

    [$code, $sub] = rzp_get_subscription($id);
    if ($code !== 200 || empty($sub['id']) || !rzp_is_our_subscription($sub)) {
        a_fail('Unknown subscription.', 404);
    }
    $status = (string) ($sub['status'] ?? '');
    if (!in_array($status, SUB_CANCELLABLE, true)) {
        a_fail('This subscription is ' . $status . ' and cannot be cancelled.', 409);
    }

    // An active subscription runs out the month the client already paid for.
    // Anything else has no paid cycle running — authorised-but-not-started (the
    // upfront months are still being used), or a charge that is failing — so it
    // stops now, which in both cases just means the next charge never happens.
    $atCycleEnd = $status === 'active';

    [$cCode, $res] = rzp_cancel_subscription($id, $atCycleEnd);
    if ($cCode !== 200) {
        error_log('[admin] subscription cancel failed (' . $cCode . '): ' . json_encode($res));
        a_fail('Razorpay refused the cancellation: '
            . a_clean_line($res['error']['description'] ?? 'unknown error', 160), 502);
    }

    $mark = [
        'at'           => gmdate('c'),
        'by'           => $user['email'] ?? '',
        'at_cycle_end' => $atCycleEnd,
        'ends_at'      => $atCycleEnd && !empty($sub['current_end']) ? (int) $sub['current_end'] : null,
    ];
    store_mutate(SUB_CANCELS, function ($all) use ($id, $mark) {
        $all[$id] = $mark;
        return $all;
    });

    a_audit('subscriptions.cancel', $id, [
        'at_cycle_end' => $atCycleEnd,
        'reference'    => $sub['notes']['reference'] ?? '',
    ]);
    a_respond(['ok' => true, 'cancel' => $mark]);
}

// ── GET: list ────────────────────────────────────────────────────────────────
$showAll = !empty($_GET['all']);
$cancels = store_get(SUB_CANCELS, []);

$items = [];
// Razorpay pages at 100. Five pages is far beyond this site's volume; the cap
// only keeps a runaway loop from hammering the API.
for ($page = 0; $page < 5; $page++) {
    [$code, $body] = rzp_list_subscriptions(100, $page * 100);
    if ($code !== 200 || !isset($body['items'])) {
        error_log('[admin] subscription list failed (' . $code . '): ' . json_encode($body));
        a_fail('Could not load subscriptions from Razorpay. Please try again.', 502);
    }
    foreach ($body['items'] as $sub) {
        if (!rzp_is_our_subscription($sub)) continue;
        // "created" = a checkout that was opened but never authorised.
        if (!$showAll && ($sub['status'] ?? '') === 'created') continue;

        $n     = $sub['notes'];
        $cycle = (int) ($n['cycle_subtotal_minor'] ?? 0) + (int) ($n['cycle_gst_minor'] ?? 0);
        $id    = (string) $sub['id'];

        $items[] = [
            'id'             => $id,
            'status'         => (string) ($sub['status'] ?? ''),
            'currency'       => $n['currency'] ?? '',
            'reference'      => $n['reference'] ?? '',
            'description'    => $n['description'] ?? '',
            'customer_name'  => $n['customer_name'] ?? '',
            'customer_email' => $n['customer_email'] ?? '',
            'cycle'          => rzp_money_minor($cycle),
            'gst_percent'    => (int) ($n['gst_percent'] ?? 0),
            'first_charge'   => rzp_money_minor((int) ($n['first_charge_minor'] ?? 0)),
            'total_months'   => (int) ($n['total_months'] ?? 0),
            'upfront_months' => (int) ($n['upfront_months'] ?? 0),
            'deposit'        => isset($n['deposit_minor']) ? rzp_money_minor((int) $n['deposit_minor']) : null,
            'paid_count'     => (int) ($sub['paid_count'] ?? 0),
            'total_count'    => (int) ($sub['total_count'] ?? 0),
            'remaining_count'=> isset($sub['remaining_count']) ? (int) $sub['remaining_count'] : null,
            'charge_at'      => $sub['charge_at'] ?? null,
            'current_end'    => $sub['current_end'] ?? null,
            'ended_at'       => $sub['ended_at'] ?? null,
            'created_at'     => $sub['created_at'] ?? null,
            'cancel'       => $cancels[$id] ?? null,
            'cancellable'    => in_array($sub['status'] ?? '', SUB_CANCELLABLE, true) && empty($cancels[$id]),
        ];
    }
    if (count($body['items']) < 100) break;
}

a_respond([
    'items' => $items,
    'env'   => RAZORPAY_ENV,
]);
