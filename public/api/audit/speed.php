<?php
// ─────────────────────────────────────────────────────────────────────────────
// Free SEO Audit — the Speed section, from Google PageSpeed Insights.
//
//   POST { token }  ->  { speed_state, speed, overall, categories, ... }
//
// WHY THIS IS A SECOND REQUEST
//
// PageSpeed takes 20–40 seconds to return, because Google loads the page in a
// real browser to produce it. Folding that into run.php would mean the visitor
// stares at a spinner for the better part of a minute before seeing anything at
// all, on a page whose entire job is to feel effortless. So run.php returns the
// HTML findings in a few seconds, the browser shows them, and this endpoint
// fills in the Speed card when Google answers.
//
// It also means a PageSpeed outage costs one card, not the whole audit.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_checks.php';

au_method('POST');

$in = au_body();
$token = (string) ($in['token'] ?? '');
if (!preg_match('/^[a-f0-9]{32}$/', $token)) au_fail('That audit has expired. Please run it again.', 400, 'bad_token');

$report = au_cache_get('t' . $token, AUDIT_CACHE_TTL);
if ($report === null) au_fail('That audit has expired. Please run it again.', 404, 'expired');

// Already answered — a second tab, or a retry after the connection dropped.
if (!empty($report['speed'])) au_respond(au_speed_view($report));

if (!AUDIT_HAS_PSI) {
    $report['speed_state'] = 'unavailable';
    au_cache_put('t' . $token, $report);
    au_respond(au_speed_view($report));
}

// Google's own budget for this call is the wall-clock cost of loading the page
// in a browser, so the script needs to outlive PHP's default limit.
@set_time_limit(120);

$psi = au_psi_fetch($report['final_url'] ?? $report['url']);

if ($psi === null) {
    // A PageSpeed failure is not an audit failure. Mark the card unavailable and
    // let the rest of the report stand.
    $report['speed_state'] = 'unavailable';
    au_cache_put('t' . $token, $report);
    if (!empty($report['url_key'])) au_cache_put($report['url_key'], $report);
    au_respond(au_speed_view($report));
}

// Fold the speed findings into the report and re-score, so the overall number
// reflects everything that was measured rather than everything except speed.
$speedIssues = au_speed_issues($psi);
$report['issues']      = array_merge($report['issues'], $speedIssues);
$report['speed']       = $psi['summary'];
$report['speed_state'] = 'ready';

$scores = au_score($report['issues']);
$report['overall']    = $scores['overall'];
$report['categories'] = $scores['categories'];

au_cache_put('t' . $token, $report);
if (!empty($report['url_key'])) au_cache_put($report['url_key'], $report);

au_respond(au_speed_view($report));

// ── PageSpeed Insights ───────────────────────────────────────────────────────

/**
 * Ask Google to score the page on mobile. Returns null on any failure — a
 * missing Speed card is a far better outcome than a broken report.
 */
function au_psi_fetch($url) {
    if (!function_exists('curl_init')) return null;

    $endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?'
        . http_build_query([
            'url'      => $url,
            'key'      => AUDIT_PSI_KEY,
            // Mobile, because Google indexes the mobile version of the site and
            // that is where an SMB's traffic actually is.
            'strategy' => 'mobile',
            'category' => 'performance',
        ]);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => $endpoint,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 75,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERAGENT      => AUDIT_USER_AGENT,
    ]);
    $body   = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($body === false || $status !== 200) {
        // Worth a log line: a 403 here means the key is wrong, unrestricted in
        // the wrong direction, or the PageSpeed API is not enabled on the
        // project — all of which look identical from the browser.
        @error_log('[audit] PSI returned ' . $status . ' for ' . $url);
        return null;
    }

    $data = json_decode($body, true);
    if (!is_array($data) || empty($data['lighthouseResult'])) return null;

    return au_psi_normalise($data);
}

