<?php
// ─────────────────────────────────────────────────────────────────────────────
// Free SEO Audit — run the audit.
//
//   POST { url, t, website }  ->  { token, overall, categories, free, locked, ... }
//
// WHAT THIS ENDPOINT DELIBERATELY DOES NOT RETURN
//
// The full report. The score, the category breakdown and the three worst
// findings come back in full; everything else comes back as a bare title. The
// fix instructions stay on the server, keyed by the token, until unlock.php has
// an email address. Sending the whole report and hiding half of it with CSS
// would put the entire lead magnet one devtools panel away from being free.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_checks.php';

au_method('POST');

$in = au_body();

// Honeypot only, with no minimum fill time: this is one field, and someone who
// arrives with the address already in their clipboard can paste and submit in
// well under a second. Rejecting them would be indistinguishable, from their
// side, from the tool being broken. The per-IP rate limit below is what bounds
// abuse of this endpoint; the timing test still guards the gate in unlock.php,
// where the visitor has demonstrably been on the page for a while.
if (!au_check_bot_signals($in, 0)) {
    au_fail('We could not audit that address just now. Please try again.', 400, 'rejected');
}

$url = au_normalize_url($in['url'] ?? '');
au_rate_limit();
au_cache_sweep();

// A repeat of the same URL inside the TTL is answered from cache: it keeps a
// visitor who refreshes from re-crawling someone's site, and it is what stops
// the PageSpeed quota being spent twice on one lead.
$urlKey = 'u' . sha1($url);
$result = au_cache_get($urlKey, AUDIT_CACHE_TTL);

if ($result === null) {
    $result = au_build_report($url);
    au_cache_put($urlKey, $result);
}

// Each visitor gets their own token even when the report came from cache, so a
// token is never shared between two people's unlock attempts.
$token = au_token();
$result['token'] = $token;
$result['url_key'] = $urlKey;
au_cache_put('t' . $token, $result);

au_respond(au_public_view($result));

// ── Building the report ──────────────────────────────────────────────────────

function au_build_report($url) {
    $page = au_fetch($url);

    if (!$page['ok'] || $page['status'] >= 400) {
        au_fail(au_fetch_message($page, $url), 502, 'unreachable');
    }

    $finalUrl = $page['final_url'] ?? $url;
    $parts = @parse_url($finalUrl);
    $host = strtolower($parts['host'] ?? '');
    $origin = ($parts['scheme'] ?? 'https') . '://' . $host;

    $ctx = [
        'host'   => $host,
        'origin' => $origin,
        'robots_ok' => false,
        'sitemap_ok' => false,
        'sitemap_url' => '',
        'http_redirects' => null,
    ];

    // robots.txt, and the sitemap it points at.
    $robots = au_fetch($origin . '/robots.txt');
    $sitemapCandidates = [];
    if ($robots['ok'] && $robots['status'] === 200 && stripos((string) ($robots['headers']['content-type'] ?? 'text/plain'), 'html') === false) {
        $ctx['robots_ok'] = true;
        if (preg_match_all('/^\s*sitemap\s*:\s*(\S+)/im', $robots['body'], $m)) {
            foreach ($m[1] as $s) $sitemapCandidates[] = trim($s);
        }
    }
    $sitemapCandidates[] = $origin . '/sitemap.xml';
    $sitemapCandidates[] = $origin . '/sitemap_index.xml';

    foreach (array_slice(array_unique($sitemapCandidates), 0, 3) as $candidate) {
        // A candidate from robots.txt is attacker-influenced input in the same
        // way the original URL is, so it goes through the same normaliser —
        // which will simply skip anything pointing off the public internet.
        $safe = au_safe_url($candidate);
        if ($safe === null) continue;

        $res = au_fetch($safe, 'HEAD');
        // Plenty of servers refuse HEAD; a 405 means the file is probably there,
        // so fall back to a GET rather than reporting a missing sitemap.
        if ($res['ok'] && ($res['status'] === 405 || $res['status'] === 501)) $res = au_fetch($safe);

        if ($res['ok'] && $res['status'] === 200) {
            $ctx['sitemap_ok'] = true;
            $ctx['sitemap_url'] = $safe;
            break;
        }
    }

    // Does the insecure version redirect? Only worth asking if we ended on HTTPS.
    if (strpos($finalUrl, 'https://') === 0) {
        $plain = au_fetch('http://' . $host . '/', 'HEAD');
        if ($plain['ok']) {
            $landed = $plain['final_url'] ?? '';
            $ctx['http_redirects'] = strpos($landed, 'https://') === 0;
        }
    }

    $issues = au_run_checks($page, $ctx);
    $scores = au_score($issues);

    return [
        'url'        => $url,
        'final_url'  => $finalUrl,
        'host'       => $host,
        'origin'     => $origin,
        'fetched_at' => gmdate('c'),
        'overall'    => $scores['overall'],
        'categories' => $scores['categories'],
        'issues'     => $issues,
        'redirects'  => $page['redirects'] ?? [],
        'speed'      => null,          // filled in by speed.php
        'speed_state' => AUDIT_HAS_PSI ? 'pending' : 'unavailable',
    ];
}

