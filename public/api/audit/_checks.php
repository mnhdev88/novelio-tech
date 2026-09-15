<?php
// ─────────────────────────────────────────────────────────────────────────────
// Free SEO Audit — the checks themselves.
//
// Every check returns the same shape, and the shape is what makes the gate work:
//
//   id       stable identifier, so a result cached yesterday still renders
//   cat      technical | onpage | content | local | speed
//   weight   how much it moves the category score (and what ranks it as a finding)
//   state    pass | warn | fail | na
//   title    what was checked — SHOWN FREE, it is the tease
//   impact   why it matters to the visitor's business — GATED
//   detail   how to fix it, specifically — GATED
//   evidence what we actually saw on the page — GATED
//
// The wording rule: `impact` and `detail` are what a consultant would say out
// loud. They are the thing worth an email address. If a check cannot say
// something specific and true about THIS site, it should return 'na' instead of
// padding the report — a lead magnet that lies is worse than no lead magnet.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_lib.php';

const AUDIT_CATEGORIES = [
    'technical' => 'Technical',
    'onpage'    => 'On-page',
    'content'   => 'Content',
    'speed'     => 'Speed',
    'local'     => 'Local',
];

function au_issue($id, $cat, $weight, $state, $title, $impact = '', $detail = '', $evidence = '') {
    return [
        'id' => $id, 'cat' => $cat, 'weight' => $weight, 'state' => $state,
        'title' => $title, 'impact' => $impact, 'detail' => $detail,
        'evidence' => au_clean($evidence, 300),
    ];
}

// ── HTML parsing ─────────────────────────────────────────────────────────────

/**
 * Parse fetched HTML into an XPath handle, or null if it is not markup at all.
 *
 * Real-world pages are full of malformed HTML; libxml's errors are suppressed on
 * purpose because a page that makes the parser complain is still a page we can
 * audit, and "your HTML has a stray tag" is not a finding anyone acts on.
 */
function au_dom($html) {
    if (!class_exists('DOMDocument') || trim($html) === '') return null;

    $prev = libxml_use_internal_errors(true);
    $doc = new DOMDocument();
    // The meta charset may be missing or lie; this prefix forces UTF-8 so that
    // accented copy does not come back as mojibake in the evidence lines.
    $ok = $doc->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NOWARNING | LIBXML_NOERROR);
    libxml_clear_errors();
    libxml_use_internal_errors($prev);

    if (!$ok) return null;
    return new DOMXPath($doc);
}

/** First node's trimmed text content, or ''. */
function au_text(DOMXPath $x, $query) {
    $n = $x->query($query);
    if (!$n || $n->length === 0) return '';
    return au_clean($n->item(0)->textContent, 500);
}

/** First node's attribute value, or ''. */
function au_attr(DOMXPath $x, $query, $attr) {
    $n = $x->query($query);
    if (!$n || $n->length === 0) return '';
    return au_clean($n->item(0)->getAttribute($attr), 500);
}

function au_count(DOMXPath $x, $query) {
    $n = $x->query($query);
    return $n ? $n->length : 0;
}

/** A meta tag by name or property, case-insensitively. */
function au_meta(DOMXPath $x, $name) {
    $lower = strtolower($name);
    $q = "//meta[translate(@name,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='$lower']"
       . "|//meta[translate(@property,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')='$lower']";
    return au_attr($x, $q, 'content');
}

/**
 * Visible body text, with script and style contents excluded.
 *
 * This selects the text nodes to keep rather than deleting the nodes to drop.
 * Removing <script> elements from the document would be simpler, but every
 * check that runs afterwards shares this same DOM — and stripping the scripts
 * takes the JSON-LD with them, so the schema checks would report "no structured
 * data" on every site that has it.
 *
 * Memoised per document: several checks want the text and walking it is the
 * most expensive thing in the pass.
 */
function au_body_text(DOMXPath $x) {
    static $cache = null;
    $key = spl_object_hash($x);
    if ($cache !== null && isset($cache[$key])) return $cache[$key];
    if ($cache === null) $cache = [];

    $nodes = $x->query(
        '//body//text()[not(ancestor::script) and not(ancestor::style)'
        . ' and not(ancestor::noscript) and not(ancestor::svg) and not(ancestor::template)]'
    );

    $parts = [];
    if ($nodes) {
        foreach ($nodes as $n) {
            $t = trim($n->nodeValue);
            if ($t !== '') $parts[] = $t;
        }
    }

    $cache[$key] = trim(preg_replace('/\s+/u', ' ', implode(' ', $parts)));
    return $cache[$key];
}

/**
 * Is this link host the same site? Treats www and the bare domain as one, and
 * counts subdomains as internal. Written with strpos rather than
 * str_ends_with so the file runs on PHP 7 hosts as well as 8.
 */
