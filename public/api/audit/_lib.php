<?php
// ─────────────────────────────────────────────────────────────────────────────
// Free SEO Audit — shared helpers: JSON I/O, URL safety, fetching, caching.
//
// THE SECURITY PROBLEM THIS FILE EXISTS TO SOLVE
//
// Every other endpoint on this site decides for itself what to talk to. This one
// takes a URL from an anonymous visitor and fetches it. That is a server-side
// request forgery engine unless it is fenced in: without the checks below,
// anyone could point it at http://127.0.0.1:3306, or at a cloud metadata
// endpoint, and read the response back out of the audit report.
//
// The fence has three parts, and all three are needed:
//   1. scheme + shape — only http/https, no credentials, no odd ports;
//   2. address — every IP the hostname resolves to must be publicly routable;
//   3. redirects are followed BY HAND, re-running (2) on each hop, because a
//      public URL is free to redirect to 169.254.169.254 and cURL would follow.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_config.php';

// ── JSON I/O ─────────────────────────────────────────────────────────────────
// Named au_* rather than a_*: unlock.php also loads the admin panel's _lib.php
// to record the lead, and two a_respond() definitions would be a fatal error.

function au_respond($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode($data);
    exit;
}

function au_fail($message, $status = 400, $code = null) {
    au_respond(array_filter(['error' => $message, 'code' => $code]), $status);
}

function au_method($allowed) {
    $m = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($m, (array) $allowed, true)) au_fail('Method not allowed', 405);
    return $m;
}

