<?php
// ─────────────────────────────────────────────────────────────────────────────
// Free SEO Audit — domain, hosting, technology and link details.
//
// Everything the page itself does not say but the internet does: when the domain
// was registered and when it lapses, who it is registered through, who hosts it,
// what it is built with, what it tracks, which crawlers it lets in, and whether
// its links and assets actually load.
//
// Two outputs:
//   info    plain facts, shown free, like the page snapshot. No advice in here.
//   issues  the handful of these facts that are genuinely problems, in the same
//           au_issue() shape as every other check, so they score and gate the
//           same way.
//
// THE RULES THIS FILE KEEPS
//
//  1. Never slow the audit down much. Every outbound lookup goes in one parallel
//     curl_multi batch with a short timeout, and anything that does not answer
//     in time is simply reported as "not available".
//  2. Never fail the audit. A registry that is down is not the visitor's
//     problem; every function here returns null/empty rather than calling
//     au_fail().
//  3. Never become an SSRF engine. Link checks touch URLs a stranger's page
//     chose, so each host is resolved, checked for a public address, and the
//     connection is PINNED to that address (CURLOPT_RESOLVE) with redirects off.
//     That closes the DNS-rebinding gap a resolve-then-connect check leaves.
//  4. Never show personal data. RDAP can return a registrant's name and address;
//     only the registrar, dates and status are read.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_checks.php';   // au_dom, au_meta, au_abs_url, au_same_site …

if (!defined('AUDIT_LOOKUP_TIMEOUT')) define('AUDIT_LOOKUP_TIMEOUT', 6);   // seconds, per parallel batch
if (!defined('AUDIT_LINK_SAMPLE'))    define('AUDIT_LINK_SAMPLE', 15);     // links checked per audit

// ═════════════════════════════════════════════════════════════════════════════
// Entry point
// ═════════════════════════════════════════════════════════════════════════════

/**
 * $page  au_fetch() result for the audited URL
 * $ctx   run.php context: host, origin, robots_ok, robots_body
 * Returns ['info' => array, 'issues' => array]
 */
function au_site_info(array $page, array $ctx) {
    $host     = (string) ($ctx['host'] ?? '');
    $finalUrl = (string) ($page['final_url'] ?? '');
    $headers  = $page['headers'] ?? [];
    $html     = (string) ($page['body'] ?? '');
    $isHttps  = strpos($finalUrl, 'https://') === 0;
    $x        = au_dom($html);

    $platform = au_platform_suffix($host);
    $domain   = $platform ? null : au_registrable_domain($host);
    au_site_time_left();   // starts the 12-second clock for the whole lookup phase
    $ip       = au_resolve_public($host)['ip'];

    // ── Batch 1: everything that can run at once ─────────────────────────────
    $reqs = [];

    if ($domain) {
        $rdapBase = au_rdap_base_for($domain);
        $boot = au_rdap_bootstrap_cached();
        // Registry redirects are followed (HTTPS only): the base comes from IANA.
        if ($rdapBase) {
            $reqs['rdap_domain'] = ['url' => $rdapBase . 'domain/' . rawurlencode($domain), 'follow' => true, 'accept' => 'application/rdap+json, application/json'];
        } elseif ($boot === null) {
            $reqs['rdap_domain'] = ['url' => 'https://rdap.org/domain/' . rawurlencode($domain), 'follow' => true, 'accept' => 'application/rdap+json, application/json'];
        }
        // Bootstrap cached and the TLD is not in it: there is no RDAP for this
        // TLD, so au_domain_info goes straight to WHOIS.
        if (!$rdapBase && $boot === null) {
            // Fetched alongside, cached for a week, so later audits go straight
            // to the registry instead of through the rdap.org redirector.
            $reqs['rdap_boot'] = ['url' => 'https://data.iana.org/rdap/dns.json', 'max_bytes' => 1048576];
        }
    }
    if ($ip) {
        // The IP is already validated; URL-encoding it would mangle IPv6 colons.
        $reqs['rdap_ip'] = ['url' => 'https://rdap.org/ip/' . $ip, 'follow' => true, 'accept' => 'application/rdap+json, application/json'];
    }

    $origin = (string) ($ctx['origin'] ?? '');
    if ($origin !== '') {
        $reqs['llms'] = ['url' => $origin . '/llms.txt', 'pin' => true, 'max_bytes' => 65536];
    }

    $wwwVariant = au_www_variant($host, $domain);
    if ($wwwVariant !== null) {
        $scheme = $isHttps ? 'https' : 'http';
        $reqs['www'] = ['url' => "$scheme://$wwwVariant/", 'pin' => true, 'max_bytes' => 65536];
    }

    $links = $x ? au_sample_links($x, $finalUrl, $host) : [];
    foreach ($links as $i => $l) {
        $reqs["link$i"] = ['url' => $l['url'], 'pin' => true, 'method' => 'HEAD'];
    }

    $res = au_multi_fetch($reqs);

    if (isset($res['rdap_boot']) && $res['rdap_boot']['status'] === 200) {
        au_rdap_bootstrap_store($res['rdap_boot']['body']);
    }

    // ── Assemble ─────────────────────────────────────────────────────────────
    $domainInfo = au_domain_info($domain, $platform, $res['rdap_domain'] ?? null);
    $dnsInfo    = au_dns_info($domain, $domainInfo['nameservers'] ?? []);
    unset($domainInfo['nameservers']);

    $hosting  = au_hosting_info($ip, $res['rdap_ip'] ?? null, $headers, $page);
    $tech     = au_detect_tech($x, $html, $headers);
    $tracking = au_detect_tracking($x, $html, $domain);
    $ai       = au_ai_info((string) ($ctx['robots_body'] ?? ''), (bool) ($ctx['robots_ok'] ?? false), $res['llms'] ?? null, $finalUrl);
    $www      = $wwwVariant !== null ? au_www_info($wwwVariant, $host, $res['www'] ?? null, $reqs['www']['url']) : null;
    $mixed    = ($x && $isHttps) ? au_mixed_content($x, $finalUrl) : null;
    $broken   = au_link_results($links, $res);

    $info = [
        'domain'   => $domainInfo,
        'dns'      => $dnsInfo,
        'hosting'  => $hosting,
        'tech'     => $tech,
        'tracking' => $tracking,
        'ai'       => $ai,
        'links'    => ['www' => $www, 'mixed' => $mixed, 'broken' => $broken],
    ];

    $issues = au_site_issues($info, $x, $html);

    return ['info' => $info, 'issues' => $issues];
}

/**
 * The same shape with nothing found, for when au_site_info() throws. The front
 * end renders it as "Not available" throughout rather than a missing section.
 */
function au_site_info_empty() {
    return [
        'domain'   => ['name' => null, 'platform' => null, 'created' => null, 'expires' => null, 'updated' => null,
                       'age_days' => null, 'expires_in_days' => null, 'registrar' => null, 'dnssec' => null,
                       'locked' => null, 'source' => null],
        'dns'      => ['nameservers' => [], 'provider' => null],
        'hosting'  => ['ip' => null, 'provider' => null, 'org' => null, 'network' => null, 'country' => null,
                       'rdns' => null, 'cdn' => null, 'server' => null, 'powered_by' => null, 'php' => null,
                       'php_eol' => null, 'http_version' => null, 'http3' => false, 'behind_cdn' => false],
        'tech'     => [],
        'tracking' => [],
        'ai'       => null,
        'links'    => ['www' => null, 'mixed' => null, 'broken' => null],
    ];
}

// ═════════════════════════════════════════════════════════════════════════════
// Safe parallel fetching
// ═════════════════════════════════════════════════════════════════════════════

function au_is_public_ip($ip) {
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) return false;

    if (strpos($ip, ':') !== false) {
        // IPv6 forms that smuggle an IPv4 address inside, which filter_var does
        // not reliably catch: IPv4-mapped (::ffff:a.b.c.d), IPv4-compatible
        // (::a.b.c.d), NAT64 (64:ff9b::/96) and 6to4 (2002::/16).
        $bin = @inet_pton($ip);
        if ($bin === false || strlen($bin) !== 16) return false;
        $first10 = substr($bin, 0, 10);
        $next2 = substr($bin, 10, 2);
        if ($first10 === str_repeat("\0", 10) && ($next2 === "\xff\xff" || $next2 === "\0\0")) return false;
        if (substr($bin, 0, 12) === "\x00\x64\xff\x9b" . str_repeat("\0", 8)) return false;
        if (substr($bin, 0, 2) === "\x20\x02") return false;
        return true;
    }

    // Carrier-grade NAT, 100.64.0.0/10: not "private" to filter_var, but never
    // a public website, and home to at least one cloud metadata service.
    $long = ip2long($ip);
    if ($long !== false && ($long & 0xFFC00000) === (ip2long('100.64.0.0') & 0xFFC00000)) return false;
    return true;
}

/**
 * dns_get_record with a shared time budget. PHP's resolver cannot be given a
 * timeout, and dead domains (exactly what a broken-link check finds) can each
 * take seconds to fail. Once 5 seconds of DNS time are spent, further lookups
 * return null ("could not tell") instead of waiting.
 */
function au_dns_records($name, $type) {
    static $spent = 0.0;
    if ($spent >= 5.0) return null;
    $t = microtime(true);
    $r = @dns_get_record($name, $type);
    $spent += microtime(true) - $t;
    return is_array($r) ? $r : [];
}

/** Seconds left of the whole lookup phase (12s from the first call). */
function au_site_time_left() {
    static $deadline = null;
    if ($deadline === null) $deadline = microtime(true) + 12;
    return $deadline - microtime(true);
}

/**
 * Resolve a hostname to a public address without ever failing the request.
 * Returns ['ip' => string|null, 'error' => null|'dns'|'private'].
 * If ANY address is private the whole host is refused, exactly as au_guard_host does.
 */