function au_same_site($linkHost, $siteHost) {
    $a = preg_replace('/^www\./', '', strtolower($linkHost));
    $b = preg_replace('/^www\./', '', strtolower($siteHost));
    if ($a === $b) return true;
    $suffix = '.' . $b;
    return strlen($a) > strlen($suffix) && substr($a, -strlen($suffix)) === $suffix;
}

function au_word_count($text) {
    if ($text === '') return 0;
    // Counts CJK characters as words too — a 900-character Japanese page is not
    // "thin content", and a naive space-split would call it 3 words.
    $cjk = preg_match_all('/[\x{4E00}-\x{9FFF}\x{3040}-\x{30FF}]/u', $text);
    $latin = str_word_count(preg_replace('/[^\p{Latin}\p{N}\s]/u', ' ', $text));
    return (int) ($latin + $cjk);
}

// ── Every JSON-LD block on the page, flattened ───────────────────────────────

function au_schema_types(DOMXPath $x) {
    $types = [];
    foreach ($x->query('//script[@type="application/ld+json"]') as $node) {
        $data = json_decode(trim($node->textContent), true);
        if (!is_array($data)) continue;
        au_collect_types($data, $types);
    }
    // Microdata is rarer but still valid, and plenty of older SMB sites use it.
    foreach ($x->query('//*[@itemtype]') as $node) {
        $t = $node->getAttribute('itemtype');
        if (preg_match('#schema\.org/(\w+)#i', $t, $m)) $types[] = $m[1];
    }
    return array_values(array_unique($types));
}

