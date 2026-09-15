<?php
// ─────────────────────────────────────────────────────────────────────────────
// Free SEO Audit — exchange an email address for the full report.
//
//   POST { token, email, phone, name, company, consent, t, website }
//        -> { ok, sent }        ...and the summary goes out by email.
//
// email and phone are both required; name and company are not.
//
// NOTHING ABOUT THE REPORT COMES BACK IN THIS RESPONSE. The findings are emailed
// instead, and the page says so. That is a deliberate reversal of how this
// started: the report on screen was instant gratification, but a summary in the
// inbox is a thing the recipient keeps, forwards to a partner, and can reply to
// — and a reply is the point of the whole tool.
//
// This is the endpoint the whole tool exists for. Two rules shape it:
//
//   1. THE EMAIL STILL GOES OUT IF LOGGING FAILS. If the data directory is not
//      writable or the disk is full, the visitor still gets what they were
//      promised. A lead we failed to log is a bad day; a visitor who handed over
//      their details and got an error page is a worse one, and it is the version
//      they tell people about. Sending, by contrast, is NOT swallowed — if the
//      email did not go, saying so is the only honest answer.
//
//   2. It writes audits.jsonl straight into the admin panel's data directory
//      rather than loading the panel's own store. That store pulls in
//      ../admin/_config.php, which exits 503 when the CMS is not configured —
//      which would take the audit tool down with it for a reason that has
//      nothing to do with the audit tool.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_checks.php';
require_once __DIR__ . '/_mail.php';

au_method('POST');

$in = au_body();

if (!au_check_bot_signals($in)) {
    // Looks successful, sends nothing. A bot gets no report and no error to
    // learn from; no real visitor ever lands here.
    au_respond(['ok' => true, 'sent' => true]);
}

$token = (string) ($in['token'] ?? '');
if (!preg_match('/^[a-f0-9]{32}$/', $token)) {
    au_fail('That audit has expired. Please run it again.', 400, 'bad_token');
}

$report = au_cache_get('t' . $token, AUDIT_CACHE_TTL);
if ($report === null) {
    au_fail('That audit has expired — results are kept for 24 hours. Please run it again.', 404, 'expired');
}

$email = strtolower(trim((string) ($in['email'] ?? '')));
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    au_fail('Please enter a valid email address so we can send the report.');
}

// Phone is required, and it has to be required HERE as well as in the form —
// anything enforced only in the browser is enforced only on people who use the
// browser. Checked by digit count for the reason given in UnlockGate.jsx: the
// punctuation in a real phone number is not something worth policing, and a
// stricter rule on a mandatory field turns genuine leads away over formatting.
$phone = au_clean($in['phone'] ?? '', 60);
$phoneDigits = preg_replace('/\D/', '', $phone);
if (strlen($phoneDigits) < 7 || strlen($phoneDigits) > 20) {
    au_fail('Please enter a phone number we can reach you on, including the country code.');
}

// Record the lead, then hand over the report. Wrapped because rule 1 above is
// the whole point: nothing that happens in here may cost the visitor the report.
try {
    au_record_lead($in, $report, $email, $phone);
} catch (Throwable $e) {
    @error_log('[audit] could not record lead: ' . $e->getMessage());
}

// Mark the audit converted. Nothing reads this today — the report is emailed
// rather than revealed, so there is no second request to unseal — but it is the
// record that these details were handed over for this particular audit.
$report['unlocked'] = true;
au_cache_put('t' . $token, $report);

// Send the summary. This is now the deliverable, so unlike recording the lead it
// is NOT swallowed on failure — a visitor told "check your inbox" when nothing
// was sent is worse off than one told plainly that it did not go.
$sent = au_send_report($report, $email, au_clean($in['name'] ?? '', 190));

au_respond([
    'ok'    => true,
    'sent'  => $sent,
    'email' => $email,
]);

// ── Recording the lead ───────────────────────────────────────────────────────

function au_record_lead(array $in, array $report, $email, $phone) {
    $record = [
        'id'          => bin2hex(random_bytes(12)),
        'created_at'  => gmdate('c'),
        'email'       => $email,
        'name'        => au_clean($in['name'] ?? '', 190),
        'company'     => au_clean($in['company'] ?? '', 190),
        'phone'       => $phone,   // already cleaned and checked above
        // The audited URL is the valuable half of this record. It says what the
        // business does, what it is built on, and what is broken — before anyone
        // picks up the phone.
        'url'         => au_clean($report['final_url'] ?? $report['url'] ?? '', 500),
        'host'        => au_clean($report['host'] ?? '', 190),
        'score'       => (int) ($report['overall'] ?? 0),
        'fail_count'  => count(array_filter($report['issues'], function ($i) { return $i['state'] === 'fail'; })),
        'top_issues'  => array_slice(array_map(function ($i) { return $i['title']; }, au_rank_problems($report['issues'])), 0, 5),
        'consent'     => !empty($in['consent']),
        'page'        => au_clean($in['page'] ?? '/free-seo-audit', 190),
        'ip'          => au_ip(),
        'ua'          => au_clean($_SERVER['HTTP_USER_AGENT'] ?? '', 255),
        'status'      => 'new',
    ];

    au_append_lead($record);
    au_notify($record);
}

/**
 * Append to audits.jsonl in the admin panel's data directory, in exactly the
 * format _store.php writes — one JSON object per line, id and created_at
 * present — so the panel can read this file with its existing code.
 */
function au_append_lead(array $record) {
    // AUDIT_CACHE_DIR is <data dir>/audit-cache, so its parent is the data dir
    // the panel reads leads.jsonl and newsletter.jsonl from.
    $dir = dirname(AUDIT_CACHE_DIR);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('data dir unavailable: ' . $dir);
    }

    $line = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($line === false) throw new RuntimeException('cannot encode record');

    $fh = @fopen($dir . '/audits.jsonl', 'a');
    if ($fh === false) throw new RuntimeException('cannot open audits.jsonl');

    try {
        flock($fh, LOCK_EX);
        fwrite($fh, $line . "\n");
        fflush($fh);
    } finally {
        flock($fh, LOCK_UN);
        fclose($fh);
    }
}

/**
 * Tell the team, immediately. Internal, to our own domain, and separate from the
 * summary the visitor receives — this one carries the phone number and the lead
 * context, which is not something to put in the copy going out to them.
 */
function au_notify(array $r) {
    $to = AUDIT_NOTIFY_EMAIL;
    if ($to === '' || !filter_var($to, FILTER_VALIDATE_EMAIL)) return;

    $lines = [
        'A free SEO audit was unlocked.',
        '',
        'Site:    ' . $r['url'],
        'Score:   ' . $r['score'] . '/100 (' . $r['fail_count'] . ' failing checks)',
        '',
        'Email:   ' . $r['email'],
        'Name:    ' . ($r['name'] ?: '—'),
        'Company: ' . ($r['company'] ?: '—'),
        'Phone:   ' . ($r['phone'] ?: '—'),
        '',
        'Biggest problems found:',
    ];
    foreach ($r['top_issues'] as $t) $lines[] = '  - ' . $t;
    $lines[] = '';
    $lines[] = 'Opening line for the follow-up: lead with the worst finding above, name their';
    $lines[] = 'site, and say what it is costing them. They already saw the score.';

    $headers = 'From: Novelio Audit <noreply@noveliotech.com>' . "\r\n"
        . 'Reply-To: ' . $r['email'] . "\r\n"
        . 'Content-Type: text/plain; charset=UTF-8';

    @mail($to, 'SEO audit lead: ' . $r['host'] . ' (' . $r['score'] . '/100)', implode("\n", $lines), $headers);
}