function au_resolve_public($host) {
    static $memo = [];
    $host = trim(strtolower((string) $host), '.');
    if (isset($memo[$host])) return $memo[$host];

    if ($host === '') return $memo[$host] = ['ip' => null, 'error' => 'dns'];
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        return $memo[$host] = au_is_public_ip($host) ? ['ip' => $host, 'error' => null] : ['ip' => null, 'error' => 'private'];
    }
    if (preg_match('/(^|\.)(localhost|local|internal|intranet|lan|home|test|example|invalid)$/i', $host)
        || !preg_match('/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i', $host)) {
        return $memo[$host] = ['ip' => null, 'error' => 'private'];
    }

    $a = au_dns_records($host, DNS_A);
    $aaaa = $a === null ? null : au_dns_records($host, DNS_AAAA);
    // Out of DNS time: "could not tell", which callers treat as unverified,
    // never as "this domain does not exist". Not memoised, so it is not sticky.
    if ($a === null || $aaaa === null) return ['ip' => null, 'error' => 'dns_timeout'];

    $ips = [];
    foreach ($a as $r) {
        if (!empty($r['ip'])) $ips[] = $r['ip'];
    }
    foreach ($aaaa as $r) {
        if (!empty($r['ipv6'])) $ips[] = $r['ipv6'];
    }
    if (!$ips && !$a && !$aaaa) {
        // dns_get_record returns nothing both for a missing name and for some
        // hosts that disable it; the system resolver is the tiebreak.
        $v4 = @gethostbyname($host);
        if ($v4 && $v4 !== $host) $ips[] = $v4;
    }
    if (!$ips) return $memo[$host] = ['ip' => null, 'error' => 'dns'];

    foreach ($ips as $ip) {
        if (!au_is_public_ip($ip)) return $memo[$host] = ['ip' => null, 'error' => 'private'];
    }
    // Prefer IPv4: it is what most visitors and every IP registry lookup handle best.
    foreach ($ips as $ip) {
        if (strpos($ip, ':') === false) return $memo[$host] = ['ip' => $ip, 'error' => null];
    }
    return $memo[$host] = ['ip' => $ips[0], 'error' => null];
}

/**
 * Run requests in parallel. Each request is an array:
 *   url        required
 *   method     'GET' (default) or 'HEAD'
 *   pin        true for any URL a stranger chose: resolve, require a public
 *              address, connect only to that address, never follow redirects
 *   follow     true only for fixed, trusted services (registries); HTTPS-only redirects
 *   max_bytes  body cap (default 256 KB)
 *   accept     Accept header
 * Returns the same keys, each ['ok','status','headers','body','error','ms','http_version'].
 */
function au_multi_fetch(array $reqs, $timeout = AUDIT_LOOKUP_TIMEOUT) {
    $blank = ['ok' => false, 'status' => 0, 'headers' => [], 'body' => '', 'error' => null, 'ms' => 0, 'http_version' => 0];
    $out = [];
    if (!$reqs) return $out;

    if (!function_exists('curl_multi_init')) {
        foreach ($reqs as $k => $r) $out[$k] = ['error' => 'no_curl'] + $blank;
        return $out;
    }

    $mh = curl_multi_init();
    if (defined('CURLMOPT_MAX_HOST_CONNECTIONS')) {
        // Fifteen simultaneous hits on a small shared host can trip its rate
        // limiter and make healthy links look broken. Four at a time is polite.
        @curl_multi_setopt($mh, CURLMOPT_MAX_HOST_CONNECTIONS, 4);
    }

    $handles = [];
    $headerBufs = [];

    foreach ($reqs as $k => $r) {
        $url = (string) ($r['url'] ?? '');
        $parts = @parse_url($url);
        $scheme = strtolower($parts['scheme'] ?? '');
        $host = strtolower($parts['host'] ?? '');

        if (($scheme !== 'http' && $scheme !== 'https') || $host === '' || isset($parts['user']) || isset($parts['pass'])) {
            $out[$k] = ['error' => 'bad_url'] + $blank;
            continue;
        }

        $method = strtoupper($r['method'] ?? 'GET') === 'HEAD' ? 'HEAD' : 'GET';
        $max = (int) ($r['max_bytes'] ?? 262144);
        $pin = !empty($r['pin']);
        $follow = !$pin && !empty($r['follow']);

        $ch = curl_init();
        $opts = [
            CURLOPT_URL            => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => $follow,
            CURLOPT_MAXREDIRS      => 4,
            CURLOPT_TIMEOUT        => $timeout,
            CURLOPT_CONNECTTIMEOUT => min(4, $timeout),
            CURLOPT_USERAGENT      => AUDIT_USER_AGENT,
            CURLOPT_ENCODING       => '',
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_NOBODY         => $method === 'HEAD',
            CURLOPT_HTTPHEADER     => ['Accept: ' . ($r['accept'] ?? 'text/html,application/xhtml+xml,*/*;q=0.8')],
            CURLOPT_NOPROGRESS     => false,
            CURLOPT_PROGRESSFUNCTION => function ($c, $dlTotal, $dlNow) use ($max) {
                return ($dlNow > $max) ? 1 : 0;
            },
        ];

        if ($pin) {
            $port = isset($parts['port']) ? (int) $parts['port'] : ($scheme === 'https' ? 443 : 80);
            if ($port !== 80 && $port !== 443) {
                curl_close($ch);
                $out[$k] = ['error' => 'bad_url'] + $blank;
                continue;
            }
            $resolved = au_resolve_public($host);
            if ($resolved['ip'] === null) {
                curl_close($ch);
                $out[$k] = ['error' => $resolved['error']] + $blank;
                continue;
            }
            $addr = strpos($resolved['ip'], ':') !== false ? '[' . $resolved['ip'] . ']' : $resolved['ip'];
            $opts[CURLOPT_RESOLVE] = ["$host:$port:$addr"];
        }

        curl_setopt_array($ch, $opts);
        if (defined('CURLOPT_PROTOCOLS')) @curl_setopt($ch, CURLOPT_PROTOCOLS, CURLPROTO_HTTP | CURLPROTO_HTTPS);
        if (defined('CURLOPT_REDIR_PROTOCOLS')) @curl_setopt($ch, CURLOPT_REDIR_PROTOCOLS, CURLPROTO_HTTPS);

        $headerBufs[$k] = [];
        curl_setopt($ch, CURLOPT_HEADERFUNCTION, function ($c, $line) use (&$headerBufs, $k) {
            // With redirects followed, a new status line starts a new header set.
            if (preg_match('#^HTTP/\S+\s+\d+#', $line)) $headerBufs[$k] = [];
            $i = strpos($line, ':');
            if ($i !== false) $headerBufs[$k][strtolower(trim(substr($line, 0, $i)))] = trim(substr($line, $i + 1));
            return strlen($line);
        });

        curl_multi_add_handle($mh, $ch);
        $handles[$k] = $ch;
    }

    $codes = [];
    $started = microtime(true);
    do {
        $status = curl_multi_exec($mh, $running);
        while ($info = curl_multi_info_read($mh)) {
            $codes[au_handle_id($info['handle'])] = $info['result'];
        }
        if ($running && $status === CURLM_OK) {
            if (curl_multi_select($mh, 0.5) === -1) usleep(50000);
        }
        // A hard ceiling in case a handle's own timeout misbehaves.
        if ((microtime(true) - $started) > $timeout + 2) break;
    } while ($running && $status === CURLM_OK);
    while ($info = curl_multi_info_read($mh)) {
        $codes[au_handle_id($info['handle'])] = $info['result'];
    }

    $ms = (int) round((microtime(true) - $started) * 1000);

    foreach ($handles as $k => $ch) {
        $res = $blank;
        $res['ms'] = $ms;
        $errno = $codes[au_handle_id($ch)] ?? (defined('CURLE_OPERATION_TIMEDOUT') ? CURLE_OPERATION_TIMEDOUT : 28);
        $res['status'] = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        if (defined('CURLINFO_HTTP_VERSION')) $res['http_version'] = (int) curl_getinfo($ch, CURLINFO_HTTP_VERSION);
        $body = curl_multi_getcontent($ch);

        if ($errno !== 0 && $errno !== CURLE_ABORTED_BY_CALLBACK) {
            $res['error'] = au_curl_error_kind($errno);
        } else {
            $res['ok'] = $res['status'] > 0;
            $res['headers'] = $headerBufs[$k] ?? [];
            $res['body'] = is_string($body) ? $body : '';
        }

        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
        $out[$k] = $res;
    }
    curl_multi_close($mh);

    // Keep the caller's key order.
    $ordered = [];
    foreach ($reqs as $k => $r) $ordered[$k] = $out[$k] ?? (['error' => 'timeout'] + $blank);
    return $ordered;
}

function au_handle_id($h) {
    return is_object($h) ? spl_object_id($h) : (int) $h;
}

function au_curl_error_kind($errno) {
    if ($errno === 28) return 'timeout';                    // CURLE_OPERATION_TIMEDOUT
    if ($errno === 6)  return 'dns';                        // CURLE_COULDNT_RESOLVE_HOST
    if (in_array($errno, [35, 51, 58, 59, 60, 77, 83, 90, 91], true)) return 'ssl';
    return 'unreachable';
}

// ═════════════════════════════════════════════════════════════════════════════
// Domain: registrable name, RDAP, WHOIS fallback
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Free platform addresses. A site on one of these has no domain of its own, so
 * looking up "pages.dev" would report Cloudflare's registration as the client's.
 */
function au_platform_suffix($host) {
    $suffixes = [
        'pages.dev', 'workers.dev', 'github.io', 'gitlab.io', 'netlify.app', 'vercel.app', 'wixsite.com',
        'wordpress.com', 'blogspot.com', 'squarespace.com', 'webflow.io', 'herokuapp.com', 'firebaseapp.com',
        'web.app', 'myshopify.com', 'weebly.com', 'godaddysites.com', 'hostingersite.com', 'framer.website',
        'framer.app', 'carrd.co', 'notion.site', 'azurewebsites.net', 'onrender.com', 'glitch.me', 'replit.app',
        'surge.sh', '000webhostapp.com', 'mystrikingly.com', 'site123.me', 'jimdosite.com', 'business.site',
        'wixstudio.io', 'webnode.page', 'zyrosite.com', 'odoo.com', 'blogspot.in', 'amplifyapp.com',
    ];
    $host = strtolower($host);
    foreach ($suffixes as $s) {
        if ($host === $s || substr($host, -strlen('.' . $s)) === '.' . $s) return $s;
    }
    return null;
}

/**
 * The part of a hostname that is actually registered: www.shop.example.co.in ->
 * example.co.in. A compact rule rather than the full Public Suffix List, which
 * is right for the TLDs this tool's visitors use (gTLDs, .in and its second
 * levels, .co.uk, .com.au and the like).
 */