function au_collect_types($node, array &$types) {
    if (!is_array($node)) return;
    // @graph, arrays of entities and nested @type values all end up here.
    if (isset($node['@type'])) {
        foreach ((array) $node['@type'] as $t) {
            if (is_string($t)) $types[] = $t;
        }
    }
    foreach ($node as $v) {
        if (is_array($v)) au_collect_types($v, $types);
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// The checks
// ═════════════════════════════════════════════════════════════════════════════

/**
 * $page  result of au_fetch() on the URL being audited
 * $ctx   ['origin','host','robots'=>?string,'sitemap_ok'=>bool,'http_redirects'=>bool|null]
 */
function au_run_checks(array $page, array $ctx) {
    $x = au_dom($page['body']);
    if ($x === null) {
        return [au_issue(
            'unparseable', 'technical', 10, 'fail',
            'The page did not return readable HTML',
            'Search engines read the same response we just did. If it is not HTML, there is nothing for Google to index — the page effectively does not exist in search.',
            'Check that the URL returns a normal HTML page to visitors who are not signed in, and that it is not behind a firewall, a bot filter, or a "coming soon" placeholder that blocks everything except a browser.'
        )];
    }

    $issues = array_merge(
        au_check_onpage($x, $page, $ctx),
        au_check_technical($x, $page, $ctx),
        au_check_content($x, $page, $ctx),
        au_check_local($x, $page, $ctx)
    );

    return $issues;
}

// ── On-page ──────────────────────────────────────────────────────────────────

function au_check_onpage(DOMXPath $x, array $page, array $ctx) {
    $out = [];

    // Title
    $title = au_text($x, '//title');
    $len = mb_strlen($title);
    if ($title === '') {
        $out[] = au_issue('title', 'onpage', 10, 'fail',
            'Page title',
            'The title tag is the blue line people click in Google. With none set, Google invents one from your page — usually your domain name or a stray heading, which reads as untrustworthy and gets clicked far less.',
            'Add a <title> of 50–60 characters that leads with what the page offers and ends with your brand: "Emergency Plumbing in Newark, NJ | YourBrand". One title per page, never repeated across pages.');
    } elseif ($len < 30) {
        $out[] = au_issue('title', 'onpage', 10, 'warn',
            'Page title',
            'Your title is shorter than Google will display, so you are giving away free space on the one line that decides whether someone clicks you or the result below you.',
            'Expand it toward 50–60 characters. Add the service, the location you serve, or the outcome — whatever a buyer would actually type.',
            "Current title ($len characters): $title");
    } elseif ($len > 65) {
        $out[] = au_issue('title', 'onpage', 10, 'warn',
            'Page title',
            'Your title is long enough that Google cuts it off mid-sentence in results. Whatever you put at the end — often the brand name or the offer — is the part being lost.',
            'Trim to 50–60 characters and move the important words to the front. Everything after roughly 60 characters is truncated with an ellipsis.',
            "Current title ($len characters): $title");
    } else {
        $out[] = au_issue('title', 'onpage', 10, 'pass', 'Page title', '', '', $title);
    }

    // Meta description
    $desc = au_meta($x, 'description');
    $dlen = mb_strlen($desc);
    if ($desc === '') {
        $out[] = au_issue('meta_description', 'onpage', 8, 'fail',
            'Meta description',
            'Without a description, Google scrapes a random sentence from the page to sit under your link. It is often a cookie notice or a navigation label — and it is the only sales pitch a searcher sees before deciding.',
            'Add a meta description of 140–155 characters that names the benefit and ends with an instruction ("Call for a same-day quote"). It does not affect rankings directly; it affects how many people click, which does.');
    } elseif ($dlen < 70) {
        $out[] = au_issue('meta_description', 'onpage', 8, 'warn',
            'Meta description',
            'The description is too short to make a case for clicking. Google gives you roughly 155 characters of free advertising per result and you are using a fraction of it.',
            'Rewrite to 140–155 characters: what you do, who for, where, and what to do next.',
            "Current description ($dlen characters): $desc");
    } elseif ($dlen > 165) {
        $out[] = au_issue('meta_description', 'onpage', 8, 'warn',
            'Meta description',
            'The description gets truncated in results, so the end of your pitch — usually the call to action — never reaches the searcher.',
            'Trim to 140–155 characters and put the call to action before the cut-off point.',
            "Current description ($dlen characters): $desc");
    } else {
        $out[] = au_issue('meta_description', 'onpage', 8, 'pass', 'Meta description', '', '', $desc);
    }

    // H1
    $h1Count = au_count($x, '//h1');
    $h1 = au_text($x, '//h1');
    if ($h1Count === 0) {
        $out[] = au_issue('h1', 'onpage', 8, 'fail',
            'Main heading (H1)',
            'The H1 tells both the visitor and Google what this page is about in one line. With none, Google has to guess the topic of the page from fragments — and guesses are what put you on page four.',
            'Add exactly one <h1> near the top containing the page\'s main keyword phrase in plain language. It is usually the same promise as the title, written for a human rather than for a search result.');
    } elseif ($h1Count > 1) {
        $out[] = au_issue('h1', 'onpage', 8, 'warn',
            'Main heading (H1)',
            "The page has $h1Count H1 headings. When everything is the main point, nothing is — Google has to pick which one describes the page, and it often picks the wrong one.",
            'Keep one H1 for the page topic and demote the rest to H2. This is usually caused by a theme that wraps the logo or a slider caption in an H1 — check those first.',
            "First H1: $h1");
    } else {
        $out[] = au_issue('h1', 'onpage', 8, 'pass', 'Main heading (H1)', '', '', $h1);
    }

    // Subheadings
    $h2 = au_count($x, '//h2');
    if ($h2 === 0) {
        $out[] = au_issue('subheadings', 'onpage', 4, 'warn',
            'Subheadings',
            'The page runs as one unbroken block. Visitors scan before they read, and a page with nothing to scan gets abandoned — which Google notices.',
            'Break the page into sections with H2 headings that answer the questions a buyer actually asks: what it costs, how long it takes, who it is for, what happens next.');
    } else {
        $out[] = au_issue('subheadings', 'onpage', 4, 'pass', 'Subheadings', '', '', "$h2 H2 headings");
    }

    // Canonical
    $canonical = au_attr($x, '//link[@rel="canonical"]', 'href');
    if ($canonical === '') {
        $out[] = au_issue('canonical', 'onpage', 5, 'warn',
            'Canonical tag',
            'Without a canonical, the same page reachable at several addresses (with and without www, with tracking parameters, with a trailing slash) can be treated as several competing pages. Your ranking strength gets split between them instead of pooling on one.',
            'Add <link rel="canonical" href="..."> pointing at the single preferred address of this page, using the absolute URL including https:// and the www or non-www form you have standardised on.');
    } else {
        $out[] = au_issue('canonical', 'onpage', 5, 'pass', 'Canonical tag', '', '', $canonical);
    }

    // Social preview tags
    $ogTitle = au_meta($x, 'og:title');
    $ogDesc  = au_meta($x, 'og:description');
    $ogImage = au_meta($x, 'og:image');
    $missing = [];
    if ($ogTitle === '') $missing[] = 'og:title';
    if ($ogDesc === '')  $missing[] = 'og:description';
    if ($ogImage === '') $missing[] = 'og:image';

    if (count($missing) === 3) {
        $out[] = au_issue('social_tags', 'onpage', 4, 'fail',
            'Social sharing preview',
            'When anyone shares your link on WhatsApp, LinkedIn or Facebook it appears as a bare URL with no image. Posts with a preview card get several times the clicks of ones without — this is free reach you are not collecting.',
            'Add Open Graph tags to every page: og:title, og:description and og:image. The image should be 1200x630px and must be an absolute URL (https://yoursite.com/image.jpg, not /image.jpg) or the networks will ignore it.');
    } elseif ($missing) {
        $out[] = au_issue('social_tags', 'onpage', 4, 'warn',
            'Social sharing preview',
            'Part of the sharing card is missing, so shared links render incomplete — most often with no image, which is the part that earns the click.',
            'Add the missing tags: ' . implode(', ', $missing) . '. Test the result with Facebook\'s Sharing Debugger, which also clears their cached copy of the old preview.',
            'Missing: ' . implode(', ', $missing));
    } else {
        $out[] = au_issue('social_tags', 'onpage', 4, 'pass', 'Social sharing preview', '', '', 'og:title, og:description and og:image all present');
    }

    // Image alt text
    $imgs = au_count($x, '//img');
    if ($imgs === 0) {
        $out[] = au_issue('image_alt', 'onpage', 6, 'na', 'Image alt text');
    } else {
        $withAlt = au_count($x, '//img[@alt and string-length(normalize-space(@alt))>0]');
        $pct = (int) round(100 * $withAlt / $imgs);
        $ev = "$withAlt of $imgs images have alt text ($pct%)";
        if ($pct < 50) {
            $out[] = au_issue('image_alt', 'onpage', 6, 'fail',
                'Image alt text',
                "Most images on this page ($imgs found, $withAlt described) are invisible to Google and to screen readers. You lose Google Images traffic, and in several countries inaccessible images are a legal exposure, not just an SEO one.",
                'Describe each meaningful image in its alt attribute — what it shows, not a keyword list ("Technician replacing a water heater in a Newark basement"). Purely decorative images should have alt="" so screen readers skip them.',
                $ev);
        } elseif ($pct < 90) {
            $out[] = au_issue('image_alt', 'onpage', 6, 'warn',
                'Image alt text',
                'Some images are still undescribed, so they cannot appear in image search and screen readers announce them as "image".',
                'Fill in the remaining alt attributes. In WordPress this is the "Alt text" field in the media library; setting it there fixes every page that uses the image.',
                $ev);
        } else {
            $out[] = au_issue('image_alt', 'onpage', 6, 'pass', 'Image alt text', '', '', $ev);
        }
    }

    return $out;
}

// ── Technical ────────────────────────────────────────────────────────────────

function au_check_technical(DOMXPath $x, array $page, array $ctx) {
    $out = [];
    $headers = $page['headers'] ?? [];
    $isHttps = strpos((string) ($page['final_url'] ?? ''), 'https://') === 0;

    // Indexability comes first — it can invalidate everything else on the page.
    $robotsMeta = strtolower(au_meta($x, 'robots'));
    $xRobots    = strtolower((string) ($headers['x-robots-tag'] ?? ''));
    if (strpos($robotsMeta, 'noindex') !== false || strpos($xRobots, 'noindex') !== false) {
        $out[] = au_issue('noindex', 'technical', 12, 'fail',
            'Page is blocked from Google',
            'This page carries a "noindex" instruction, which tells Google to keep it out of search entirely. Nothing else in this report matters until that is removed — the page cannot rank at any position, for any term.',
            'Remove the noindex directive. It is usually left behind from a staging site: in WordPress, Settings -> Reading -> "Discourage search engines from indexing this site" is the usual culprit; in an SEO plugin, check the per-page indexing setting. Then request re-indexing in Google Search Console.',
            $robotsMeta !== '' ? "meta robots: $robotsMeta" : "X-Robots-Tag: $xRobots");
    } else {
        $out[] = au_issue('noindex', 'technical', 12, 'pass', 'Page is indexable by Google');
    }

    // HTTPS
    if (!$isHttps) {
        $out[] = au_issue('https', 'technical', 10, 'fail',
            'Secure connection (HTTPS)',
            'The site serves over plain HTTP, so Chrome shows visitors a "Not secure" warning in the address bar. On a page that asks for a phone number or a payment, that warning is the end of the enquiry. HTTPS is also a confirmed ranking signal.',
            'Install an SSL certificate — on Hostinger, cPanel and most hosts this is free and takes minutes — then force every HTTP request to redirect to HTTPS, and update internal links and images to https:// so the page does not load mixed content.');
    } else {
        $out[] = au_issue('https', 'technical', 10, 'pass', 'Secure connection (HTTPS)');
    }

    // http:// -> https:// redirect
    if ($isHttps && array_key_exists('http_redirects', $ctx) && $ctx['http_redirects'] !== null) {
        if ($ctx['http_redirects']) {
            $out[] = au_issue('https_redirect', 'technical', 5, 'pass', 'HTTP redirects to HTTPS');
        } else {
            $out[] = au_issue('https_redirect', 'technical', 5, 'fail',
                'HTTP redirects to HTTPS',
                'The insecure http:// version of the site still loads instead of redirecting. Google treats it as a separate duplicate site, so your ranking strength is split across two copies, and anyone with an old bookmark stays on the insecure one.',
                'Add a permanent 301 redirect from http:// to https:// for every URL. On Apache/Hostinger this is a rewrite rule in .htaccess; most hosts also expose it as a "Force HTTPS" toggle in the control panel.');
        }
    }

    // Mobile viewport
    $viewport = au_meta($x, 'viewport');
    if ($viewport === '') {
        $out[] = au_issue('viewport', 'technical', 8, 'fail',
            'Mobile viewport',
            'The page has no viewport tag, so phones render it at desktop width and zoom out — text becomes unreadable and buttons unpressable. Google indexes the mobile version of your site first, so this is how it judges you.',
            'Add <meta name="viewport" content="width=device-width, initial-scale=1"> inside <head>. If the layout then breaks on a phone, that breakage was always there — it was just hidden behind the zoom.');
    } else {
        $out[] = au_issue('viewport', 'technical', 8, 'pass', 'Mobile viewport', '', '', $viewport);
    }

    // robots.txt
    if (($ctx['robots_ok'] ?? false)) {
        $out[] = au_issue('robots_txt', 'technical', 4, 'pass', 'robots.txt file');
    } else {
        $out[] = au_issue('robots_txt', 'technical', 4, 'warn',
            'robots.txt file',
            'There is no robots.txt at the root of the domain. Nothing breaks without one, but you lose the standard place to point crawlers at your sitemap, and every crawler logs a 404 on each visit.',
            'Create /robots.txt with at minimum a "Sitemap: https://yourdomain.com/sitemap.xml" line. Be careful: a stray "Disallow: /" in this file removes the entire site from Google.');
    }

    // Sitemap
    if (($ctx['sitemap_ok'] ?? false)) {
        $out[] = au_issue('sitemap', 'technical', 6, 'pass', 'XML sitemap', '', '', (string) ($ctx['sitemap_url'] ?? ''));
    } else {
        $out[] = au_issue('sitemap', 'technical', 6, 'fail',
            'XML sitemap',
            'No XML sitemap was found. Google discovers pages by following links, so anything not linked from your menu — service pages, location pages, older posts — may never be found at all.',
            'Generate a sitemap listing every page you want indexed, publish it at /sitemap.xml, reference it from robots.txt, and submit it in Google Search Console. Most CMSs produce one automatically once the right plugin or setting is enabled.');
    }

    // Structured data
    $types = au_schema_types($x);
    if (!$types) {
        $out[] = au_issue('schema', 'technical', 7, 'fail',
            'Structured data (schema markup)',
            'The page has no schema markup, so Google reads it as undifferentiated text. Schema is what produces star ratings, FAQ dropdowns, prices and opening hours in search results — the listings that take up three times the space and pull the clicks away from plain ones. It is also how AI assistants decide what your business actually is.',
            'Add JSON-LD markup for what this page really is: Organization or LocalBusiness on the homepage, Service on service pages, FAQPage wherever you answer questions, Product where you sell. Validate it at search.google.com/test/rich-results before publishing.');
    } else {
        $out[] = au_issue('schema', 'technical', 7, 'pass', 'Structured data (schema markup)', '', '', implode(', ', array_slice($types, 0, 8)));
    }

    // Language
    $lang = au_attr($x, '//html', 'lang');
    if ($lang === '') {
        $out[] = au_issue('lang', 'technical', 3, 'warn',
            'Declared page language',
            'The <html> tag does not declare a language. Google uses it to decide which country and language results to show your page in, and screen readers use it to pick a pronunciation.',
            'Set it on the <html> tag — lang="en-US" for United States English, lang="en-IN" for India. One attribute, one line.');
    } else {
        $out[] = au_issue('lang', 'technical', 3, 'pass', 'Declared page language', '', '', $lang);
    }

    // Favicon
    $favicon = au_count($x, '//link[contains(translate(@rel,"ICON","icon"),"icon")]');
    if ($favicon === 0) {
        $out[] = au_issue('favicon', 'technical', 2, 'warn',
            'Favicon',
            'No favicon is declared. Google shows one next to your result on mobile, and without it you get a generic globe while every competitor around you shows a logo.',
            'Add a 512x512 PNG or an .ico at the site root and link it with <link rel="icon">. It must be reachable by Googlebot, which means not blocked in robots.txt.');
    } else {
        $out[] = au_issue('favicon', 'technical', 2, 'pass', 'Favicon');
    }

    // Security headers
    $sec = [];
    if (!isset($headers['strict-transport-security'])) $sec[] = 'Strict-Transport-Security';
    if (!isset($headers['x-content-type-options']))    $sec[] = 'X-Content-Type-Options';
    if ($sec) {
        $out[] = au_issue('security_headers', 'technical', 3, 'warn',
            'Security headers',
            'Standard protective headers are missing. They are not a ranking factor, but they are the first thing an enterprise client\'s IT team checks before signing with a supplier, and they close off real attacks.',
            'Add ' . implode(' and ', $sec) . ' to your server configuration. On Apache this is two Header directives in .htaccess; enable HSTS only once HTTPS is working everywhere, because it is hard to reverse.',
            'Missing: ' . implode(', ', $sec));
    } else {
        $out[] = au_issue('security_headers', 'technical', 3, 'pass', 'Security headers');
    }

    // Compression
    $enc = strtolower((string) ($headers['content-encoding'] ?? ''));
    if ($enc === '') {
        $out[] = au_issue('compression', 'technical', 4, 'warn',
            'Text compression',
            'The server sends HTML uncompressed. Compression typically cuts page weight by 60–80% for free, and page weight is what visitors on mobile data actually feel.',
            'Enable gzip or Brotli compression for HTML, CSS and JavaScript. Most hosts have a switch for it; on Apache it is mod_deflate, and any CDN does it by default.');
    } else {
        $out[] = au_issue('compression', 'technical', 4, 'pass', 'Text compression', '', '', $enc);
    }

    // Server response time, measured on our own request
    $ms = (int) ($page['ms'] ?? 0);
    if ($ms > 0) {
        if ($ms > 1500) {
            $out[] = au_issue('ttfb', 'technical', 5, 'fail',
                'Server response time',
                "The server took {$ms}ms to return the page. That delay happens before a single pixel can be drawn, so it is added to every other speed problem the site has. Above roughly 1.5 seconds, visitors on mobile begin leaving before anything appears.",
                'The usual causes, in order of how often they turn out to be it: shared hosting that is oversold, no page caching, a bloated theme or plugin stack, and an unindexed database. Turn on full-page caching first — it is the cheapest large win — then look at the host.',
                "{$ms}ms");
        } elseif ($ms > 800) {
            $out[] = au_issue('ttfb', 'technical', 5, 'warn',
                'Server response time',
                "The server took {$ms}ms to respond. It is workable but it is a head start you are giving to faster competitors on every single visit.",
                'Enable full-page caching and a CDN. Both are usually a toggle rather than a project, and together they normally bring this under 400ms.',
                "{$ms}ms");
        } else {
            $out[] = au_issue('ttfb', 'technical', 5, 'pass', 'Server response time', '', '', "{$ms}ms");
        }
    }

    return $out;
}

// ── Content ──────────────────────────────────────────────────────────────────

function au_check_content(DOMXPath $x, array $page, array $ctx) {
    $out = [];
    $text = au_body_text($x);
    $words = au_word_count($text);

    if ($words < 150) {
        $out[] = au_issue('word_count', 'content', 9, 'fail',
            'Amount of content',
            "This page has roughly $words words. Google has nothing to judge relevance from, so it will rank pages that answer the question more fully — even when those businesses are worse than yours at the actual work.",
            'Aim for 600–1,000 words on a service or landing page, written around what buyers ask before they commit: what it costs, how long it takes, what is included, what happens if it goes wrong, and proof you have done it before. Length is not the goal; covering the question is, and that usually runs about that long.',
            "$words words");
    } elseif ($words < 400) {
        $out[] = au_issue('word_count', 'content', 9, 'warn',
            'Amount of content',
            "At roughly $words words the page is thin for a commercial term. It can rank for your brand name, but not against a competitor who answers the buyer's questions properly.",
            'Add the sections buyers look for and do not find: pricing or a price range, the process step by step, an FAQ, and specific local proof. Each of those also earns its own long-tail searches.',
            "$words words");
    } else {
        $out[] = au_issue('word_count', 'content', 9, 'pass', 'Amount of content', '', '', "$words words");
    }

    // Internal linking
    $host = $ctx['host'] ?? '';
    $internal = 0; $external = 0;
    foreach ($x->query('//a[@href]') as $a) {
        $href = trim($a->getAttribute('href'));
        if ($href === '' || $href[0] === '#') continue;
        if (stripos($href, 'mailto:') === 0 || stripos($href, 'tel:') === 0) continue;

        if (preg_match('#^https?://#i', $href)) {
            $h = strtolower((string) @parse_url($href, PHP_URL_HOST));
            if ($h !== '' && au_same_site($h, $host)) $internal++;
            else $external++;
        } else {
            $internal++;
        }
    }

    if ($internal < 5) {
        $out[] = au_issue('internal_links', 'content', 6, 'fail',
            'Internal links',
            "Only $internal links point to other pages on this site. Internal links are how ranking strength moves between your pages and how Google discovers the rest of them — a page with almost none is a dead end for both crawlers and buyers.",
            'Add 5–15 contextual links from inside the copy to your related services, your location pages and your strongest posts. Use descriptive link text ("emergency drain cleaning in Newark"), never "click here" — the words in the link are what tell Google what the destination is about.',
            "$internal internal links");
    } elseif ($internal < 12) {
        $out[] = au_issue('internal_links', 'content', 6, 'warn',
            'Internal links',
            "There are $internal internal links, mostly navigation. Links written into the body copy carry considerably more weight than menu links, and this page has few of them.",
            'Work 5–10 in-content links into the copy where they genuinely help the reader choose the next step.',
            "$internal internal links");
    } else {
        $out[] = au_issue('internal_links', 'content', 6, 'pass', 'Internal links', '', '', "$internal internal links");
    }

    if ($external === 0 && $words >= 400) {
        $out[] = au_issue('external_links', 'content', 2, 'warn',
            'Outbound citations',
            'The page cites no external sources. Linking out to standards bodies, manufacturers or research is a trust signal for both Google and the reader, and it costs you nothing.',
            'Where you make a factual claim — a regulation, a spec, a statistic — link to the authoritative source. Two or three per page is plenty.');
    } elseif ($external > 0) {
        $out[] = au_issue('external_links', 'content', 2, 'pass', 'Outbound citations', '', '', "$external outbound links");
    }

    // Does the page actually contain the words its title promises?
    $title = au_text($x, '//title');
    if ($title !== '' && $words >= 150) {
        $stop = ['the','and','for','with','your','you','our','are','from','that','this','have','how','why','what','best','top','a','an','of','in','to','is','on','at','by','or'];
        $terms = array_filter(preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($title)), function ($w) use ($stop) {
            return mb_strlen($w) > 3 && !in_array($w, $stop, true);
        });
        $terms = array_slice(array_values(array_unique($terms)), 0, 6);
        $lowerText = mb_strtolower($text);
        $missing = array_values(array_filter($terms, function ($t) use ($lowerText) {
            return mb_strpos($lowerText, $t) === false;
        }));

        if ($terms && count($missing) > count($terms) / 2) {
            $out[] = au_issue('title_body_match', 'content', 5, 'warn',
                'Title matches the page content',
                'The main words in your title barely appear in the page itself. Google cross-checks the two: a title promising something the copy does not deliver reads as a mismatch, and mismatched pages get demoted.',
                'Either rewrite the body so it genuinely covers what the title promises, or change the title to describe what the page actually says. The first is usually the right answer.',
                'Title terms not found in the copy: ' . implode(', ', $missing));
        } else {
            $out[] = au_issue('title_body_match', 'content', 5, 'pass', 'Title matches the page content');
        }
    }

    return $out;
}

// ── Local ────────────────────────────────────────────────────────────────────
// Every Novelio client is an SMB selling to a place, so these are scored for
// everyone rather than hidden behind a "is this a local business?" guess.

function au_check_local(DOMXPath $x, array $page, array $ctx) {
    $out = [];
    $text = au_body_text($x);
    $types = array_map('strtolower', au_schema_types($x));

    // Phone number
    $telLinks = au_count($x, '//a[starts-with(translate(@href,"TEL","tel"),"tel:")]');
    $hasPhoneText = (bool) preg_match('/(\+?\d[\d\s().-]{7,}\d)/', $text);

    if ($telLinks === 0 && !$hasPhoneText) {
        $out[] = au_issue('phone', 'local', 7, 'fail',
            'Phone number on the page',
            'No phone number was found. For a local business this is the single most expensive omission on the list — most mobile searchers who intend to buy want to call, and a page without a number sends them back to the results to call somebody else.',
            'Put the number in the header on every page, and make it a real tel: link so that tapping it dials. Use exactly the same number and format as your Google Business Profile — a mismatch weakens both.');
    } elseif ($telLinks === 0) {
        $out[] = au_issue('phone', 'local', 7, 'warn',
            'Phone number on the page',
            'A phone number appears as plain text, so a visitor on a phone cannot tap to call it. Every extra step between intent and a ringing phone loses a share of enquiries.',
            'Wrap it in a tel: link: <a href="tel:+19735550123">(973) 555-0123</a>. Keep the digits in the href in full international form.');
    } else {
        $out[] = au_issue('phone', 'local', 7, 'pass', 'Phone number on the page', '', '', "$telLinks tap-to-call link(s)");
    }

    // LocalBusiness / Organization schema
    $hasLocal = false;
    foreach ($types as $t) {
        if ($t === 'localbusiness' || $t === 'organization' || strpos($t, 'business') !== false
            || in_array($t, ['restaurant','store','professionalservice','homeandconstructionbusiness','medicalbusiness','legalservice','dentist','autorepair'], true)) {
            $hasLocal = true; break;
        }
    }
    if (!$hasLocal) {
        $out[] = au_issue('local_schema', 'local', 7, 'fail',
            'Business schema markup',
            'There is no LocalBusiness or Organization markup, so Google has to infer your name, address, hours and service area from ordinary text. That inference is what decides whether you appear in the map pack — the three results above everything else — and it is the main way AI assistants learn a business exists at all.',
            'Add LocalBusiness JSON-LD on the homepage with name, address, phone, opening hours, geo coordinates, service area and a sameAs link to your Google Business Profile. Use the most specific type that fits (Plumber, Dentist, Restaurant) rather than the generic one.');
    } else {
        $out[] = au_issue('local_schema', 'local', 7, 'pass', 'Business schema markup');
    }

    // Address / NAP
    $hasAddressSchema = false;
    foreach ($x->query('//script[@type="application/ld+json"]') as $node) {
        if (stripos($node->textContent, 'postalcode') !== false || stripos($node->textContent, 'streetaddress') !== false) {
            $hasAddressSchema = true; break;
        }
    }
    $hasAddressText = (bool) preg_match('/\b\d{5}(-\d{4})?\b|\b\d{6}\b|\b[A-Z]{2}\s+\d{5}\b/', $text);

    if (!$hasAddressSchema && !$hasAddressText) {
        $out[] = au_issue('address', 'local', 5, 'warn',
            'Business address',
            'No address is visible on the page. Consistent name, address and phone details across your site, your Google profile and directory listings are what convince Google the business is real and located where it claims.',
            'Put the full address in the footer of every page, character for character identical to your Google Business Profile. If you travel to customers rather than receive them, state the service area instead — hiding the location entirely is what hurts.');
    } else {
        $out[] = au_issue('address', 'local', 5, 'pass', 'Business address');
    }

    // Map embed
    $map = au_count($x, '//iframe[contains(@src,"google.com/maps") or contains(@src,"maps.google")]');
    if ($map === 0) {
        $out[] = au_issue('map_embed', 'local', 3, 'warn',
            'Map on the page',
            'There is no embedded map. It is a small signal for search, but a large one for a visitor deciding whether you are near enough to bother calling.',
            'Embed a Google map centred on your business on the contact page, and lazy-load it so it does not slow the page down.');
    } else {
        $out[] = au_issue('map_embed', 'local', 3, 'pass', 'Map on the page');
    }

    return $out;
}

// ── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Category scores and an overall score, from the weighted proportion of checks
 * that passed. A warn counts as half a pass; 'na' checks are excluded entirely
 * rather than counted as failures — a page with no images should not be marked
 * down for having no alt text.
 */
function au_score(array $issues) {
    $byCat = [];
    foreach ($issues as $i) {
        if ($i['state'] === 'na') continue;
        $c = $i['cat'];
        if (!isset($byCat[$c])) $byCat[$c] = ['got' => 0.0, 'max' => 0.0, 'fail' => 0, 'warn' => 0, 'pass' => 0];
        $byCat[$c]['max'] += $i['weight'];
        $byCat[$c]['got'] += $i['weight'] * ($i['state'] === 'pass' ? 1.0 : ($i['state'] === 'warn' ? 0.5 : 0.0));
        $byCat[$c][$i['state']]++;
    }

    $categories = [];
    $got = 0.0; $max = 0.0;
    foreach (AUDIT_CATEGORIES as $key => $label) {
        if (!isset($byCat[$key])) continue;
        $c = $byCat[$key];
        $categories[] = [
            'key'   => $key,
            'label' => $label,
            'score' => $c['max'] > 0 ? (int) round(100 * $c['got'] / $c['max']) : 0,
            'pass'  => $c['pass'], 'warn' => $c['warn'], 'fail' => $c['fail'],
        ];
        $got += $c['got'];
        $max += $c['max'];
    }

    return [
        'overall'    => $max > 0 ? (int) round(100 * $got / $max) : 0,
        'categories' => $categories,
    ];
}

/**
 * Rank the problems worst-first: failures before warnings, heavier weights
 * before lighter ones. The top of this list is what gets shown free — the
 * gate is only persuasive if the free part is the part that stings.
 */
function au_rank_problems(array $issues) {
    $problems = array_values(array_filter($issues, function ($i) {
        return $i['state'] === 'fail' || $i['state'] === 'warn';
    }));

    usort($problems, function ($a, $b) {
        if ($a['state'] !== $b['state']) return $a['state'] === 'fail' ? -1 : 1;
        return $b['weight'] <=> $a['weight'];
    });

    return $problems;
}