/** Pull the handful of numbers worth reporting out of Lighthouse's large payload. */
function au_psi_normalise(array $data) {
    $lh = $data['lighthouseResult'];
    $audits = $lh['audits'] ?? [];

    $num = function ($id) use ($audits) {
        return isset($audits[$id]['numericValue']) ? (float) $audits[$id]['numericValue'] : null;
    };
    $disp = function ($id) use ($audits) {
        return (string) ($audits[$id]['displayValue'] ?? '');
    };

    $score = isset($lh['categories']['performance']['score'])
        ? (int) round(100 * (float) $lh['categories']['performance']['score'])
        : null;

    // Field data — what real visitors experienced over the last 28 days. Only
    // present for sites with enough Chrome traffic, which many SMB sites lack.
    $field = [];
    foreach (($data['loadingExperience']['metrics'] ?? []) as $key => $m) {
        $field[$key] = [
            'percentile' => $m['percentile'] ?? null,
            'category'   => $m['category'] ?? null,
        ];
    }

    // The biggest wins Lighthouse found, with the time each would save.
    $opportunities = [];
    foreach ($audits as $id => $a) {
        if (($a['details']['type'] ?? '') !== 'opportunity') continue;
        $saving = (float) ($a['details']['overallSavingsMs'] ?? 0);
        if ($saving < 150) continue;
        $opportunities[] = ['title' => au_clean($a['title'] ?? $id, 120), 'savings_ms' => (int) round($saving)];
    }
    usort($opportunities, function ($a, $b) { return $b['savings_ms'] <=> $a['savings_ms']; });

    return [
        'score'  => $score,
        'lcp'    => $num('largest-contentful-paint'),
        'cls'    => $num('cumulative-layout-shift'),
        'tbt'    => $num('total-blocking-time'),
        'fcp'    => $num('first-contentful-paint'),
        'srt'    => $num('server-response-time'),
        'field'  => $field,
        'opportunities' => array_slice($opportunities, 0, 5),
        'summary' => [
            'score'    => $score,
            'lcp'      => $disp('largest-contentful-paint'),
            'cls'      => $disp('cumulative-layout-shift'),
            'tbt'      => $disp('total-blocking-time'),
            'fcp'      => $disp('first-contentful-paint'),
            'has_field' => !empty($field),
            'field_inp' => $field['INTERACTION_TO_NEXT_PAINT']['category'] ?? null,
            'field_lcp' => $field['LARGEST_CONTENTFUL_PAINT_MS']['category'] ?? null,
            'field_cls' => $field['CUMULATIVE_LAYOUT_SHIFT_SCORE']['category'] ?? null,
        ],
    ];
}

// ── Speed findings ───────────────────────────────────────────────────────────
// Thresholds are Google's own Core Web Vitals boundaries, not invented ones, so
// the report agrees with what the client will see if they check PageSpeed
// themselves — which the sceptical ones always do.

