<?php
// ─────────────────────────────────────────────────────────────────────────────
// Admin panel — GitHub proxy.
//
// The PAT lives only here, server-side. The browser never sees it; the panel
// talks to our own endpoints, which call GitHub on its behalf.
//
// Publishing uses the Git Data API (blobs -> tree -> commit -> ref) rather than
// the simpler Contents API, because Contents can only write ONE file per commit.
// Every save the client made needs to land as a SINGLE commit, or each one would
// trigger its own deploy of the whole site.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_lib.php';

define('GH_API', 'https://api.github.com');

function gh_repo_path() { return '/repos/' . ADMIN_GH_OWNER . '/' . ADMIN_GH_REPO; }

/** rawurlencode each path segment but keep the slashes. */
function gh_encode_path($path) {
    return implode('/', array_map('rawurlencode', explode('/', $path)));
}

/** Raw GitHub REST call. Returns [httpCode, decodedBody]. */
function gh_http($method, $path, $body = null) {
    $ch = curl_init(GH_API . $path);
    $headers = [
        'Authorization: Bearer ' . ADMIN_GH_TOKEN,
        'Accept: application/vnd.github+json',
        'X-GitHub-Api-Version: 2022-11-28',
        // GitHub rejects requests without a User-Agent.
        'User-Agent: novelio-admin',
    ];
    if ($body !== null) $headers[] = 'Content-Type: application/json';

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 30,
    ]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));

    $raw = curl_exec($ch);
    if ($raw === false) {
        $err = curl_error($ch);
        curl_close($ch);
        @error_log('[admin] github curl error: ' . $err);
        a_fail('Could not reach GitHub. Your work is saved as a draft - try publishing again.', 502, 'github_unreachable');
    }
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, json_decode($raw, true)];
}

/** Fail with a readable message when GitHub says no. */
function gh_expect($code, $body, $okCodes, $what) {
    if (in_array($code, (array) $okCodes, true)) return $body;
    $msg = $body['message'] ?? 'unknown error';
    @error_log('[admin] github ' . $what . ' failed (' . $code . '): ' . json_encode($body));
    if ($code === 401 || $code === 403) {
        a_fail('GitHub rejected the access token. Check the PAT in the credentials file (it may have expired).', 502, 'github_auth');
    }
    a_fail('GitHub error while ' . $what . ': ' . $msg, 502, 'github_error');
}

// ── Reading ──────────────────────────────────────────────────────────────────

/**
 * Read one file from the deploy branch.
 * Returns ['content' => string, 'sha' => string] or null when it does not exist
 * yet (a brand-new blog post, for instance).
 */
function gh_read_file($path) {
    [$code, $body] = gh_http('GET', gh_repo_path() . '/contents/' . gh_encode_path($path) . '?ref=' . urlencode(ADMIN_GH_BRANCH));
    if ($code === 404) return null;
    gh_expect($code, $body, [200], 'reading ' . $path);

    // Files over 1 MB come back without inline content and need the blob API.
    if (($body['content'] ?? '') === '' && !empty($body['sha'])) {
        [$bc, $bb] = gh_http('GET', gh_repo_path() . '/git/blobs/' . $body['sha']);
        gh_expect($bc, $bb, [200], 'reading blob for ' . $path);
        return ['content' => base64_decode(str_replace("\n", '', $bb['content'] ?? '')), 'sha' => $body['sha']];
    }
    return [
        'content' => base64_decode(str_replace("\n", '', $body['content'] ?? '')),
        'sha'     => $body['sha'] ?? null,
    ];
}

/** List a directory on the deploy branch. Returns [] when it does not exist. */
function gh_list_dir($path) {
    [$code, $body] = gh_http('GET', gh_repo_path() . '/contents/' . gh_encode_path($path) . '?ref=' . urlencode(ADMIN_GH_BRANCH));
    if ($code === 404) return [];
    gh_expect($code, $body, [200], 'listing ' . $path);
    return is_array($body) ? $body : [];
}