function au_registrable_domain($host) {
    $host = strtolower(trim((string) $host, '.'));
    if ($host === '' || filter_var($host, FILTER_VALIDATE_IP)) return null;

    $labels = explode('.', $host);
    $n = count($labels);
    if ($n < 2) return null;
    if ($n === 2) return $host;

    $tld = $labels[$n - 1];
    $sld = $labels[$n - 2];
    $second = ['co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'gen', 'firm', 'ind', 'ltd', 'plc',
               'nic', 'res', 'biz', 'info', 'or', 'ne', 'go', 'nom', 'sch', 'mil', 'int', 'me', 'id'];
    if (strlen($tld) === 2 && in_array($sld, $second, true)) {
        return implode('.', array_slice($labels, -3));
    }
    return implode('.', array_slice($labels, -2));
}

function au_rdap_bootstrap_cached() {
    static $map = false;
    if ($map !== false) return $map;
    $data = au_cache_get('rdap-boot-dns', 7 * 86400);
    $map = is_array($data) && !empty($data['map']) ? $data['map'] : null;
    return $map;
}

function au_rdap_bootstrap_store($json) {
    $data = json_decode((string) $json, true);
    if (!is_array($data) || empty($data['services'])) return;

    $map = [];
    foreach ($data['services'] as $svc) {
        if (!is_array($svc) || count($svc) < 2) continue;
        $url = null;
        foreach ((array) $svc[1] as $u) {
            if (is_string($u) && strpos($u, 'https://') === 0) { $url = $u; break; }
        }
        if (!$url) continue;
        if (substr($url, -1) !== '/') $url .= '/';
        foreach ((array) $svc[0] as $tld) {
            if (is_string($tld)) $map[strtolower($tld)] = $url;
        }
    }
    if ($map) au_cache_put('rdap-boot-dns', ['map' => $map]);
}

function au_rdap_base_for($domain) {
    $map = au_rdap_bootstrap_cached();
    if (!$map) return null;
    $tld = substr(strrchr($domain, '.'), 1);
    return $map[$tld] ?? null;
}

/** Domain facts from RDAP, falling back to plain WHOIS for TLDs without RDAP. */
function au_domain_info($domain, $platform, $rdapRes) {
    $info = [
        'name' => $domain, 'platform' => $platform,
        'created' => null, 'expires' => null, 'updated' => null,
        'age_days' => null, 'expires_in_days' => null,
        'registrar' => null, 'dnssec' => null, 'locked' => null,
        'source' => null, 'nameservers' => [],
    ];
    if (!$domain) return $info;

    $parsed = null;
    if ($rdapRes && $rdapRes['status'] === 200) {
        $parsed = au_parse_rdap_domain(json_decode($rdapRes['body'], true));
        if ($parsed) $parsed['source'] = 'rdap';
    }
    if (!$parsed || !$parsed['created']) {
        $w = au_whois_domain($domain);
        if ($w) {
            // Keep whatever RDAP did give us; WHOIS fills the gaps.
            $parsed = $parsed ? array_merge($w, array_filter($parsed, function ($v) { return $v !== null && $v !== []; })) : $w;
            $parsed['source'] = $parsed['source'] ?? 'whois';
        }
    }
    if (!$parsed) return $info;

    $info = array_merge($info, $parsed);
    $now = time();
    if ($info['created']) {
        $t = strtotime($info['created']);
        if ($t) { $info['age_days'] = (int) floor(($now - $t) / 86400); $info['created'] = gmdate('Y-m-d', $t); }
        else $info['created'] = null;
    }
    if ($info['expires']) {
        $t = strtotime($info['expires']);
        if ($t) { $info['expires_in_days'] = (int) floor(($t - $now) / 86400); $info['expires'] = gmdate('Y-m-d', $t); }
        else $info['expires'] = null;
    }
    if ($info['updated']) {
        $t = strtotime($info['updated']);
        $info['updated'] = $t ? gmdate('Y-m-d', $t) : null;
    }
    return $info;
}

function au_parse_rdap_domain($d) {
    if (!is_array($d)) return null;
    $out = ['created' => null, 'expires' => null, 'updated' => null, 'registrar' => null,
            'dnssec' => null, 'locked' => null, 'nameservers' => []];

    foreach ((array) ($d['events'] ?? []) as $e) {
        $action = strtolower((string) ($e['eventAction'] ?? ''));
        $date = (string) ($e['eventDate'] ?? '');
        if ($date === '') continue;
        if ($action === 'registration' && !$out['created']) $out['created'] = $date;
        if ($action === 'expiration' && !$out['expires']) $out['expires'] = $date;
        if ($action === 'last changed' && !$out['updated']) $out['updated'] = $date;
    }

    foreach ((array) ($d['entities'] ?? []) as $ent) {
        if (in_array('registrar', (array) ($ent['roles'] ?? []), true)) {
            $out['registrar'] = au_vcard_fn($ent) ?: null;
            break;
        }
    }

    foreach ((array) ($d['nameservers'] ?? []) as $ns) {
        if (is_array($ns) && is_string($ns['ldhName'] ?? null) && $ns['ldhName'] !== '') {
            $out['nameservers'][] = strtolower(rtrim($ns['ldhName'], '.'));
        }
    }

    if (isset($d['secureDNS']['delegationSigned'])) $out['dnssec'] = (bool) $d['secureDNS']['delegationSigned'];

    $status = array_map('strtolower', array_filter((array) ($d['status'] ?? []), 'is_string'));
    if ($status) {
        $out['locked'] = false;
        foreach ($status as $s) {
            // RDAP says "client transfer prohibited"; some servers echo the EPP form.
            if (strpos($s, 'transfer prohibited') !== false || strpos($s, 'transferprohibited') !== false) { $out['locked'] = true; break; }
        }
    }

    return $out;
}

/** The display name from an RDAP entity's jCard. */
function au_vcard_fn($entity) {
    $card = $entity['vcardArray'][1] ?? null;
    if (!is_array($card)) return '';
    foreach ($card as $prop) {
        if (is_array($prop) && ($prop[0] ?? '') === 'fn' && is_string($prop[3] ?? null)) {
            return au_clean($prop[3], 120);
        }
    }
    return '';
}

/**
 * Port-43 WHOIS, for ccTLDs whose registry has no RDAP service. Asks IANA which
 * server handles the TLD, then asks that server. Short timeouts throughout, and
 * plenty of shared hosts block port 43 outright — then this quietly returns null.
 */
function au_whois_domain($domain) {
    $tld = substr(strrchr($domain, '.'), 1);
    if ($tld === '' || $tld === false) return null;

    // Plenty of shared hosts block port 43. Once a connection has failed, stop
    // trying for a day instead of spending seconds on every audit.
    if (au_cache_get('whois-blocked', 86400) !== null) return null;
    if (au_site_time_left() < 5) return null;

    $key = 'whois-srv-' . preg_replace('/[^a-z0-9-]/', '', $tld);
    $cached = au_cache_get($key, 30 * 86400);
    $server = $cached['server'] ?? null;
    if ($server === '' && (time() - (int) ($cached['at'] ?? 0)) < 86400) return null;   // known: no WHOIS for this TLD
    if (!$server) {
        $iana = au_whois_query('whois.iana.org', $tld);
        if ($iana === null) return null;
        $server = preg_match('/^whois:\s*(\S+)/mi', $iana, $m) ? strtolower($m[1]) : '';
        au_cache_put($key, ['server' => $server, 'at' => time()]);
        if ($server === '') return null;
    }

    $raw = au_whois_query($server, $domain);
    if ($raw === null) return null;

    $grab = function (array $labels) use ($raw) {
        foreach ($labels as $l) {
            if (preg_match('/^\s*' . $l . '\s*:\s*(.+)$/mi', $raw, $m)) {
                $v = trim($m[1]);
                if ($v !== '') return $v;
            }
        }
        return null;
    };

    $out = [
        'created'   => $grab(['Creation Date', 'Created On', 'Registration Time', 'Registered on', 'created', 'Domain Registration Date']),
        'expires'   => $grab(['Registry Expiry Date', 'Registrar Registration Expiration Date', 'Expiration Date', 'Expiry Date', 'Expiration Time', 'paid-till', 'expires', 'Domain Expiration Date']),
        'updated'   => $grab(['Updated Date', 'Last Updated On', 'last-modified', 'changed']),
        'registrar' => $grab(['Registrar', 'Sponsoring Registrar', 'registrar']),
        'dnssec' => null, 'locked' => null, 'nameservers' => [],
    ];
    if ($out['registrar']) $out['registrar'] = au_clean($out['registrar'], 120);
    if (preg_match_all('/^\s*Name Server\s*:\s*(\S+)/mi', $raw, $m)) {
        $out['nameservers'] = array_values(array_unique(array_map(function ($n) { return strtolower(rtrim($n, '.')); }, $m[1])));
    }
    if (preg_match('/clientTransferProhibited|serverTransferProhibited/i', $raw)) $out['locked'] = true;

    return ($out['created'] || $out['expires'] || $out['registrar']) ? $out : null;
}

function au_whois_query($server, $query) {
    if (!preg_match('/^[a-z0-9.-]+$/i', $server)) return null;
    $resolved = au_resolve_public($server);
    if ($resolved['ip'] === null) return null;

    $addr = strpos($resolved['ip'], ':') !== false ? '[' . $resolved['ip'] . ']' : $resolved['ip'];
    $fp = @fsockopen($addr, 43, $errno, $errstr, 4);
    if (!$fp) {
        au_cache_put('whois-blocked', ['at' => time()]);
        return null;
    }

    stream_set_timeout($fp, 4);
    fwrite($fp, $query . "\r\n");
    $buf = '';
    $deadline = microtime(true) + 5;
    while (!feof($fp) && strlen($buf) < 65536 && microtime(true) < $deadline) {
        $chunk = fread($fp, 8192);
        if ($chunk === false || $chunk === '') {
            $meta = stream_get_meta_data($fp);
            if (!empty($meta['timed_out'])) break;
            if ($chunk === false) break;
            continue;
        }
        $buf .= $chunk;
    }
    fclose($fp);
    return $buf !== '' ? $buf : null;
}

// ═════════════════════════════════════════════════════════════════════════════
// DNS and hosting
// ═════════════════════════════════════════════════════════════════════════════