/**
 * Re-validate a URL discovered on the audited site (a Sitemap: line), returning
 * null instead of failing the request — a bad sitemap URL is that site's
 * problem, not a reason to abandon the whole audit.
 */
function au_safe_url($candidate) {
    $parts = @parse_url(trim($candidate));
    if (!is_array($parts) || empty($parts['host'])) return null;

    $scheme = strtolower($parts['scheme'] ?? '');
    if ($scheme !== 'http' && $scheme !== 'https') return null;
    if (isset($parts['user']) || isset($parts['pass'])) return null;

    $port = isset($parts['port']) ? (int) $parts['port'] : null;
    if ($port !== null && $port !== 80 && $port !== 443) return null;

    $host = strtolower($parts['host']);
    // au_guard_host() fails the request outright on a private address. Here that
    // would let any site kill an audit by listing "Sitemap: http://127.0.0.1/" —
    // so the check is repeated inline and simply rejects the candidate.
    if (preg_match('/(^|\.)(localhost|local|internal|intranet|lan|home|test|invalid)$/i', $host)) return null;
    if (filter_var($host, FILTER_VALIDATE_IP)
        && !filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
        return null;
    }
    if (!filter_var($host, FILTER_VALIDATE_IP)) {
        $ip = @gethostbyname($host);
        if ($ip && $ip !== $host
            && !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return null;
        }
    }

    return $scheme . '://' . $host . ($port ? ':' . $port : '') . ($parts['path'] ?? '/');
}

/** Say what actually went wrong, in words the visitor can act on. */
function au_fetch_message(array $page, $url) {
    $host = (string) @parse_url($url, PHP_URL_HOST);

    switch ($page['error'] ?? '') {
        case 'timeout':
            return "$host took too long to respond, so we could not audit it. That is itself worth knowing — if it is that slow for us, it is that slow for Google. Try again in a moment.";
        case 'ssl':
            return "$host has a broken or expired SSL certificate, so we could not connect securely. Visitors are seeing a full-page browser warning before they reach the site — fixing that comes before any SEO work.";
        case 'no_ca':
            // Our fault, and it must read that way. The alternative is telling a
            // stranger their certificate is broken when it is not.
            return 'The audit server cannot currently verify SSL certificates, so we could not check that site. This is a problem at our end, not with your website — please try again shortly.';
        case 'no_curl':
            return 'The audit tool is not fully set up on this server yet.';
        case 'too_many_redirects':
            return "$host redirects in a loop that never resolves. Search engines give up on it the same way we just did.";
    }

    $status = (int) ($page['status'] ?? 0);
    if ($status === 403) return "$host refused our request (403). The site is likely behind a firewall or bot filter that also blocks some search engine crawlers.";
    if ($status === 404) return "That page returned 404 — it does not exist. Check the address, or audit the homepage instead.";
    if ($status >= 500)  return "$host returned a server error ($status). The site is having trouble right now; try again shortly.";

    return "We could not reach $host. Check the address and try again.";
}

// ── The public half of the report ────────────────────────────────────────────

/**
 * Split the report into what anyone may see and what an email address buys.
 *
 * Free: the score, the category breakdown, every passing check by name, and the
 * three worst findings complete with why they matter and how to fix them.
 * Locked: every other finding, reduced to its title and severity.
 */
function au_public_view(array $r) {
    $problems = au_rank_problems($r['issues']);
    $free = array_slice($problems, 0, 3);
    $rest = array_slice($problems, 3);

    $passed = [];
    foreach ($r['issues'] as $i) {
        if ($i['state'] === 'pass') $passed[] = ['id' => $i['id'], 'cat' => $i['cat'], 'title' => $i['title']];
    }

    return [
        'ok'          => true,
        'token'       => $r['token'],
        'url'         => $r['url'],
        'final_url'   => $r['final_url'],
        'host'        => $r['host'],
        'fetched_at'  => $r['fetched_at'],
        'overall'     => $r['overall'],
        'categories'  => $r['categories'],
        'free'        => array_map('au_full_issue', $free),
        'locked'      => array_map(function ($i) {
            // Title and severity only. The "why" and the "how" are the product.
            return ['id' => $i['id'], 'cat' => $i['cat'], 'state' => $i['state'], 'title' => $i['title']];
        }, $rest),
        'locked_count' => count($rest),
        'passed'       => $passed,
        'fail_count'   => count(array_filter($problems, function ($i) { return $i['state'] === 'fail'; })),
        'warn_count'   => count(array_filter($problems, function ($i) { return $i['state'] === 'warn'; })),
        'speed_state'  => $r['speed_state'],
        'speed'        => $r['speed'],
    ];
}

function au_full_issue(array $i) {
    return [
        'id' => $i['id'], 'cat' => $i['cat'], 'state' => $i['state'],
        'title' => $i['title'], 'impact' => $i['impact'],
        'detail' => $i['detail'], 'evidence' => $i['evidence'],
    ];
}