function au_body() {
    $data = json_decode((string) file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function au_ip() {
    return substr($_SERVER['REMOTE_ADDR'] ?? '', 0, 45);
}

function au_clean($s, $max = 200) {
    $s = is_string($s) ? $s : '';
    $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s);
    $s = trim(preg_replace('/\s+/u', ' ', $s));
    return mb_substr($s, 0, $max);
}

// ── Abuse controls shared by the public endpoints ────────────────────────────

/**
 * The honeypot + minimum-fill-time pair used by capture.php. A bot that fills
 * every field, or a script that posts the instant the page loads, is answered
 * with a plausible-looking success rather than an error, so it learns nothing.
 *
 * $minFillMs is how long after the page rendered a submission is still treated
 * as too fast to be human. Pass 0 to skip that test — it is the right guard for
 * a form someone fills in, and the wrong one for a single field they may well
 * paste into and submit in under a second.
 */
function au_check_bot_signals(array $in, $minFillMs = 1200) {
    if (!empty($in['website'])) return false;              // honeypot

    if ($minFillMs > 0) {
        $renderedAt = (int) ($in['t'] ?? 0);
        if ($renderedAt > 0 && (time() * 1000 - $renderedAt) < $minFillMs) return false;
    }

    return true;
}

/**
 * Per-IP hourly cap. Audits are expensive (several outbound fetches plus a
 * PageSpeed call), so this protects both this server and the PSI quota.
 * State is one small JSON file — at this volume a database would be overkill.
 */
function au_rate_limit() {
    $ip = au_ip();
    if ($ip === '') return;

    $path = au_cache_dir() . '/rate.json';
    $lock = @fopen($path . '.lock', 'c');
    if ($lock === false) return;   // can't track it — don't block a real visitor

    try {
        if (!flock($lock, LOCK_EX)) return;

        $cutoff = time() - 3600;
        $raw = is_file($path) ? @file_get_contents($path) : '';
        $hits = json_decode((string) $raw, true);
        if (!is_array($hits)) $hits = [];

        // Hashed, not stored raw: this file exists only to count, and a list of
        // visitor IP addresses sitting on disk is personal data nobody needs.
        $key = substr(hash('sha256', $ip), 0, 16);

        $mine = array_values(array_filter($hits[$key] ?? [], function ($t) use ($cutoff) {
            return $t > $cutoff;
        }));

        if (count($mine) >= AUDIT_RATE_PER_HOUR) {
            au_fail('That is a lot of audits from one connection. Please try again in an hour, or contact us and we will run it for you.', 429, 'rate_limited');
        }

        $mine[] = time();
        $hits[$key] = $mine;

        // Drop everyone whose window has fully expired, so the file cannot grow
        // without bound.
        foreach ($hits as $k => $times) {
            $kept = array_values(array_filter($times, function ($t) use ($cutoff) { return $t > $cutoff; }));
            if ($kept) $hits[$k] = $kept; else unset($hits[$k]);
        }

        @file_put_contents($path, json_encode($hits));
        @chmod($path, 0600);
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

// ── URL safety ───────────────────────────────────────────────────────────────

/**
 * Turn whatever the visitor typed into a URL we are willing to fetch, or fail.
 * Accepts "example.com", "www.example.com/page", "https://example.com".
 */
function au_normalize_url($raw) {
    $raw = trim((string) $raw);
    if ($raw === '') au_fail('Enter the address of the website you want audited.');
    if (mb_strlen($raw) > 2000) au_fail('That address is too long to be a real page.');

    // No scheme typed is the common case, and by far the most likely intent.
    if (!preg_match('#^[a-z][a-z0-9+.-]*://#i', $raw)) $raw = 'https://' . $raw;

    $parts = @parse_url($raw);
    if (!is_array($parts) || empty($parts['host'])) {
        au_fail('That does not look like a website address. Try something like example.com');
    }

    $scheme = strtolower($parts['scheme'] ?? '');
    if ($scheme !== 'http' && $scheme !== 'https') {
        au_fail('Only http:// and https:// addresses can be audited.');
    }

    // user:pass@host is never what a visitor means to audit, and it is a classic
    // way of smuggling one host past a parser that only reads the start.
    if (isset($parts['user']) || isset($parts['pass'])) {
        au_fail('Remove the username and password from the address before auditing it.');
    }

    // Only the standard web ports. Everything else on a host is a service that a
    // public SEO tool has no business connecting to.
    $port = isset($parts['port']) ? (int) $parts['port'] : null;
    if ($port !== null && $port !== 80 && $port !== 443) {
        au_fail('Only websites on the standard web ports (80 and 443) can be audited.');
    }

    $host = strtolower($parts['host']);
    au_guard_host($host);

    $url = $scheme . '://' . $host
        . ($port ? ':' . $port : '')
        . ($parts['path'] ?? '/')
        . (isset($parts['query']) ? '?' . $parts['query'] : '');

    return $url;
}

/** Fail unless every address this hostname resolves to is on the public internet. */
function au_guard_host($host) {
    $host = trim($host, '.');
    if ($host === '') au_fail('That does not look like a website address.');

    // Names that never point anywhere public, whatever DNS says today.
    if (preg_match('/(^|\.)(localhost|local|internal|intranet|lan|home|test|example|invalid)$/i', $host)) {
        au_fail('That address is not reachable from the public internet, so there is nothing to audit.');
    }

    $ips = [];
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        $ips[] = $host;
    } else {
        // A hostname must look like a hostname, and must have a dot in it.
        if (!preg_match('/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i', $host)
            || strpos($host, '.') === false) {
            au_fail('That does not look like a website address. Try something like example.com');
        }

        foreach ((array) @dns_get_record($host, DNS_A) as $r) {
            if (!empty($r['ip'])) $ips[] = $r['ip'];
        }
        foreach ((array) @dns_get_record($host, DNS_AAAA) as $r) {
            if (!empty($r['ipv6'])) $ips[] = $r['ipv6'];
        }
        // Some shared hosts disable dns_get_record; fall back to the resolver.
        if (!$ips) {
            $v4 = @gethostbyname($host);
            if ($v4 && $v4 !== $host) $ips[] = $v4;
        }

        if (!$ips) {
            au_fail('We could not find that domain. Check the spelling and try again.', 400, 'dns');
        }
    }

    // FILTER_FLAG_NO_PRIV_RANGE covers 10/8, 172.16/12, 192.168/16 and fc00::/7.
    // FILTER_FLAG_NO_RES_RANGE covers loopback, link-local (including the
    // 169.254.169.254 cloud metadata address), 0.0.0.0/8 and the reserved
    // blocks. Anything either flag rejects is off limits.
    foreach ($ips as $ip) {
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            au_fail('That address points to a private network, so it cannot be audited from here.', 400, 'private_host');
        }
    }
}

// ── Fetching ─────────────────────────────────────────────────────────────────

/**
 * Fetch a URL, following redirects by hand so each hop is re-validated.
 *
 * Returns ['ok','status','headers','body','final_url','redirects','error'].
 * Never throws and never fails the request: a site that is down is a finding to
 * report, not an error page to show.
 */
function au_fetch($url, $method = 'GET') {
    $redirects = [];
    $current = $url;

    for ($hop = 0; $hop <= AUDIT_MAX_REDIRECTS; $hop++) {
        $res = au_fetch_once($current, $method);
        if (!$res['ok']) return $res + ['redirects' => $redirects, 'final_url' => $current];

        $location = $res['headers']['location'] ?? null;
        if ($res['status'] >= 300 && $res['status'] < 400 && $location) {
            $next = au_resolve_url($current, $location);
            if ($next === null) break;

            $redirects[] = ['from' => $current, 'to' => $next, 'status' => $res['status']];

            // The whole reason redirects are followed by hand: this hop gets the
            // same address check the original URL did.
            $parts = @parse_url($next);
            if (!is_array($parts) || empty($parts['host'])) break;
            $scheme = strtolower($parts['scheme'] ?? '');
            if ($scheme !== 'http' && $scheme !== 'https') break;
            $port = isset($parts['port']) ? (int) $parts['port'] : null;
            if ($port !== null && $port !== 80 && $port !== 443) break;
            au_guard_host(strtolower($parts['host']));

            $current = $next;
            continue;
        }

        return $res + ['redirects' => $redirects, 'final_url' => $current];
    }

    return [
        'ok' => false, 'status' => 0, 'headers' => [], 'body' => '',
        'error' => 'too_many_redirects', 'redirects' => $redirects, 'final_url' => $current,
    ];
}

/** One request, no redirect following. */
function au_fetch_once($url, $method = 'GET') {
    $out = ['ok' => false, 'status' => 0, 'headers' => [], 'body' => '', 'error' => null, 'ms' => 0];

    if (!function_exists('curl_init')) {
        $out['error'] = 'no_curl';
        return $out;
    }

    $headers = [];
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,   // see au_fetch() — hops are checked by hand
        CURLOPT_TIMEOUT        => AUDIT_FETCH_TIMEOUT,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_USERAGENT      => AUDIT_USER_AGENT,
        CURLOPT_ENCODING       => '',      // accept gzip, decode transparently
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_NOBODY         => $method === 'HEAD',
        CURLOPT_HTTPHEADER     => ['Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'],
        CURLOPT_HEADERFUNCTION => function ($ch, $line) use (&$headers) {
            $i = strpos($line, ':');
            if ($i !== false) {
                $headers[strtolower(trim(substr($line, 0, $i)))] = trim(substr($line, $i + 1));
            }
            return strlen($line);
        },
        // Stop reading a response that is clearly not a web page, rather than
        // pulling all of it into memory first.
        CURLOPT_BUFFERSIZE       => 65536,
        CURLOPT_NOPROGRESS       => false,
        CURLOPT_PROGRESSFUNCTION => function ($ch, $dlTotal, $dlNow) {
            return ($dlNow > AUDIT_MAX_BODY_BYTES || $dlTotal > AUDIT_MAX_BODY_BYTES) ? 1 : 0;
        },
    ]);
    if (defined('CURLOPT_PROTOCOLS') && defined('CURLPROTO_HTTP') && defined('CURLPROTO_HTTPS')) {
        @curl_setopt($ch, CURLOPT_PROTOCOLS, CURLPROTO_HTTP | CURLPROTO_HTTPS);
    }

    $started = microtime(true);
    $body = curl_exec($ch);
    $out['ms']     = (int) round((microtime(true) - $started) * 1000);
    $out['status'] = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $errno = curl_errno($ch);
    curl_close($ch);

    // A body aborted by the size guard still has usable headers and a status,
    // and the first 3 MB is far more HTML than any check needs.
    if ($body === false && $errno !== CURLE_ABORTED_BY_CALLBACK) {
        if ($errno === CURLE_OPERATION_TIMEDOUT) {
            $out['error'] = 'timeout';
        } elseif ($errno === CURLE_SSL_CACERT || $errno === CURLE_SSL_PEER_CERTIFICATE) {
            // Do NOT accept this at face value. A PHP install with no CA bundle
            // fails exactly this way on every HTTPS request, and reporting that
            // as "your certificate is broken" tells a prospect their site is
            // broken when ours is. Ask a site we know is fine before accusing
            // anyone: if that fails too, the fault is at this end.
            $out['error'] = au_ca_bundle_broken() ? 'no_ca' : 'ssl';
        } else {
            $out['error'] = 'unreachable';
        }
        return $out;
    }

    $out['ok']      = $out['status'] > 0;
    $out['headers'] = $headers;
    $out['body']    = is_string($body) ? substr($body, 0, AUDIT_MAX_BODY_BYTES) : '';
    return $out;
}