/** [regex, display name], checked in order: the first match wins. */
function au_dns_providers() {
    return [
        ['/cloudflare\.com$/', 'Cloudflare'],
        ['/dns-parking\.com$|hostinger|hstgr/', 'Hostinger'],
        ['/domaincontrol\.com$/', 'GoDaddy'],
        ['/awsdns/', 'Amazon Route 53'],
        ['/googledomains\.com$|google\.com$/', 'Google Cloud DNS'],
        ['/azure-dns\./', 'Microsoft Azure DNS'],
        ['/registrar-servers\.com$/', 'Namecheap'],
        ['/bluehost\.com$/', 'Bluehost'],
        ['/hostgator\./', 'HostGator'],
        ['/websitewelcome\.com$/', 'HostGator'],
        ['/siteground\./', 'SiteGround'],
        ['/wixdns\.net$/', 'Wix'],
        ['/squarespacedns\.com$/', 'Squarespace'],
        ['/shopify\.com$/', 'Shopify'],
        ['/vercel-dns\.com$/', 'Vercel'],
        ['/nsone\.net$/', 'NS1 (often Netlify)'],
        ['/digitalocean\.com$/', 'DigitalOcean'],
        ['/linode\.com$/', 'Akamai (Linode)'],
        ['/akam\.net$/', 'Akamai'],
        ['/hetzner\./', 'Hetzner'],
        ['/ovh\.net$/', 'OVHcloud'],
        ['/bigrock\./', 'BigRock'],
        ['/znetlive\./', 'ZNetLive'],
        ['/name\.com$/', 'Name.com'],
        ['/porkbun\.com$/', 'Porkbun'],
        ['/ultradns\./', 'UltraDNS'],
        ['/dynect\.net$/', 'Oracle Dyn'],
        ['/worldnic\.com$/', 'Network Solutions'],
        ['/ui-dns\./', 'IONOS'],
        ['/dnsimple\./', 'DNSimple'],
        ['/gandi\.net$/', 'Gandi'],
        ['/he\.net$/', 'Hurricane Electric'],
        ['/dreamhost\.com$/', 'DreamHost'],
        ['/a2hosting\.com$/', 'A2 Hosting'],
        ['/inmotionhosting\.com$/', 'InMotion Hosting'],
        ['/wordpress\.com$/', 'WordPress.com'],
        ['/zoho\.com$/', 'Zoho'],
        ['/cloudns\.net$/', 'ClouDNS'],
    ];
}

function au_dns_info($domain, array $rdapNs) {
    $out = ['nameservers' => [], 'provider' => null];
    if (!$domain) return $out;

    $ns = [];
    foreach ((array) au_dns_records($domain, DNS_NS) as $r) {
        if (!empty($r['target'])) $ns[] = strtolower(rtrim($r['target'], '.'));
    }
    if (!$ns) $ns = $rdapNs;
    $ns = array_values(array_unique($ns));
    sort($ns);
    $out['nameservers'] = array_slice($ns, 0, 6);

    foreach ($out['nameservers'] as $n) {
        foreach (au_dns_providers() as $p) {
            if (preg_match($p[0], $n)) { $out['provider'] = $p[1]; break 2; }
        }
    }
    // Unknown but present: show the nameserver's own domain rather than nothing.
    if (!$out['provider'] && $out['nameservers']) {
        $out['provider'] = au_registrable_domain($out['nameservers'][0]);
    }
    return $out;
}

/** [regex, provider], matched against registry names, reverse DNS and headers. */
function au_host_providers() {
    return [
        ['/hostinger|hstgr/i', 'Hostinger'],
        ['/cloudflare/i', 'Cloudflare'],
        ['/amazon|\baws\b|ec2-|amazonaws/i', 'Amazon Web Services'],
        ['/google|googleusercontent|1e100\.net/i', 'Google Cloud'],
        ['/microsoft|azure/i', 'Microsoft Azure'],
        ['/digitalocean/i', 'DigitalOcean'],
        ['/linode/i', 'Akamai Cloud (Linode)'],
        ['/akamai/i', 'Akamai'],
        ['/hetzner/i', 'Hetzner'],
        ['/\bovh/i', 'OVHcloud'],
        ['/godaddy|secureserver|wild west domains/i', 'GoDaddy'],
        ['/websitewelcome|hostgator/i', 'HostGator'],
        ['/bluehost|unified ?layer/i', 'Bluehost'],
        ['/siteground/i', 'SiteGround'],
        ['/a2 ?hosting|a2hosting/i', 'A2 Hosting'],
        ['/inmotion/i', 'InMotion Hosting'],
        ['/dreamhost/i', 'DreamHost'],
        ['/namecheap/i', 'Namecheap'],
        ['/liquid ?web/i', 'Liquid Web'],
        ['/wp ?engine|wpengine/i', 'WP Engine'],
        ['/kinsta/i', 'Kinsta'],
        ['/automattic|wordpress\.com/i', 'WordPress.com'],
        ['/\bwix/i', 'Wix'],
        ['/squarespace/i', 'Squarespace'],
        ['/shopify/i', 'Shopify'],
        ['/fastly/i', 'Fastly'],
        ['/vercel/i', 'Vercel'],
        ['/netlify/i', 'Netlify'],
        ['/github/i', 'GitHub Pages'],
        ['/contabo/i', 'Contabo'],
        ['/vultr|choopa/i', 'Vultr'],
        ['/ionos|1&1|1and1/i', 'IONOS'],
        ['/bigrock/i', 'BigRock'],
        ['/znet/i', 'ZNetLive'],
        ['/e2e ?networks/i', 'E2E Networks'],
        ['/ctrls|ctrl-s/i', 'CtrlS'],
        ['/netmagic/i', 'NTT Netmagic'],
        ['/yotta/i', 'Yotta'],
        ['/oracle/i', 'Oracle Cloud'],
        ['/alibaba|aliyun/i', 'Alibaba Cloud'],
        ['/leaseweb/i', 'Leaseweb'],
        ['/scaleway|online s\.a\.s/i', 'Scaleway'],
        ['/webflow/i', 'Webflow'],
    ];
}

function au_match_provider($text) {
    if (!is_string($text) || $text === '') return null;
    foreach (au_host_providers() as $p) {
        if (preg_match($p[0], $text)) return $p[1];
    }
    return null;
}

/** CDN in front of the site, from response headers. */
function au_detect_cdn(array $h) {
    $server = strtolower((string) ($h['server'] ?? ''));
    if (isset($h['cf-ray']) || $server === 'cloudflare') return 'Cloudflare';
    if (isset($h['x-amz-cf-id']) || isset($h['x-amz-cf-pop'])) return 'Amazon CloudFront';
    if (isset($h['x-hcdn-request-id']) || strpos($server, 'hcdn') !== false) return 'Hostinger CDN';
    if (isset($h['x-qc-pop']) || isset($h['x-qc-cache'])) return 'QUIC.cloud';
    if (isset($h['x-sucuri-id'])) return 'Sucuri';
    if (strpos($server, 'bunnycdn') !== false) return 'Bunny CDN';
    if (isset($h['x-akamai-transformed']) || strpos($server, 'akamai') !== false) return 'Akamai';
    if (isset($h['x-azure-ref'])) return 'Azure Front Door';
    if (isset($h['x-vercel-id'])) return 'Vercel Edge';
    if (isset($h['x-nf-request-id'])) return 'Netlify Edge';
    if (isset($h['x-fastly-request-id']) || (isset($h['x-served-by']) && strpos(strtolower($h['x-served-by']), 'cache-') === 0)) return 'Fastly';
    if (strpos($server, 'stackpath') !== false || isset($h['x-sp-url'])) return 'StackPath';
    return null;
}

/** A hosting platform that identifies itself in a header, even through a CDN. */
function au_platform_from_headers(array $h) {
    $platform = strtolower((string) ($h['platform'] ?? ''));
    $server = strtolower((string) ($h['server'] ?? ''));
    $powered = strtolower((string) ($h['x-powered-by'] ?? ''));
    if ($platform === 'hostinger' || isset($h['x-hcdn-request-id'])) return 'Hostinger';
    if (isset($h['x-shopid']) || isset($h['x-shopify-stage']) || isset($h['x-sorting-hat-shopid'])) return 'Shopify';
    if (isset($h['x-wix-request-id']) || $server === 'pepyaka') return 'Wix';
    if (strpos($server, 'squarespace') !== false) return 'Squarespace';
    if (isset($h['x-kinsta-cache'])) return 'Kinsta';
    if (isset($h['wpe-backend']) || strpos($powered, 'wp engine') !== false) return 'WP Engine';
    if (isset($h['x-github-request-id']) || $server === 'github.com') return 'GitHub Pages';
    if (isset($h['x-vercel-id']) || $server === 'vercel') return 'Vercel';
    if (isset($h['x-nf-request-id']) || $server === 'netlify') return 'Netlify';
    if (isset($h['x-pantheon-styx-hostname'])) return 'Pantheon';
    if (isset($h['x-ah-environment'])) return 'Acquia';
    if (strpos($server, 'google frontend') !== false) return 'Google Cloud';
    if (isset($h['x-wf-region']) || isset($h['x-webflow-ver'])) return 'Webflow';
    return null;
}