// ── Writing ──────────────────────────────────────────────────────────────────

/**
 * Commit many files at once.
 *
 * $files: [ ['path' => 'content/x.json', 'content' => '...', 'binary' => false],
 *           ['path' => 'content/blog/old.json', 'delete' => true] ]
 *
 * Returns the new commit sha.
 */
function gh_commit(array $files, $message) {
    if (!$files) a_fail('Nothing to publish.', 400, 'nothing_to_publish');
    $repo = gh_repo_path();
    $branch = ADMIN_GH_BRANCH;

    // 1. Where the branch currently points.
    [$c, $ref] = gh_http('GET', $repo . '/git/ref/heads/' . rawurlencode($branch));
    gh_expect($c, $ref, [200], 'reading branch ' . $branch);
    $parentSha = $ref['object']['sha'];

    [$c, $parentCommit] = gh_http('GET', $repo . '/git/commits/' . $parentSha);
    gh_expect($c, $parentCommit, [200], 'reading head commit');
    $baseTree = $parentCommit['tree']['sha'];

    // 2. One blob per changed file. Deletions are expressed as a null sha in the
    //    tree, so they need no blob.
    $tree = [];
    foreach ($files as $f) {
        $path = a_safe_path($f['path']);

        if (!empty($f['delete'])) {
            $tree[] = ['path' => $path, 'mode' => '100644', 'type' => 'blob', 'sha' => null];
            continue;
        }

        $isBinary = !empty($f['binary']);
        [$c, $blob] = gh_http('POST', $repo . '/git/blobs', $isBinary
            ? ['content' => base64_encode($f['content']), 'encoding' => 'base64']
            : ['content' => $f['content'], 'encoding' => 'utf-8']);
        gh_expect($c, $blob, [201], 'uploading ' . $path);

        $tree[] = ['path' => $path, 'mode' => '100644', 'type' => 'blob', 'sha' => $blob['sha']];
    }

    // 3. Tree, 4. commit, 5. move the branch.
    [$c, $newTree] = gh_http('POST', $repo . '/git/trees', ['base_tree' => $baseTree, 'tree' => $tree]);
    gh_expect($c, $newTree, [201], 'building the commit tree');

    [$c, $commit] = gh_http('POST', $repo . '/git/commits', [
        'message' => $message,
        'tree'    => $newTree['sha'],
        'parents' => [$parentSha],
    ]);
    gh_expect($c, $commit, [201], 'creating the commit');

    // No force: if someone pushed between step 1 and now, GitHub rejects this and
    // the drafts stay put, so nothing is silently overwritten.
    [$c, $updated] = gh_http('PATCH', $repo . '/git/refs/heads/' . rawurlencode($branch), [
        'sha' => $commit['sha'], 'force' => false,
    ]);
    if ($c === 422) {
        a_fail('Someone else published while you were editing. Reopen the panel to pick up their changes, then publish again.', 409, 'branch_moved');
    }
    gh_expect($c, $updated, [200], 'updating ' . $branch);

    return $commit['sha'];
}

// ── Deploy status ────────────────────────────────────────────────────────────

/**
 * The Actions run for a commit, so the panel can show a real progress state
 * instead of asking the client to trust that something happened.
 * Returns null until GitHub has registered the run (a few seconds).
 */
function gh_run_for_commit($sha) {
    [$code, $body] = gh_http('GET', gh_repo_path() . '/actions/runs?per_page=20&branch=' . urlencode(ADMIN_GH_BRANCH));
    if ($code !== 200) return null;
    foreach (($body['workflow_runs'] ?? []) as $run) {
        if (($run['head_sha'] ?? '') === $sha) {
            return [
                'run_id'     => $run['id'],
                'status'     => $run['status'],       // queued | in_progress | completed
                'conclusion' => $run['conclusion'],   // success | failure | null
                'url'        => $run['html_url'],
                'started_at' => $run['run_started_at'] ?? null,
            ];
        }
    }
    return null;
}
