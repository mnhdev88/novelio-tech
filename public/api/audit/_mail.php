<?php
// ─────────────────────────────────────────────────────────────────────────────
// Free SEO Audit — the report email sent to the visitor.
//
// WHAT GOES IN IT, AND WHAT DELIBERATELY DOES NOT
//
// The summary: their score, the five category scores, how many problems were
// found, and the names of the worst ones. Not the fix for any of them. That is
// the whole design — the email proves we looked and found real things, and the
// conversation is where the fixes live. An email containing every fix gives the
// recipient no reason to reply.
//
// DELIVERABILITY
//
// This is the first mail this site sends to an address it does not own, which
// is a different problem from the internal notifications. Four things here are
// what keep it out of spam, and none of them are decoration:
//   * From is a real mailbox on this domain, so SPF passes;
//   * the envelope sender is set (-f) so the bounce path matches;
//   * multipart/alternative with a genuine plaintext part, because HTML-only
//     mail scores badly everywhere;
//   * a Message-ID and Date, whose absence is itself a spam signal.
//
// If deliverability still proves poor, the fix is authenticated SMTP rather
// than more headers — see SEO-AUDIT-SETUP.md.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_lib.php';

/**
 * Send the summary to the visitor. Returns true only if the mail server
 * accepted it — the caller has to tell the visitor when it did not, because
 * this email is now the entire thing they were promised.
 */
function au_send_report(array $report, $to, $name = '') {
    $host  = $report['host'] ?? 'your website';
    $score = (int) ($report['overall'] ?? 0);

    $problems = au_rank_problems($report['issues']);
    $fails = array_values(array_filter($problems, function ($i) { return $i['state'] === 'fail'; }));
    $warns = array_values(array_filter($problems, function ($i) { return $i['state'] === 'warn'; }));
    $top   = array_slice($problems, 0, 5);
    $passed = count(array_filter($report['issues'], function ($i) { return $i['state'] === 'pass'; }));

    $subject = sprintf('Your SEO audit: %s scored %d/100', $host, $score);

    $boundary = 'nvl-' . bin2hex(random_bytes(12));

    $headers = implode("\r\n", [
        'From: ' . au_mail_encode_name(AUDIT_FROM_NAME) . ' <' . AUDIT_FROM_EMAIL . '>',
        'Reply-To: ' . AUDIT_REPLY_TO,
        'Date: ' . date('r'),
        'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . au_mail_domain() . '>',
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
        // Marks it as a transactional reply to something they asked for, which
        // is what it is — they typed the address and pressed the button.
        'Auto-Submitted: auto-generated',
        'X-Mailer: NovelioAudit',
    ]);

    $text = au_report_text($report, $name, $host, $score, $fails, $warns, $top, $passed);
    $html = au_report_html($report, $name, $host, $score, $fails, $warns, $top, $passed);

    $body = "--$boundary\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . $text . "\r\n\r\n"
        . "--$boundary\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . $html . "\r\n\r\n"
        . "--$boundary--\r\n";

    // The 5th argument sets the envelope sender. Without it the bounce address
    // is the web server's system user, which does not match the From domain and
    // is one of the commonest reasons shared-host mail lands in spam.
    $ok = @mail($to, au_mail_encode_subject($subject), $body, $headers, '-f' . AUDIT_FROM_EMAIL);

    if (!$ok) @error_log('[audit] could not send report email to ' . $to);
    return (bool) $ok;
}

/** Domain for the Message-ID, taken from the sender so the two agree. */
function au_mail_domain() {
    $at = strrchr(AUDIT_FROM_EMAIL, '@');
    return $at ? substr($at, 1) : 'noveliotech.com';
}

/** RFC 2047 encoding, needed the moment a subject or name is not plain ASCII. */
function au_mail_encode_subject($s) {
    return preg_match('/[\x80-\xFF]/', $s) ? '=?UTF-8?B?' . base64_encode($s) . '?=' : $s;
}

function au_mail_encode_name($s) {
    if (preg_match('/[\x80-\xFF]/', $s)) return '=?UTF-8?B?' . base64_encode($s) . '?=';
    return '"' . str_replace('"', '', $s) . '"';
}