function au_hosting_info($ip, $rdapRes, array $headers, array $page) {
    $out = [
        'ip' => $ip, 'provider' => null, 'org' => null, 'network' => null, 'country' => null,
        'rdns' => null, 'cdn' => au_detect_cdn($headers), 'server' => null, 'powered_by' => null,
        'php' => null, 'php_eol' => null, 'http_version' => null, 'http3' => false, 'behind_cdn' => false,
    ];

    if ($ip) {
        $arpa = au_reverse_name($ip);
        if ($arpa) {
            foreach ((array) au_dns_records($arpa, DNS_PTR) as $r) {
                if (!empty($r['target'])) { $out['rdns'] = strtolower(rtrim($r['target'], '.')); break; }
            }
        }
    }

    if ($rdapRes && $rdapRes['status'] === 200) {
        $d = json_decode($rdapRes['body'], true);
        if (is_array($d)) {
            $out['network'] = isset($d['name']) ? au_clean((string) $d['name'], 80) : null;
            $out['country'] = is_string($d['country'] ?? null) && preg_match('/^[A-Z]{2}$/', strtoupper($d['country'])) ? strtoupper($d['country']) : null;
            $out['org'] = au_rdap_ip_org($d);
            if (!$out['org']) {
                foreach ((array) ($d['remarks'] ?? []) as $rm) {
                    $desc = $rm['description'][0] ?? '';
                    if (is_string($desc) && $desc !== '') { $out['org'] = au_clean($desc, 120); break; }
                }
            }
        }
    }

    // Who hosts it: a platform naming itself in a header beats an IP registry,
    // because it sees through a CDN; then the registry; then reverse DNS.
    $fromHeaders = au_platform_from_headers($headers);
    $out['provider'] = $fromHeaders
        ?: au_match_provider((string) $out['org'])
        ?: au_match_provider((string) $out['network'])
        ?: au_match_provider((string) $out['rdns'])
        ?: ($out['org'] ?: null);
    // When the only thing we can see is the CDN's own network, the real host is
    // hidden behind it, and saying "hosted by Cloudflare" would be wrong.
    $out['behind_cdn'] = !$fromHeaders && $out['cdn'] !== null && $out['provider'] !== null
        && au_match_provider($out['cdn']) === $out['provider'];

    $server = (string) ($headers['server'] ?? '');
    $out['server'] = $server !== '' ? au_clean($server, 60) : null;
    $powered = (string) ($headers['x-powered-by'] ?? '');
    $out['powered_by'] = $powered !== '' ? au_clean($powered, 60) : null;
    if (preg_match('#php/(\d+)\.(\d+)(?:\.(\d+))?#i', $powered . ' ' . $server, $m)) {
        $out['php'] = $m[1] . '.' . $m[2] . (isset($m[3]) ? '.' . $m[3] : '');
        $out['php_eol'] = au_php_eol((int) $m[1], (int) $m[2]);
    }

    $v = (int) ($page['http_version'] ?? 0);
    // CURL_HTTP_VERSION_1_0 = 1, 1_1 = 2, 2_0 = 3, 3 = 30
    $out['http_version'] = $v === 30 ? 'HTTP/3' : ($v === 3 ? 'HTTP/2' : ($v === 2 ? 'HTTP/1.1' : ($v === 1 ? 'HTTP/1.0' : null)));
    $out['http3'] = $v === 30 || stripos((string) ($headers['alt-svc'] ?? ''), 'h3') !== false;

    return $out;
}

function au_reverse_name($ip) {
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        return implode('.', array_reverse(explode('.', $ip))) . '.in-addr.arpa';
    }
    $bin = @inet_pton($ip);
    if ($bin === false || strlen($bin) !== 16) return null;
    $hex = bin2hex($bin);
    return implode('.', array_reverse(str_split($hex))) . '.ip6.arpa';
}

/** The organisation that holds an IP block, from an RIR's RDAP entities. */
function au_rdap_ip_org(array $d) {
    // Flatten nested entities, then prefer the registrant, then an
    // administrative contact. Abuse desks are never the answer.
    $flat = [];
    $stack = (array) ($d['entities'] ?? []);
    while ($stack && count($flat) < 50) {
        $e = array_shift($stack);
        if (!is_array($e)) continue;
        $flat[] = $e;
        foreach ((array) ($e['entities'] ?? []) as $child) $stack[] = $child;
    }
    foreach (['registrant', 'administrative'] as $role) {
        foreach ($flat as $e) {
            $roles = (array) ($e['roles'] ?? []);
            if (in_array($role, $roles, true) && !in_array('abuse', $roles, true)) {
                $fn = au_vcard_fn($e);
                if ($fn !== '') return $fn;
            }
        }
    }
    return null;
}

/**
 * Is this PHP release past its last security fix? Dates from php.net's
 * supported-versions page; anything not listed is older than all of them.
 */
function au_php_eol($major, $minor) {
    $eol = [
        '8.0' => '2023-11-26', '8.1' => '2025-12-31', '8.2' => '2026-12-31',
        '8.3' => '2027-12-31', '8.4' => '2028-12-31', '8.5' => '2029-12-31',
    ];
    $key = "$major.$minor";
    if (!isset($eol[$key])) return $major < 8;
    return time() > strtotime($eol[$key] . ' 23:59:59 UTC');
}

// ═════════════════════════════════════════════════════════════════════════════
// Technology and tracking
// ═════════════════════════════════════════════════════════════════════════════

function au_detect_tech($x, $html, array $headers) {
    $found = [];
    $add = function ($name, $cat, $version = null) use (&$found) {
        if (isset($found[$name])) {
            if ($version && !$found[$name]['version']) $found[$name]['version'] = $version;
            return;
        }
        $found[$name] = ['name' => $name, 'cat' => $cat, 'version' => $version ? au_clean($version, 20) : null];
    };

    // Generator tags name the platform outright, often with a version.
    if ($x) {
        foreach ($x->query('//meta[translate(@name,"GENERATOR","generator")="generator"]/@content') as $g) {
            $v = (string) $g->nodeValue;
            if (preg_match('/WordPress\s*([\d.]+)?/i', $v, $m)) $add('WordPress', 'CMS', $m[1] ?? null);
            elseif (preg_match('/Joomla!?\s*([\d.]+)?/i', $v, $m)) $add('Joomla', 'CMS', $m[1] ?? null);
            elseif (preg_match('/Drupal\s*([\d.]+)?/i', $v, $m)) $add('Drupal', 'CMS', $m[1] ?? null);
            elseif (stripos($v, 'Wix.com') !== false) $add('Wix', 'Website builder');
            elseif (stripos($v, 'Squarespace') !== false) $add('Squarespace', 'Website builder');
            elseif (stripos($v, 'Webflow') !== false) $add('Webflow', 'Website builder');
            elseif (preg_match('/Ghost\s*([\d.]+)?/i', $v, $m)) $add('Ghost', 'CMS', $m[1] ?? null);
            elseif (preg_match('/Hugo\s*([\d.]+)?/i', $v, $m)) $add('Hugo', 'Static site generator', $m[1] ?? null);
            elseif (preg_match('/Jekyll\s*v?([\d.]+)?/i', $v, $m)) $add('Jekyll', 'Static site generator', $m[1] ?? null);
            elseif (preg_match('/Gatsby\s*([\d.]+)?/i', $v, $m)) $add('Gatsby', 'Framework', $m[1] ?? null);
            elseif (preg_match('/WooCommerce\s*([\d.]+)?/i', $v, $m)) $add('WooCommerce', 'E-commerce', $m[1] ?? null);
            elseif (preg_match('/Elementor\s*([\d.]+)?/i', $v, $m)) $add('Elementor', 'Page builder', $m[1] ?? null);
            elseif (stripos($v, 'Site Kit by Google') !== false) $add('Site Kit by Google', 'WordPress plugin');
            elseif (stripos($v, 'Zyro') !== false || stripos($v, 'Hostinger') !== false) $add('Hostinger Website Builder', 'Website builder');
            elseif (stripos($v, 'Duda') !== false) $add('Duda', 'Website builder');
            elseif (preg_match('/TYPO3/i', $v)) $add('TYPO3', 'CMS');
        }
    }

    $sig = [
        ['#/wp-content/|/wp-includes/#i', 'WordPress', 'CMS'],
        ['#cdn\.shopify\.com|Shopify\.theme#', 'Shopify', 'E-commerce'],
        ['#static\.wixstatic\.com|wix-bolt|_wixCssImports#', 'Wix', 'Website builder'],
        ['#static1\.squarespace\.com|squarespace-cdn#', 'Squarespace', 'Website builder'],
        ['#data-wf-page|website-files\.com#', 'Webflow', 'Website builder'],
        ['#img1\.wsimg\.com#', 'GoDaddy Website Builder', 'Website builder'],
        ['#irp\.cdn-website\.com|lirp\.cdn-website\.com#', 'Duda', 'Website builder'],
        ['#zyrosite\.com|assets\.zyrosite#', 'Hostinger Website Builder', 'Website builder'],
        ['#cdn11\.bigcommerce\.com#', 'BigCommerce', 'E-commerce'],
        ['#Mage\.Cookies|/static/version\d+/frontend/#', 'Magento', 'E-commerce'],
        ['#/wp-content/plugins/woocommerce/#', 'WooCommerce', 'E-commerce'],
        ['#/wp-content/plugins/elementor/#', 'Elementor', 'Page builder'],
        ['#/wp-content/themes/Divi/|et_pb_section#', 'Divi', 'Page builder'],
        ['#/wp-content/plugins/js_composer/#', 'WPBakery', 'Page builder'],
        ['#Yoast SEO plugin|yoast-schema-graph#', 'Yoast SEO', 'SEO plugin'],
        ['#rank-math|Rank Math#', 'Rank Math', 'SEO plugin'],
        ['#All in One SEO|aioseo#', 'All in One SEO', 'SEO plugin'],
        ['#WP Rocket#', 'WP Rocket', 'Caching'],
        ['#LiteSpeed Cache#', 'LiteSpeed Cache', 'Caching'],
        ['#__NEXT_DATA__|/_next/static/#', 'Next.js', 'Framework'],
        ['#__NUXT__|/_nuxt/#', 'Nuxt', 'Framework'],
        ['#id="___gatsby"#', 'Gatsby', 'Framework'],
        ['#ng-version="#', 'Angular', 'Framework'],
        ['#data-reactroot|react-dom#', 'React', 'Framework'],
        ['#cdn\.ampproject\.org#', 'AMP', 'Framework'],
        ['#jquery[.-]?(\d+\.\d+(?:\.\d+)?)?(?:\.min)?\.js#i', 'jQuery', 'JavaScript library'],
        ['#bootstrap(?:\.bundle)?(?:\.min)?\.(?:css|js)#i', 'Bootstrap', 'CSS framework'],
        ['#cdn\.tailwindcss\.com#', 'Tailwind CSS', 'CSS framework'],
        ['#fonts\.googleapis\.com#', 'Google Fonts', 'Fonts'],
        ['#embed\.tawk\.to#', 'Tawk.to', 'Live chat'],
        ['#widget\.intercom\.io|intercomSettings#', 'Intercom', 'Live chat'],
        ['#client\.crisp\.chat#', 'Crisp', 'Live chat'],
        ['#code\.tidio\.co#', 'Tidio', 'Live chat'],
        ['#static\.zdassets\.com#', 'Zendesk', 'Live chat'],
        ['#js\.hs-scripts\.com|js\.hsforms\.net#', 'HubSpot', 'Marketing'],
        ['#wa\.me/|api\.whatsapp\.com/send#', 'WhatsApp link', 'Contact'],
        ['#calendly\.com#', 'Calendly', 'Booking'],
        ['#google\.com/recaptcha|recaptcha/api\.js#', 'reCAPTCHA', 'Security'],
        ['#cookieyes|cdn-cookieyes#', 'CookieYes', 'Cookie consent'],
        ['#consent\.cookiebot\.com#', 'Cookiebot', 'Cookie consent'],
    ];
    foreach ($sig as $s) {
        if (preg_match($s[0], $html, $m)) {
            $ver = null;
            if ($s[1] === 'jQuery' && !empty($m[1])) $ver = $m[1];
            $add($s[1], $s[2], $ver);
        }
    }

    // What the server says about itself.
    $server = (string) ($headers['server'] ?? '');
    if (preg_match('#^(nginx|apache|litespeed|openresty|microsoft-iis|caddy)(?:/([\d.]+))?#i', $server, $m)) {
        $names = ['nginx' => 'Nginx', 'apache' => 'Apache', 'litespeed' => 'LiteSpeed', 'openresty' => 'OpenResty', 'microsoft-iis' => 'Microsoft IIS', 'caddy' => 'Caddy'];
        $add($names[strtolower($m[1])], 'Web server', $m[2] ?? null);
    }
    $powered = (string) ($headers['x-powered-by'] ?? '');
    if (preg_match('#php/([\d.]+)#i', $powered, $m)) $add('PHP', 'Language', $m[1]);
    if (stripos($powered, 'ASP.NET') !== false) $add('ASP.NET', 'Framework');
    if (stripos($powered, 'Express') !== false) $add('Express (Node.js)', 'Framework');
    if (stripos($powered, 'Next.js') !== false) $add('Next.js', 'Framework');

    return array_values($found);
}