function au_speed_issues(array $psi) {
    $out = [];

    if ($psi['score'] !== null) {
        $s = $psi['score'];
        if ($s < 50) {
            $out[] = au_issue('psi_score', 'speed', 10, 'fail',
                'Google PageSpeed score (mobile)',
                "Google scores this page $s out of 100 on a phone. Around half of mobile visitors abandon a page that takes more than three seconds, so a score in this range is not a technical statistic — it is the share of your advertising and SEO spend that never reaches a human being.",
                'The fixes below are ordered by the time each would save. In practice the first three on almost every SMB site are: compress and resize the images (they are usually the whole problem), remove plugins and tracking scripts nobody uses, and turn on caching plus a CDN.',
                "Score: $s/100");
        } elseif ($s < 90) {
            $out[] = au_issue('psi_score', 'speed', 10, 'warn',
                'Google PageSpeed score (mobile)',
                "Google scores this page $s out of 100 on a phone. It is usable, but each additional second of load time measurably reduces enquiries, and competitors scoring in the 90s are getting a small advantage on every visit.",
                'Work through the opportunities Lighthouse identified below, largest saving first. Image weight and render-blocking scripts are almost always where the time is.',
                "Score: $s/100");
        } else {
            $out[] = au_issue('psi_score', 'speed', 10, 'pass', 'Google PageSpeed score (mobile)', '', '', "Score: $s/100");
        }
    }

    // Largest Contentful Paint — when the main content actually appears.
    if ($psi['lcp'] !== null) {
        $sec = round($psi['lcp'] / 1000, 1);
        if ($psi['lcp'] > 4000) {
            $out[] = au_issue('lcp', 'speed', 9, 'fail',
                'Largest Contentful Paint',
                "The main content takes {$sec} seconds to appear. Google's threshold for "
                . 'a good experience is 2.5 seconds, and this is one of the Core Web Vitals it uses as a ranking signal. Until it appears, the visitor is looking at a blank screen.',
                'The largest element is nearly always a hero image or a background video. Serve it in WebP at the size it is actually displayed, preload it, and stop any font or script from blocking the render ahead of it.',
                "{$sec}s (target: under 2.5s)");
        } elseif ($psi['lcp'] > 2500) {
            $out[] = au_issue('lcp', 'speed', 9, 'warn',
                'Largest Contentful Paint',
                "The main content takes {$sec} seconds to appear, over Google's 2.5 second threshold for a good experience.",
                'Compress the hero image and preload it, and defer any JavaScript that is not needed to draw the first screen.',
                "{$sec}s (target: under 2.5s)");
        } else {
            $out[] = au_issue('lcp', 'speed', 9, 'pass', 'Largest Contentful Paint', '', '', "{$sec}s");
        }
    }

    // Cumulative Layout Shift — content jumping while the page settles.
    if ($psi['cls'] !== null) {
        $cls = round($psi['cls'], 3);
        if ($psi['cls'] > 0.25) {
            $out[] = au_issue('cls', 'speed', 6, 'fail',
                'Layout stability',
                "The page moves around as it loads (score $cls, where anything over 0.1 is a problem). This is what makes someone tap the wrong button because it shifted under their thumb, and it is a ranking signal in its own right.",
                'Set explicit width and height attributes on every image and iframe, reserve space for ad slots and banners before they load, and load custom fonts with font-display: swap so text does not reflow when they arrive.',
                "CLS: $cls (target: under 0.1)");
        } elseif ($psi['cls'] > 0.1) {
            $out[] = au_issue('cls', 'speed', 6, 'warn',
                'Layout stability',
                "The page shifts slightly as it loads (score $cls, target under 0.1).",
                'Usually one element: an image without dimensions, a late-loading banner, or a web font swapping in. Set explicit sizes on images and reserve space for anything injected after load.',
                "CLS: $cls (target: under 0.1)");
        } else {
            $out[] = au_issue('cls', 'speed', 6, 'pass', 'Layout stability', '', '', "CLS: $cls");
        }
    }

    // Total Blocking Time — the lab stand-in for interaction responsiveness.
    if ($psi['tbt'] !== null) {
        $tbt = (int) round($psi['tbt']);
        if ($psi['tbt'] > 600) {
            $out[] = au_issue('tbt', 'speed', 6, 'fail',
                'Responsiveness to taps',
                "The page is frozen by its own JavaScript for {$tbt}ms while loading. During that window taps and scrolls do nothing, which visitors read as a broken site rather than a slow one.",
                'Audit what is running: tag managers, chat widgets, popup tools and analytics stacked on top of each other are the usual cause. Remove what is not earning its place, and defer the rest until after the page is interactive.',
                "{$tbt}ms blocked (target: under 200ms)");
        } elseif ($psi['tbt'] > 200) {
            $out[] = au_issue('tbt', 'speed', 6, 'warn',
                'Responsiveness to taps',
                "JavaScript blocks interaction for {$tbt}ms during load, over the 200ms target.",
                'Defer non-essential third-party scripts until after first paint, and load chat and analytics widgets last.',
                "{$tbt}ms blocked (target: under 200ms)");
        } else {
            $out[] = au_issue('tbt', 'speed', 6, 'pass', 'Responsiveness to taps', '', '', "{$tbt}ms blocked");
        }
    }

    // Real-visitor data, where Chrome has collected enough of it.
    $inp = $psi['field']['INTERACTION_TO_NEXT_PAINT']['category'] ?? null;
    if ($inp !== null) {
        $ms = $psi['field']['INTERACTION_TO_NEXT_PAINT']['percentile'] ?? null;
        if ($inp === 'SLOW') {
            $out[] = au_issue('inp_field', 'speed', 7, 'fail',
                'Real visitor responsiveness (INP)',
                "This is not a lab estimate — it is what your actual visitors experienced over the last 28 days, and it is failing. Interaction to Next Paint became a Core Web Vital in March 2024, so Google is already using it against this site.",
                'INP measures the delay between a tap and the screen changing. Long tasks in JavaScript are the cause; the fix is the same as for blocking time — cut third-party scripts and break up heavy work.',
                $ms !== null ? "INP: {$ms}ms (target: under 200ms)" : 'Rated slow by Chrome field data');
        } elseif ($inp === 'AVERAGE') {
            $out[] = au_issue('inp_field', 'speed', 7, 'warn',
                'Real visitor responsiveness (INP)',
                'Real visitors are experiencing noticeable delays between tapping and the page responding.',
                'Reduce the JavaScript running on interaction, particularly third-party widgets that hook into scroll and click events.',
                $ms !== null ? "INP: {$ms}ms (target: under 200ms)" : 'Rated average by Chrome field data');
        } else {
            $out[] = au_issue('inp_field', 'speed', 7, 'pass', 'Real visitor responsiveness (INP)', '', '',
                $ms !== null ? "INP: {$ms}ms" : 'Rated good by Chrome field data');
        }
    }

    // The concrete wins, with Google's own numbers attached.
    if (!empty($psi['opportunities'])) {
        $lines = [];
        foreach ($psi['opportunities'] as $o) {
            $lines[] = $o['title'] . ' — saves about ' . round($o['savings_ms'] / 1000, 1) . 's';
        }
        $total = 0;
        foreach ($psi['opportunities'] as $o) $total += $o['savings_ms'];

        $out[] = au_issue('psi_opportunities', 'speed', 5,
            $total > 2000 ? 'fail' : 'warn',
            'Specific speed fixes Google identified',
            'Google measured how much time each of these would save on this exact page. Together they account for roughly ' . round($total / 1000, 1) . ' seconds.',
            implode("\n", $lines),
            count($psi['opportunities']) . ' opportunities found');
    }

    return $out;
}