/** A verdict in words, so the number is not the only thing carrying meaning. */
function au_score_verdict($score) {
    if ($score >= 90) return 'which is genuinely strong — very few sites we audit score this well';
    if ($score >= 75) return 'which is a solid foundation with some clear gaps';
    if ($score >= 55) return 'which means there are fixable problems costing you traffic right now';
    if ($score >= 35) return 'which means significant issues are holding the site back';
    return 'which means there are major problems across almost every area';
}

// ── Plain text ───────────────────────────────────────────────────────────────

function au_report_text(array $report, $name, $host, $score, $fails, $warns, $top, $passed) {
    $L = [];
    $L[] = $name !== '' ? "Hi $name," : 'Hi,';
    $L[] = '';
    $L[] = "Here is the summary of the SEO audit you ran on $host.";
    $L[] = '';
    $L[] = "OVERALL SCORE: $score/100 — " . au_score_verdict($score);
    $L[] = '';

    if (!empty($report['categories'])) {
        $L[] = 'How it breaks down:';
        foreach ($report['categories'] as $c) {
            $L[] = sprintf('  %-12s %d/100', $c['label'], $c['score']);
        }
        $L[] = '';
    }

    $L[] = sprintf(
        'We ran about %d checks. %d failed outright, %d came back as warnings, and %d passed.',
        count($report['issues']), count($fails), count($warns), $passed
    );
    $L[] = '';

    if ($top) {
        $L[] = 'The biggest problems we found:';
        foreach ($top as $i) {
            $L[] = '  ' . ($i['state'] === 'fail' ? '[critical] ' : '[warning]  ') . $i['title'];
        }
        $L[] = '';
    } else {
        $L[] = 'Nothing is broken on this page, which is uncommon.';
        $L[] = '';
    }

    $L[] = 'WHAT EACH ONE IS COSTING YOU';
    $L[] = 'The full report explains what every item above is doing to your traffic';
    $L[] = 'and exactly how to fix it. We would rather walk you through it than send';
    $L[] = 'you thirty pages — it takes about half an hour and there is no charge.';
    $L[] = '';
    $L[] = 'Book a time: ' . AUDIT_CTA_URL;
    $L[] = 'Or just reply to this email and we will answer your questions here.';
    $L[] = '';
    $L[] = '—';
    $L[] = AUDIT_FROM_NAME;
    $L[] = AUDIT_COMPANY_PHONE;
    $L[] = AUDIT_SITE_URL;
    $L[] = '';
    $L[] = 'You received this because you ran a free audit on ' . AUDIT_SITE_URL . '/free-seo-audit';

    return implode("\r\n", $L);
}

// ── HTML ─────────────────────────────────────────────────────────────────────
// Tables and inline styles, because that is what email clients actually render.
// No external CSS, no web fonts, no background images.