/**
 * Is it THIS server that cannot verify certificates, rather than the audited
 * site that has a bad one?
 *
 * Asked only after an SSL failure, and answered by connecting to a host whose
 * certificate is beyond doubt. If that fails the same way, no CA bundle is
 * configured here and every HTTPS site on the internet would "fail" this audit.
 *
 * Cached for the request: one control connection per audit, not one per fetch.
 */
function au_ca_bundle_broken() {
    static $broken = null;
    if ($broken !== null) return $broken;

    // Two controls, from different issuers. One host can fail for its own
    // reasons — a blocked route, a root this machine has not fetched yet — and
    // treating that as proof would mean excusing a genuinely broken certificate
    // on the audited site as "our problem". Only a verification failure against
    // BOTH says the fault is here.
    $sslFailures = 0;
    $tried = 0;

    foreach (['https://www.google.com/generate_204', 'https://www.cloudflare.com/'] as $control) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL            => $control,
            CURLOPT_NOBODY         => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 8,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_USERAGENT      => AUDIT_USER_AGENT,
        ]);
        curl_exec($ch);
        $errno = curl_errno($ch);
        curl_close($ch);

        // A control that is simply unreachable proves nothing either way, so it
        // is not counted — only one that connects and fails to verify.
        if ($errno === CURLE_SSL_CACERT || $errno === CURLE_SSL_PEER_CERTIFICATE) {
            $sslFailures++;
            $tried++;
        } elseif ($errno === 0) {
            $broken = false;         // our TLS demonstrably works; stop asking
            return $broken;
        } else {
            $tried++;
        }
    }

    $broken = $tried > 0 && $sslFailures === $tried;
    if ($broken) {
        @error_log('[audit] this server cannot verify any SSL certificate — set curl.cainfo in php.ini');
    }
    return $broken;
}