function au_detect_tracking($x, $html, $domain) {
    $id = function ($re) use ($html) {
        return preg_match($re, $html, $m) ? ($m[1] ?? '') : null;
    };

    $ga4 = $id('#googletagmanager\.com/gtag/js\?id=(G-[A-Z0-9]{4,14})#i')
        ?? $id('#gtag\(\s*[\'"]config[\'"]\s*,\s*[\'"](G-[A-Z0-9]{4,14})#i')
        ?? $id('#[\'"]measurementId[\'"]\s*:\s*[\'"](G-[A-Z0-9]{4,14})#');
    $gtm = $id('#\b(GTM-[A-Z0-9]{4,10})\b#') ?? $id('#(googletagmanager\.com/gtm\.js)#');
    $ua  = $id('#[\'"](UA-\d{4,10}-\d{1,4})[\'"]#');
    $ads = $id('#[\'"](AW-\d{6,12})[\'"]#') ?? $id('#gtag/js\?id=(AW-\d{6,12})#');
    $fb  = $id('#fbq\(\s*[\'"]init[\'"]\s*,\s*[\'"](\d{8,20})#') ?? $id('#(connect\.facebook\.net/[^"\']*/fbevents\.js)#');
    $clarity = $id('#clarity\.ms/tag/([a-z0-9]{6,14})#i') ?? $id('#(clarity\.ms/tag)#i');
    $hotjar  = $id('#hjid\s*:\s*(\d{5,10})#') ?? $id('#(static\.hotjar\.com)#');
    $linkedin = $id('#_linkedin_partner_id\s*=\s*[\'"]?(\d{4,12})#') ?? $id('#(snap\.licdn\.com)#');
    $tiktok  = $id('#(analytics\.tiktok\.com)#');

    // Search Console can be verified with a meta tag or a DNS TXT record; check both.
    $gscMeta = $x ? au_meta($x, 'google-site-verification') : '';
    $gscDns = false;
    if ($domain) {
        foreach ((array) au_dns_records($domain, DNS_TXT) as $r) {
            $txt = is_array($r['entries'] ?? null) ? implode('', $r['entries']) : (string) ($r['txt'] ?? '');
            if (stripos($txt, 'google-site-verification=') === 0) { $gscDns = true; break; }
        }
    }
    $bing = $x ? au_meta($x, 'msvalidate.01') : '';

    $row = function ($idKey, $name, $value, $maybeText = null) {
        $isId = is_string($value) && preg_match('/^(G-|GTM-|UA-|AW-|\d)/', $value);
        if ($value !== null) return ['id' => $idKey, 'name' => $name, 'state' => 'yes', 'detail' => $isId ? $value : null];
        if ($maybeText !== null) return ['id' => $idKey, 'name' => $name, 'state' => 'maybe', 'detail' => $maybeText];
        return ['id' => $idKey, 'name' => $name, 'state' => 'no', 'detail' => null];
    };

    $rows = [
        $row('ga4', 'Google Analytics 4', $ga4, ($ga4 === null && $gtm !== null) ? 'May be set up inside Tag Manager' : null),
        $row('gtm', 'Google Tag Manager', $gtm),
        $row('gsc', 'Google Search Console', ($gscMeta !== '' || $gscDns) ? 'verified' : null),
        $row('meta_pixel', 'Meta (Facebook) Pixel', $fb),
        $row('google_ads', 'Google Ads tag', $ads),
        $row('clarity', 'Microsoft Clarity', $clarity),
        $row('bing', 'Bing Webmaster Tools', $bing !== '' ? 'verified' : null),
    ];
    $rows[2]['detail'] = ($gscMeta !== '' || $gscDns)
        ? ($gscDns ? 'Verified by DNS record' : 'Verified by meta tag')
        // Not proof of absence: an HTML-file or Analytics verification leaves no trace we can see.
        : 'No meta tag or DNS record. It may still be verified another way';
    if ($bing !== '') $rows[6]['detail'] = 'Verified by meta tag';
    // Only listed when present: absence of these is not worth a red cross.
    if ($ua !== null)       $rows[] = ['id' => 'ua', 'name' => 'Universal Analytics (shut down in 2024)', 'state' => 'yes', 'detail' => $ua];
    if ($hotjar !== null)   $rows[] = $row('hotjar', 'Hotjar', $hotjar);
    if ($linkedin !== null) $rows[] = $row('linkedin', 'LinkedIn Insight Tag', $linkedin);
    if ($tiktok !== null)   $rows[] = $row('tiktok', 'TikTok Pixel', $tiktok);

    // Privacy-friendly and product analytics: listed only when present, and
    // each one counts as "has analytics" for the scored check.
    $others = [
        ['plausible', 'Plausible Analytics', '#plausible\.io/js/#'],
        ['matomo', 'Matomo', '#matomo\.js|piwik\.js|_paq\.push#'],
        ['fathom', 'Fathom Analytics', '#cdn\.usefathom\.com#'],
        ['umami', 'Umami', '#data-website-id=[^>]+umami|umami\.is/script\.js|/umami\.js#'],
        ['cf_analytics', 'Cloudflare Web Analytics', '#static\.cloudflareinsights\.com/beacon#'],
        ['posthog', 'PostHog', '#posthog\.init|i\.posthog\.com#'],
        ['mixpanel', 'Mixpanel', '#cdn\.mxpnl\.com|mixpanel\.init#'],
    ];
    foreach ($others as $o) {
        if (preg_match($o[2], $html)) $rows[] = ['id' => $o[0], 'name' => $o[1], 'state' => 'yes', 'detail' => null];
    }

    return $rows;
}

// ═════════════════════════════════════════════════════════════════════════════
// robots.txt: search and AI crawlers, llms.txt
// ═════════════════════════════════════════════════════════════════════════════

function au_crawler_list() {
    // kind: search = decides whether you appear in that product's answers;
    //       user   = fetches a page when a person asks the assistant about it;
    //       training = collects text to train models; blocking it is a choice.
    return [
        ['token' => 'googlebot',          'name' => 'Googlebot',          'owner' => 'Google Search',       'kind' => 'search'],
        ['token' => 'bingbot',            'name' => 'Bingbot',            'owner' => 'Bing and Copilot',    'kind' => 'search'],
        ['token' => 'oai-searchbot',      'name' => 'OAI-SearchBot',      'owner' => 'ChatGPT search',      'kind' => 'search'],
        ['token' => 'chatgpt-user',       'name' => 'ChatGPT-User',       'owner' => 'ChatGPT',             'kind' => 'user'],
        ['token' => 'perplexitybot',      'name' => 'PerplexityBot',      'owner' => 'Perplexity',          'kind' => 'search'],
        ['token' => 'claude-searchbot',   'name' => 'Claude-SearchBot',   'owner' => 'Claude search',       'kind' => 'search'],
        ['token' => 'claude-user',        'name' => 'Claude-User',        'owner' => 'Claude',              'kind' => 'user'],
        ['token' => 'gptbot',             'name' => 'GPTBot',             'owner' => 'OpenAI training',     'kind' => 'training'],
        ['token' => 'claudebot',          'name' => 'ClaudeBot',          'owner' => 'Anthropic training',  'kind' => 'training'],
        ['token' => 'google-extended',    'name' => 'Google-Extended',    'owner' => 'Gemini training',     'kind' => 'training'],
        ['token' => 'applebot-extended',  'name' => 'Applebot-Extended',  'owner' => 'Apple AI training',   'kind' => 'training'],
        ['token' => 'ccbot',              'name' => 'CCBot',              'owner' => 'Common Crawl',        'kind' => 'training'],
        ['token' => 'meta-externalagent', 'name' => 'Meta-ExternalAgent', 'owner' => 'Meta AI training',    'kind' => 'training'],
    ];
}

/** Parse robots.txt into user-agent groups (RFC 9309). */
function au_robots_groups($txt) {
    // A UTF-8 byte-order mark would hide the first User-agent line, and with it
    // a "Disallow: /" that blocks the whole site.
    $txt = preg_replace('/^\xEF\xBB\xBF/', '', (string) $txt);
    $groups = [];
    $cur = null;
    $lastWasAgent = false;
    foreach (preg_split('/\r\n|\r|\n/', (string) $txt) as $line) {
        $line = trim(preg_replace('/#.*/', '', $line));
        if ($line === '' || !preg_match('/^([A-Za-z-]+)\s*:\s*(.*)$/', $line, $m)) continue;
        $field = strtolower($m[1]);
        $val = trim($m[2]);
        if ($field === 'user-agent') {
            if (!$lastWasAgent || $cur === null) {
                $groups[] = ['agents' => [], 'rules' => []];
                $cur = count($groups) - 1;
            }
            // "GPTBot/1.0" and "gptbot" name the same crawler.
            $groups[$cur]['agents'][] = strtolower(preg_replace('#/.*$#', '', $val));
            $lastWasAgent = true;
        } elseif ($field === 'allow' || $field === 'disallow') {
            if ($cur !== null) $groups[$cur]['rules'][] = [$field, $val];
            $lastWasAgent = false;
        } else {
            $lastWasAgent = false;
        }
    }
    return $groups;
}