// ── Response ─────────────────────────────────────────────────────────────────

/**
 * The speed half of the public view. Same gate as run.php: the metric numbers
 * are free (the client can read them off PageSpeed anyway), the interpretation
 * and the fixes are not.
 */
function au_speed_view(array $r) {
    $problems = au_rank_problems($r['issues']);

    // Always the gated split, unlocked or not. The full findings are emailed and
    // never rendered, so handing them to the page here would put every fix one
    // devtools panel away for anyone who submitted the form.
    $free = array_slice($problems, 0, 3);
    $rest = array_slice($problems, 3);

    return [
        'ok'          => true,
        'speed_state' => $r['speed_state'],
        'speed'       => $r['speed'],
        'overall'     => $r['overall'],
        'categories'  => $r['categories'],
        'free'        => array_map(function ($i) {
            return [
                'id' => $i['id'], 'cat' => $i['cat'], 'state' => $i['state'],
                'title' => $i['title'], 'impact' => $i['impact'],
                'detail' => $i['detail'], 'evidence' => $i['evidence'],
            ];
        }, $free),
        'locked' => array_map(function ($i) {
            return ['id' => $i['id'], 'cat' => $i['cat'], 'state' => $i['state'], 'title' => $i['title']];
        }, $rest),
        'locked_count' => count($rest),
        'fail_count'   => count(array_filter($problems, function ($i) { return $i['state'] === 'fail'; })),
        'warn_count'   => count(array_filter($problems, function ($i) { return $i['state'] === 'warn'; })),
    ];
}
