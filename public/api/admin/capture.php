<?php
// ─────────────────────────────────────────────────────────────────────────────
// Public form capture — the ONE unauthenticated endpoint in this directory.
//
//   POST { type: 'lead'|'newsletter'|'application', ...fields }
//
// The site currently posts to Formspree; this records the same submissions in
// the panel's own store so the client can see and export them. It runs alongside
// Formspree rather than instead of it, so form delivery keeps working even if
// this endpoint is down.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_lib.php';

a_method('POST');

$in = a_body();
$type = (string) ($in['type'] ?? 'lead');

// ── Abuse controls ───────────────────────────────────────────────────────────
// No CSRF token here (a public form has no session), so the protections are:
// a honeypot field, a minimum fill time, and a per-IP rate limit.

if (!empty($in['website'])) {           // honeypot — real users never fill this
    a_respond(['ok' => true]);          // look successful to the bot
}

// A human takes more than a couple of seconds to fill a contact form. The client
// sends the timestamp it rendered the form at.
$renderedAt = (int) ($in['t'] ?? 0);
if ($renderedAt > 0 && (time() * 1000 - $renderedAt) < 2500) {
    a_respond(['ok' => true]);
}

$ip = a_ip();

// Rate limit: at most 5 enquiries from one address in 10 minutes. Records come
// back newest first, so this stops as soon as it walks past the window instead
// of reading the whole file.
$cutoff = time() - 600;
$recent = 0;
foreach (store_all('leads.jsonl') as $r) {
    if (strtotime($r['created_at'] ?? '') < $cutoff) break;
    if (($r['ip'] ?? '') === $ip && ++$recent >= 5) {
        a_fail('Too many submissions from this connection. Please try again shortly.', 429, 'rate_limited');
    }
}

$email = strtolower(trim((string) ($in['email'] ?? '')));
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) a_fail('Please enter a valid email address.');

// ── Newsletter ───────────────────────────────────────────────────────────────
if ($type === 'newsletter') {
    if ($email === '') a_fail('An email address is required.');

    $source = a_clean_line($in['source'] ?? 'site', 60);

    // One row per address. Re-subscribing an unsubscribed address is a
    // deliberate opt-in, so it flips the existing record back rather than
    // adding a duplicate. Done inside the lock so two simultaneous sign-ups
    // with the same address cannot both append.
    store_rewrite('newsletter.jsonl', function ($rows) use ($email, $source) {
        foreach ($rows as $i => $r) {
            if (strtolower($r['email'] ?? '') === $email) {
                $rows[$i]['status'] = 'subscribed';
                return $rows;
            }
        }
        array_unshift($rows, [
            'id'         => store_id(),
            'email'      => $email,
            'source'     => $source,
            'status'     => 'subscribed',
            'created_at' => gmdate('c'),
        ]);
        return $rows;
    });

    a_respond(['ok' => true]);
}

// ── Job application ──────────────────────────────────────────────────────────
if ($type === 'application') {
    store_append('applications.jsonl', [
        'role'      => a_clean_line($in['role'] ?? '', 190),
        'name'      => a_clean_line($in['name'] ?? '', 190),
        'email'     => $email,
        'phone'     => a_clean_line($in['phone'] ?? '', 60),
        'portfolio' => a_clean_line($in['portfolio'] ?? '', 255),
        'message'   => mb_substr((string) ($in['message'] ?? ''), 0, 5000),
        'status'    => 'new',
        'ip'        => $ip,
    ]);
    a_respond(['ok' => true]);
}

// ── Contact / quote lead ─────────────────────────────────────────────────────
$name = a_clean_line($in['name'] ?? '', 190);
$message = mb_substr((string) ($in['message'] ?? ''), 0, 5000);
if ($email === '' && $name === '') a_fail('Please tell us how to reach you.');

store_append('leads.jsonl', [
    'source'  => a_clean_line($in['source'] ?? 'contact', 60),
    'name'    => $name,
    'email'   => $email,
    'phone'   => a_clean_line($in['phone'] ?? '', 60),
    'company' => a_clean_line($in['company'] ?? '', 190),
    'message' => $message,
    'page'    => a_clean_line($in['page'] ?? '', 255),
    'meta'    => $in['meta'] ?? null,
    'status'  => 'new',
    'ip'      => $ip,
]);

// Best-effort notification; a mail failure must not fail the submission.
@mail(
    ADMIN_NOTIFY_EMAIL,
    'New lead: ' . ($name !== '' ? $name : $email),
    implode("\n", [
        'A new enquiry came in through the website.',
        '',
        'Name:    ' . ($name ?: '-'),
        'Email:   ' . ($email ?: '-'),
        'Phone:   ' . (a_clean_line($in['phone'] ?? '', 60) ?: '-'),
        'Page:    ' . (a_clean_line($in['page'] ?? '', 255) ?: '-'),
        '',
        $message,
        '',
        'See it in the panel: https://www.noveliotech.com/admin/leads',
    ]),
    'From: no-reply@noveliotech.com' . "\r\n" . 'Content-Type: text/plain; charset=UTF-8'
);

a_respond(['ok' => true]);