/** Is $path allowed for crawler $token? Longest matching rule wins; Allow wins a tie. */
function au_robots_allowed(array $groups, $token, $path) {
    $rules = [];
    $specific = false;
    foreach ($groups as $g) {
        if (in_array($token, $g['agents'], true)) { $rules = array_merge($rules, $g['rules']); $specific = true; }
    }
    if (!$specific) {
        foreach ($groups as $g) {
            if (in_array('*', $g['agents'], true)) $rules = array_merge($rules, $g['rules']);
        }
    }

    $best = -1;
    $allowed = true;
    foreach ($rules as $r) {
        list($type, $pattern) = $r;
        if ($pattern === '') continue;   // "Disallow:" with nothing blocks nothing
        $re = '#^' . str_replace(['\*', '\$'], ['.*', '$'], preg_quote($pattern, '#')) . '#';
        if (!@preg_match($re, $path)) continue;
        $len = strlen($pattern);
        if ($len > $best || ($len === $best && $type === 'allow')) {
            $best = $len;
            $allowed = $type === 'allow';
        }
    }
    return $allowed;
}

function au_ai_info($robotsBody, $robotsOk, $llmsRes, $finalUrl) {
    $path = (string) (@parse_url($finalUrl, PHP_URL_PATH) ?: '/');
    $groups = $robotsOk ? au_robots_groups($robotsBody) : [];

    $bots = [];
    foreach (au_crawler_list() as $c) {
        $bots[] = [
            'name' => $c['name'], 'owner' => $c['owner'], 'kind' => $c['kind'],
            'allowed' => $groups ? au_robots_allowed($groups, $c['token'], $path) : true,
        ];
    }

    $llms = false;
    if ($llmsRes && $llmsRes['status'] === 200) {
        $type = strtolower((string) ($llmsRes['headers']['content-type'] ?? ''));
        // Single-page apps answer every path with their index.html and a 200.
        $llms = strpos($type, 'html') === false && trim($llmsRes['body']) !== '' && stripos(ltrim($llmsRes['body']), '<!doctype') !== 0;
    }

    return ['robots_found' => $robotsOk, 'path' => au_clean($path, 300), 'bots' => $bots, 'llms_txt' => $llms];
}

// ═════════════════════════════════════════════════════════════════════════════
// www consistency, mixed content, broken links
// ═════════════════════════════════════════════════════════════════════════════

/** The other spelling of the homepage host (www <-> bare), or null for other subdomains. */
function au_www_variant($host, $domain) {
    if (!$domain) return null;
    if ($host === $domain) return 'www.' . $domain;
    if ($host === 'www.' . $domain) return $domain;
    return null;
}

function au_www_info($variant, $host, $res, $startUrl) {
    $out = ['variant' => $variant, 'state' => 'unknown', 'detail' => null];
    if (!$res) return $out;
    $res['_url'] = $startUrl;

    // Follow up to three hops by hand, pinned each time, to see where it lands.
    $hops = 0;
    while ($res['error'] === null && $res['status'] >= 300 && $res['status'] < 400 && $hops < 2 && au_site_time_left() > 2) {
        $loc = (string) ($res['headers']['location'] ?? '');
        $next = $loc !== '' ? au_resolve_url($res['_url'], $loc) : null;
        if ($next === null) break;
        $nextHost = strtolower((string) @parse_url($next, PHP_URL_HOST));
        if ($nextHost === $host) {
            $out['state'] = 'redirects';
            $out['detail'] = "Redirects to $host";
            return $out;
        }
        if ($nextHost !== $variant) {
            $out['state'] = 'elsewhere';
            $out['detail'] = 'Redirects to ' . au_clean($nextHost, 80);
            return $out;
        }
        $res = au_multi_fetch(['n' => ['url' => $next, 'pin' => true, 'max_bytes' => 65536]])['n'];
        $res['_url'] = $next;
        $hops++;
    }

    if ($res['error'] === 'dns') {
        $out['state'] = 'no_dns';
        $out['detail'] = "$variant does not exist in DNS";
    } elseif ($res['error'] === 'ssl') {
        if (function_exists('au_ca_bundle_broken') && au_ca_bundle_broken()) return $out;
        $out['state'] = 'ssl';
        $out['detail'] = "$variant has no valid SSL certificate";
    } elseif ($res['error'] !== null) {
        // Only a refused connection is evidence. A timeout or a DNS lookup we
        // ran out of time for proves nothing, so it is left out of the report.
        if ($res['error'] === 'unreachable') {
            $out['state'] = 'unreachable';
            $out['detail'] = "$variant refused the connection";
        }
    } elseif ($res['status'] >= 200 && $res['status'] < 300) {
        $out['state'] = 'duplicate';
        $out['detail'] = "$variant shows the site without redirecting";
    } elseif (in_array($res['status'], [404, 410], true) || $res['status'] >= 500) {
        // 401/403/429 are bot walls answering us, not visitors; not counted.
        $out['state'] = 'error';
        $out['detail'] = "$variant returns an error ({$res['status']})";
    }
    return $out;
}

function au_mixed_content(DOMXPath $x, $finalUrl) {
    $active = [];
    $passive = [];
    $queries = [
        'active'  => ['//script/@src', '//link[contains(translate(@rel,"STYLESHEET","stylesheet"),"stylesheet")]/@href',
                      '//iframe/@src', '//embed/@src', '//object/@data', '//form/@action'],
        'passive' => ['//img/@src', '//source/@src', '//video/@src', '//audio/@src', '//video/@poster'],
    ];
    foreach ($queries as $kind => $qs) {
        foreach ($qs as $q) {
            foreach ($x->query($q) as $attr) {
                $v = trim((string) $attr->nodeValue);
                if (stripos($v, 'http://') !== 0) continue;
                if ($kind === 'active') $active[$v] = true; else $passive[$v] = true;
            }
        }
    }
    $samples = array_slice(array_merge(array_keys($active), array_keys($passive)), 0, 5);
    return [
        'active' => count($active), 'passive' => count($passive),
        'samples' => array_map(function ($u) { return au_clean($u, 200); }, $samples),
    ];
}

/** Up to AUDIT_LINK_SAMPLE unique links: internal first (they are the site's own), then external. */
function au_sample_links(DOMXPath $x, $finalUrl, $host) {
    $self = preg_replace('/#.*$/', '', $finalUrl);
    $internal = [];
    $external = [];
    foreach ($x->query('//a[@href]') as $a) {
        $href = trim($a->getAttribute('href'));
        if ($href === '' || $href[0] === '#' || preg_match('#^(mailto|tel|javascript|sms|data|whatsapp):#i', $href)) continue;
        $abs = au_abs_url($href, $finalUrl);
        if ($abs === '') continue;
        $abs = preg_replace('/#.*$/', '', $abs);
        if ($abs === $self || rtrim($abs, '/') === rtrim($self, '/')) continue;
        $linkHost = strtolower((string) @parse_url($abs, PHP_URL_HOST));
        if ($linkHost === '') continue;
        if (au_same_site($linkHost, $host)) $internal[$abs] = true; else $external[$abs] = true;
    }

    $int = array_keys($internal);
    $ext = array_keys($external);
    $wantExt = min(count($ext), 5);
    $wantInt = min(count($int), AUDIT_LINK_SAMPLE - $wantExt);
    $wantExt = min(count($ext), AUDIT_LINK_SAMPLE - $wantInt);

    $out = [];
    foreach (array_slice($int, 0, $wantInt) as $u) $out[] = ['url' => $u, 'internal' => true];
    foreach (array_slice($ext, 0, $wantExt) as $u) $out[] = ['url' => $u, 'internal' => false];
    return $out;
}

function au_link_results(array $links, array $res) {
    $out = ['checked' => 0, 'ok' => 0, 'unverified' => 0, 'broken' => []];
    if (!$links) return $out;

    // Plenty of servers answer HEAD wrongly (405, 403, even 404). Anything that
    // did not come back clean is asked again with a real GET before we call it broken.
    $retry = [];
    foreach ($links as $i => $l) {
        $r = $res["link$i"] ?? null;
        if (!$r) continue;
        if ($r['error'] === null && $r['status'] >= 400) $retry["link$i"] = ['url' => $l['url'], 'pin' => true, 'max_bytes' => 32768];
        if ($r['error'] === 'timeout' || $r['error'] === 'unreachable') $retry["link$i"] = ['url' => $l['url'], 'pin' => true, 'max_bytes' => 32768];
    }
    if ($retry && au_site_time_left() > 3) $res = array_merge($res, au_multi_fetch($retry, (int) min(AUDIT_LOOKUP_TIMEOUT, floor(au_site_time_left()) - 1)));

    foreach ($links as $i => $l) {
        $r = $res["link$i"] ?? null;
        if (!$r || $r['error'] === 'private' || $r['error'] === 'bad_url') continue;
        $out['checked']++;

        $status = (int) $r['status'];
        $reason = null;
        if ($r['error'] === 'dns') {
            $reason = 'Domain does not exist';
        } elseif ($r['error'] === null && in_array($status, [404, 410], true)) {
            $reason = $status === 404 ? 'Page not found (404)' : 'Page removed (410)';
        } elseif ($r['error'] === null && $status >= 500) {
            $reason = "Server error ($status)";
        }

        if ($reason !== null) {
            $out['broken'][] = ['url' => au_clean($l['url'], 300), 'internal' => $l['internal'], 'status' => $status, 'reason' => $reason];
        } elseif ($r['error'] === null && $status >= 200 && $status < 400) {
            $out['ok']++;
        } else {
            // 401/403/429/999 (bot walls), timeouts, odd TLS: cannot tell either way.
            $out['unverified']++;
        }
    }
    return $out;
}

// ═════════════════════════════════════════════════════════════════════════════
// The scored findings
// ═════════════════════════════════════════════════════════════════════════════

function au_tracking_detail(array $rows, $id) {
    foreach ($rows as $r) if ($r['id'] === $id) return (string) $r['detail'];
    return '';
}

