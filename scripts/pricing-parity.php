<?php
// Test helper for scripts/test-pricing-parity.mjs — NOT deployed (scripts/ is
// outside public/). Prints rzp_compute_charge()'s answer for every combination
// on stdin as JSON, so the Node side can diff it against src/utils/pricing.js.
//
// Run via the npm script, which supplies dummy credentials through the env so
// _config.php loads without a real key.

require __DIR__ . '/../public/api/razorpay/_lib.php';

// The INR guard exists to stop real charges against placeholder prices; the
// maths it guards still needs testing.
$GLOBALS['NOVELIO_INR_CONFIRMED'] = true;

$cases = json_decode(stream_get_contents(STDIN), true);
$out = [];

foreach ($cases as $c) {
    $charge = rzp_compute_charge($c['planId'], $c['billing'], $c['addonIds'], $c['currency']);
    $out[] = [
        'key'            => $c['key'],
        'subtotal_minor' => $charge['subtotal_minor'],
        'gst_minor'      => $charge['gst_minor'],
        'total_minor'    => $charge['total_minor'],
        'gst_percent'    => $charge['gst_percent'],
    ];
}

echo json_encode($out);