function au_report_html(array $report, $name, $host, $score, $fails, $warns, $top, $passed) {
    $e = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };

    $colour = $score >= 75 ? '#16A34A' : ($score >= 55 ? '#F59E0B' : '#DC2626');
    $greeting = $name !== '' ? 'Hi ' . $e($name) . ',' : 'Hi,';

    $cats = '';
    foreach (($report['categories'] ?? []) as $c) {
        $cc = $c['score'] >= 75 ? '#16A34A' : ($c['score'] >= 55 ? '#F59E0B' : '#DC2626');
        $cats .= '<tr>'
            . '<td style="padding:6px 0;font-size:14px;color:#475569;">' . $e($c['label']) . '</td>'
            . '<td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:' . $cc . ';">'
            . (int) $c['score'] . '/100</td>'
            . '</tr>';
    }

    $items = '';
    foreach ($top as $i) {
        $isFail = $i['state'] === 'fail';
        $items .= '<tr><td style="padding:7px 0;font-size:14px;color:#334155;">'
            . '<span style="display:inline-block;font-size:11px;font-weight:700;padding:2px 7px;border-radius:10px;'
            . ($isFail ? 'background:#FEE2E2;color:#B91C1C;' : 'background:#FEF3C7;color:#B45309;')
            . '">' . ($isFail ? 'CRITICAL' : 'WARNING') . '</span>&nbsp;&nbsp;'
            . $e($i['title'])
            . '</td></tr>';
    }

    $summaryLine = sprintf(
        'We ran about %d checks. <strong>%d failed outright</strong>, %d came back as warnings, and %d passed.',
        count($report['issues']), count($fails), count($warns), $passed
    );

    return '<!doctype html><html><body style="margin:0;padding:0;background:#f1f5f9;">'
    . '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">'
    . '<tr><td align="center">'
    . '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;padding:32px;font-family:Helvetica,Arial,sans-serif;">'

    . '<tr><td style="font-size:15px;color:#334155;padding-bottom:14px;">' . $greeting . '</td></tr>'
    . '<tr><td style="font-size:15px;color:#334155;line-height:1.6;padding-bottom:22px;">'
    . 'Here is the summary of the SEO audit you ran on <strong>' . $e($host) . '</strong>.'
    . '</td></tr>'

    // Score
    . '<tr><td align="center" style="padding:20px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">'
    . '<div style="font-size:46px;font-weight:700;color:' . $colour . ';line-height:1;">' . (int) $score . '<span style="font-size:20px;color:#94a3b8;">/100</span></div>'
    . '<div style="font-size:13px;color:#64748b;padding-top:8px;">' . $e(ucfirst(au_score_verdict($score))) . '</div>'
    . '</td></tr>'

    // Categories
    . ($cats ? '<tr><td style="padding:20px 0 6px;font-size:12px;font-weight:700;color:#94a3b8;letter-spacing:.06em;">HOW IT BREAKS DOWN</td></tr>'
        . '<tr><td><table width="100%" cellpadding="0" cellspacing="0">' . $cats . '</table></td></tr>' : '')

    . '<tr><td style="padding:20px 0;font-size:14px;color:#475569;line-height:1.6;">' . $summaryLine . '</td></tr>'

    // Problems
    . ($items
        ? '<tr><td style="padding:8px 0 4px;font-size:12px;font-weight:700;color:#94a3b8;letter-spacing:.06em;">THE BIGGEST PROBLEMS</td></tr>'
          . '<tr><td><table width="100%" cellpadding="0" cellspacing="0">' . $items . '</table></td></tr>'
        : '<tr><td style="font-size:14px;color:#475569;">Nothing is broken on this page, which is uncommon.</td></tr>')

    // CTA
    . '<tr><td style="padding:26px 0 0;">'
    . '<div style="background:#f8fafc;border-radius:12px;padding:22px;">'
    . '<div style="font-size:16px;font-weight:700;color:#1B3172;padding-bottom:8px;">What each one is costing you</div>'
    . '<div style="font-size:14px;color:#475569;line-height:1.6;padding-bottom:18px;">'
    . 'The full report explains what every item above is doing to your traffic and exactly how to fix it. '
    . 'We would rather walk you through it than send you thirty pages — it takes about half an hour and there is no charge.'
    . '</div>'
    . '<a href="' . $e(AUDIT_CTA_URL) . '" style="display:inline-block;background:#6B3FA0;color:#ffffff;text-decoration:none;'
    . 'font-size:15px;font-weight:700;padding:13px 26px;border-radius:40px;">Book a free 30-minute call</a>'
    . '<div style="font-size:13px;color:#64748b;padding-top:14px;">Or just reply to this email and we will answer your questions here.</div>'
    . '</div></td></tr>'

    . '<tr><td style="padding-top:26px;border-top:1px solid #e2e8f0;margin-top:20px;font-size:12px;color:#94a3b8;line-height:1.7;">'
    . '<strong style="color:#64748b;">' . $e(AUDIT_FROM_NAME) . '</strong><br>'
    . $e(AUDIT_COMPANY_PHONE) . ' &nbsp;·&nbsp; <a href="' . $e(AUDIT_SITE_URL) . '" style="color:#6B3FA0;text-decoration:none;">' . $e(preg_replace('#^https?://#', '', AUDIT_SITE_URL)) . '</a><br><br>'
    . 'You received this because you ran a free audit on our website.'
    . '</td></tr>'

    . '</table></td></tr></table></body></html>';
}