function au_site_issues(array $info, $x, $html) {
    $out = [];
    $d = $info['domain'];

    // Search engines blocked by robots.txt — the gravest of these, by far.
    $bots = [];
    foreach ($info['ai']['bots'] as $b) $bots[$b['name']] = $b;
    if (isset($bots['Googlebot']) && !$bots['Googlebot']['allowed']) {
        $out[] = au_issue('robots_block', 'technical', 12, 'fail',
            'robots.txt lets Google crawl the page',
            'Your robots.txt tells Google not to crawl this page. Google cannot read what it cannot crawl, so the page either drops out of results or shows up with no description. Everything else in this report comes second to this.',
            'Remove or narrow the Disallow rule that matches this address in /robots.txt. "Disallow: /" under "User-agent: *" or "User-agent: Googlebot" blocks the whole site; it is usually left over from a staging copy. Then use URL Inspection in Search Console to ask Google to recrawl.',
            'Googlebot is disallowed for ' . $info['ai']['path']);
    } elseif (isset($bots['Bingbot']) && !$bots['Bingbot']['allowed']) {
        $out[] = au_issue('robots_block', 'technical', 12, 'warn',
            'robots.txt lets Google crawl the page',
            'Google may crawl this page but Bing may not. Bing also powers Copilot, DuckDuckGo and part of ChatGPT search, so this one rule hides you from all of them.',
            'Remove the Disallow rule for Bingbot in /robots.txt unless you have a specific reason to keep Bing out.',
            'Bingbot is disallowed for ' . $info['ai']['path']);
    } else {
        $out[] = au_issue('robots_block', 'technical', 12, 'pass', 'robots.txt lets Google crawl the page');
    }

    // AI search assistants
    $blockedAi = [];
    foreach ($info['ai']['bots'] as $b) {
        if (($b['kind'] === 'search' || $b['kind'] === 'user') && !in_array($b['name'], ['Googlebot', 'Bingbot'], true) && !$b['allowed']) {
            $blockedAi[] = $b['name'] . ' (' . $b['owner'] . ')';
        }
    }
    if ($blockedAi) {
        $out[] = au_issue('ai_search', 'technical', 3, 'warn',
            'Visible to AI search assistants',
            'Your robots.txt blocks the crawlers that AI assistants use to find and quote websites. When someone asks ChatGPT, Perplexity or Claude for a business like yours, they cannot cite a site they are not allowed to read. That is a fast-growing source of enquiries that you are opting out of.',
            'Allow the search and user-request crawlers (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Claude-User) in robots.txt. You can still block the training crawlers (GPTBot, ClaudeBot, Google-Extended, CCBot) if you do not want your content used to train models. Those are separate switches. If you use Cloudflare, also check its "Block AI bots" setting, which blocks them at the firewall regardless of robots.txt.',
            'Blocked: ' . implode(', ', $blockedAi));
    } else {
        $out[] = au_issue('ai_search', 'technical', 3, 'pass', 'Visible to AI search assistants');
    }

    // Domain expiry
    if ($d['expires_in_days'] !== null) {
        $days = $d['expires_in_days'];
        $when = $d['expires'];
        if ($days < 30) {
            $out[] = au_issue('domain_expiry', 'technical', 4, 'fail',
                'Domain registration',
                $days < 0
                    ? "The domain registration expired on $when. The site may still be loading during the grace period, but it can stop at any moment and the name can then be bought by someone else."
                    : "The domain expires in $days days ($when). If the renewal fails because a card has expired or a reminder went to an old inbox, the website and every email address on the domain stop working at once. Lapsed domains are bought up within hours.",
                'Log in to the registrar' . ($d['registrar'] ? " ({$d['registrar']})" : '') . ' today, renew for several years, switch on auto-renew, and check that the payment card and the account email are current.',
                "Expires $when");
        } elseif ($days < 60) {
            $out[] = au_issue('domain_expiry', 'technical', 4, 'warn',
                'Domain registration',
                "The domain expires in $days days ($when). If auto-renew is off or the card on file has expired, the site and email go down together on that date.",
                'Confirm auto-renew is on at the registrar' . ($d['registrar'] ? " ({$d['registrar']})" : '') . ' and that the card on file is valid, or renew now for a few years.',
                "Expires $when");
        } else {
            $out[] = au_issue('domain_expiry', 'technical', 4, 'pass', 'Domain registration', '', '', "Registered until $when");
        }
    }

    // www vs bare domain
    $www = $info['links']['www'];
    if ($www && $www['state'] !== 'unknown') {
        $v = $www['variant'];
        if ($www['state'] === 'redirects') {
            $out[] = au_issue('www_redirect', 'technical', 4, 'pass', 'www and non-www versions agree', '', '', $www['detail']);
        } elseif ($www['state'] === 'duplicate') {
            $out[] = au_issue('www_redirect', 'technical', 4, 'warn',
                'www and non-www versions agree',
                "Your site loads at $v as well, without redirecting. To Google these are two separate websites with the same content, so links people give you are split between them instead of building up on one.",
                "Add a permanent 301 redirect from $v to your main address for every page. On Hostinger and most hosts this is a redirect rule in .htaccess or a setting in the control panel.",
                $www['detail']);
        } elseif ($www['state'] !== 'elsewhere') {
            $out[] = au_issue('www_redirect', 'technical', 4, 'warn',
                'www and non-www versions agree',
                "People who type $v instead of your main address get an error, not your website. Many people still type the www, and many leave it off. Either way, some of them reach a dead end and assume you have closed.",
                $www['state'] === 'no_dns'
                    ? "Add a DNS record for $v (a CNAME to your main domain is usual) and redirect it to your main address."
                    : "Make $v answer with a valid SSL certificate that covers it, and redirect it permanently to your main address.",
                $www['detail']);
        }
    }

    // Mixed content
    $mixed = $info['links']['mixed'];
    if ($mixed !== null) {
        if ($mixed['active'] > 0) {
            $out[] = au_issue('mixed_content', 'technical', 5, 'fail',
                'Everything loads over HTTPS',
                'The page is served over HTTPS but loads ' . $mixed['active'] . ' script, stylesheet, frame or form over plain HTTP. Browsers block these outright, so parts of the page silently break, and the padlock warning makes visitors doubt the site.',
                'Change every http:// address in your theme, page builder and settings to https://. In WordPress a search-and-replace plugin fixes the database in one pass. Anything that is not available over HTTPS should be replaced.',
                implode(', ', $mixed['samples']));
        } elseif ($mixed['passive'] > 0) {
            $out[] = au_issue('mixed_content', 'technical', 5, 'warn',
                'Everything loads over HTTPS',
                'The page loads ' . $mixed['passive'] . ' image or media file over plain HTTP. Browsers either upgrade or block them, and some show the page as "not fully secure".',
                'Update those addresses to https://. They are usually old image URLs saved in posts or theme settings.',
                implode(', ', $mixed['samples']));
        } else {
            $out[] = au_issue('mixed_content', 'technical', 5, 'pass', 'Everything loads over HTTPS');
        }
    }

    // Broken links
    $b = $info['links']['broken'];
    if ($b['checked'] > 0) {
        $n = count($b['broken']);
        $list = implode(', ', array_map(function ($l) { return $l['url'] . ' (' . $l['reason'] . ')'; }, array_slice($b['broken'], 0, 4)));
        if ($n === 0) {
            $out[] = au_issue('broken_links', 'technical', 5, 'pass', 'Links on the page work', '', '', "{$b['ok']} of {$b['checked']} links checked");
        } else {
            $out[] = au_issue('broken_links', 'technical', 5, $n >= 2 ? 'fail' : 'warn',
                'Links on the page work',
                "$n of the {$b['checked']} links we checked are broken. Visitors who click one hit a dead end, and Google wastes its crawl on pages that do not exist. A site with dead links looks neglected to both.",
                'Fix or remove each broken link. If the page moved, link to its new address and add a 301 redirect from the old one so any other links to it keep working. Then run a full-site link check, because we only sampled this page.',
                $list);
        }
    }

    // Analytics
    $isShell = $x && au_word_count(au_body_text($x)) < 50 && preg_match('#<script[^>]+type=["\']module["\']#i', $html);
    // Hosted builders count visits themselves, server-side, with nothing in the
    // HTML. "No analytics" would be untrue for them, so the check is left out.
    $builtIn = in_array($info['hosting']['provider'] ?? '', ['Shopify', 'Wix', 'Squarespace', 'WordPress.com'], true);
    foreach ($info['tech'] as $tItem) {
        if (in_array($tItem['name'], ['Shopify', 'Wix', 'Squarespace', 'Hostinger Website Builder', 'GoDaddy Website Builder', 'Duda'], true)) $builtIn = true;
    }
    if (!$isShell && !$builtIn) {
        $t = [];
        foreach ($info['tracking'] as $r) $t[$r['id']] = $r['state'];
        $modern = ($t['ga4'] ?? 'no') !== 'no' || ($t['gtm'] ?? 'no') === 'yes';
        foreach (['clarity', 'plausible', 'matomo', 'fathom', 'umami', 'cf_analytics', 'posthog', 'mixpanel'] as $k) {
            if (($t[$k] ?? 'no') === 'yes') $modern = true;
        }
        if (!$modern && isset($t['ua'])) {
            $out[] = au_issue('analytics', 'technical', 4, 'fail',
                'Visitor analytics installed',
                'The only analytics tag on the page is Universal Analytics, which Google shut down in 2024. It records nothing, so you have no idea how many people visit, where they come from, or which pages bring enquiries.',
                'Set up a Google Analytics 4 property, add its tag (directly or through Google Tag Manager), and remove the old UA- code. Then link it to Search Console so you can see which searches bring visitors.',
                'Found: ' . au_tracking_detail($info['tracking'], 'ua'));
        } elseif (!$modern) {
            $out[] = au_issue('analytics', 'technical', 4, 'warn',
                'Visitor analytics installed',
                'We could not find any analytics on the page. Without it you cannot tell how many people visit, which pages they read, or whether any SEO work is paying off.',
                'Install Google Analytics 4 (free), ideally through Google Tag Manager so later tags do not need a developer, and link it to Search Console.');
        } else {
            $out[] = au_issue('analytics', 'technical', 4, 'pass', 'Visitor analytics installed');
        }
    }

    return $out;
}