/** Resolve a Location header (which may be relative) against the URL it came from. */
function au_resolve_url($base, $rel) {
    $rel = trim($rel);
    if ($rel === '') return null;
    if (preg_match('#^[a-z][a-z0-9+.-]*://#i', $rel)) return $rel;

    $b = @parse_url($base);
    if (!is_array($b) || empty($b['host'])) return null;
    $origin = ($b['scheme'] ?? 'https') . '://' . $b['host'] . (isset($b['port']) ? ':' . $b['port'] : '');

    if (strpos($rel, '//') === 0) return ($b['scheme'] ?? 'https') . ':' . $rel;
    if (strpos($rel, '/') === 0)  return $origin . $rel;

    $dir = isset($b['path']) ? rtrim(dirname($b['path']), '/') : '';
    return $origin . $dir . '/' . $rel;
}

// ── Cache ────────────────────────────────────────────────────────────────────
// Two things live here, and both matter. Re-auditing the same URL inside the TTL
// costs nothing, and the audit RESULT is held server-side so the locked half of
// the report never reaches a browser that has not handed over an email address.

function au_cache_dir() {
    static $dir = null;
    if ($dir !== null) return $dir;

    $dir = AUDIT_CACHE_DIR;
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    if (!is_dir($dir) || !is_writable($dir)) {
        @error_log('[audit] cache dir not writable: ' . $dir);
        au_fail('The audit tool is not set up on this server yet.', 503, 'not_configured');
    }
    return $dir;
}

function au_cache_path($key) {
    if (!preg_match('/^[a-z0-9_-]{1,80}$/i', $key)) throw new InvalidArgumentException('bad cache key');
    return au_cache_dir() . '/' . $key . '.json';
}

function au_cache_get($key, $maxAge = null) {
    $path = au_cache_path($key);
    if (!is_file($path)) return null;
    if ($maxAge !== null && (time() - (int) @filemtime($path)) > $maxAge) return null;

    $raw = @file_get_contents($path);
    if ($raw === false || $raw === '') return null;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : null;
}

/** Atomic write — a half-written cache entry would read back as a broken audit. */
function au_cache_put($key, array $data) {
    $path = au_cache_path($key);
    $tmp  = $path . '.' . bin2hex(random_bytes(6)) . '.tmp';
    if (@file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)) === false) {
        @unlink($tmp);
        return false;
    }
    @chmod($tmp, 0600);
    if (!@rename($tmp, $path)) { @unlink($tmp); return false; }
    return true;
}

/**
 * Delete entries older than a week. Called on a small fraction of runs rather
 * than from cron, which keeps the whole setup to "upload the files".
 */
function au_cache_sweep() {
    if (random_int(1, 25) !== 1) return;
    $cutoff = time() - 604800;
    foreach ((array) @glob(au_cache_dir() . '/*.json') as $f) {
        if (basename($f) === 'rate.json') continue;
        if (@filemtime($f) < $cutoff) @unlink($f);
    }
}

function au_token() {
    return bin2hex(random_bytes(16));
}
