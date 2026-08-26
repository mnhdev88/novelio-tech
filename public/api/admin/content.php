<?php
// ─────────────────────────────────────────────────────────────────────────────
// Content read/save.
//
//   GET    ?path=content/settings.json   -> the file, draft version if one exists
//   GET    ?dir=content/blog             -> directory listing, drafts merged in
//   GET    ?pending=1                    -> everything waiting to be published
//   POST   { path, payload }             -> save a draft (no commit, no deploy)
//   DELETE ?path=...                     -> stage a deletion
//
// Nothing here touches git. Saving is deliberately cheap and instant; publish.php
// is what turns the accumulated drafts into a commit.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_github.php';

$method = a_method(['GET', 'POST', 'DELETE']);
$user = a_require($method === 'GET' ? 'content.read' : 'content.write');

// ── GET ──────────────────────────────────────────────────────────────────────
if ($method === 'GET') {

    // Everything with unpublished changes — drives the "N pending changes" badge.
    if (isset($_GET['pending'])) {
        // Resolve editor names here rather than storing them on the draft: a
        // renamed account should show its current name, not the one it had when
        // the edit was made.
        $names = [];
        foreach (a_users() as $u) $names[(string) $u['id']] = $u['name'];

        $rows = [];
        foreach (draft_all() as $d) {
            $rows[] = [
                'path'            => $d['path'],
                'deleted'         => !empty($d['deleted']),
                'updated_at'      => $d['updated_at'] ?? null,
                'updated_by_name' => $names[(string) ($d['updated_by'] ?? '')] ?? null,
            ];
        }
        // Newest first, matching what the publish bar expects.
        $rows = array_reverse($rows);
        a_respond(['pending' => $rows]);
    }

    // Directory listing with drafts folded in, so a post created but not yet
    // published still shows up in the panel's list.
    if (isset($_GET['dir'])) {
        $dir = a_safe_path(rtrim((string) $_GET['dir'], '/'));
        $items = [];
        foreach (gh_list_dir($dir) as $entry) {
            if (($entry['type'] ?? '') !== 'file') continue;
            $items[$entry['path']] = [
                'path' => $entry['path'], 'name' => $entry['name'],
                'size' => $entry['size'] ?? 0, 'sha' => $entry['sha'] ?? null,
                'state' => 'published',
            ];
        }
        $drafts = array_filter(draft_all(), function ($d) use ($dir) {
            return strncmp($d['path'], $dir . '/', strlen($dir) + 1) === 0;
        });
        foreach ($drafts as $d) {
            // A draft one level deeper than $dir is a different listing's problem.
            if (substr_count(substr($d['path'], strlen($dir) + 1), '/') > 0) continue;
            $items[$d['path']] = array_merge(
                $items[$d['path']] ?? ['path' => $d['path'], 'name' => basename($d['path']), 'size' => 0, 'sha' => null],
                ['state' => $d['deleted'] ? 'deleted' : (isset($items[$d['path']]) ? 'edited' : 'new')]
            );
        }
        a_respond(['dir' => $dir, 'items' => array_values($items)]);
    }

    // A single file: draft wins over the published version.
    $path = a_safe_path($_GET['path'] ?? '');
    $draft = draft_get($path);

    if ($draft && empty($draft['deleted'])) {
        a_respond([
            'path' => $path, 'payload' => json_decode($draft['payload']),
            'base_sha' => $draft['base_sha'], 'state' => 'draft',
            'updated_at' => $draft['updated_at'] ?? null,
        ]);
    }

    $file = gh_read_file($path);
    if (!$file) a_fail('That file does not exist yet.', 404, 'not_found');

    a_respond([
        'path' => $path, 'payload' => json_decode($file['content']),
        'base_sha' => $file['sha'], 'state' => $draft ? 'deleted' : 'published',
    ]);
}

// ── DELETE ───────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    $path = a_safe_path($_GET['path'] ?? '');

    // Deleting something that was never published just drops the draft outright.
    $file = gh_read_file($path);
    if (!$file) {
        draft_delete($path);
        a_audit('content.discard', $path);
        a_respond(['ok' => true, 'state' => 'discarded']);
    }

    draft_put($path, [
        'payload'    => null,
        'base_sha'   => $file['sha'],
        'deleted'    => true,
        'updated_by' => $user['id'],
        'updated_at' => gmdate('c'),
    ]);

    a_audit('content.delete', $path);
    a_respond(['ok' => true, 'state' => 'deleted']);
}

// ── POST: save a draft ───────────────────────────────────────────────────────
$in = a_body();
$path = a_safe_path($in['path'] ?? '');

if (!array_key_exists('payload', $in)) a_fail('Nothing to save.');

// Pricing edits move money, so they are gated separately from ordinary content.
if ($path === 'content/pricing.json' && !a_can($user, 'pricing.write')) {
    a_fail('Only an admin can change pricing.', 403, 'forbidden');
}

// Re-parse the body WITHOUT assoc mode so `{}` stays an object instead of
// collapsing to `[]`, then encode it in the repo's own format. Doing this at
// save time means malformed content fails here rather than at publish, where it
// would break the commit.
$parsed = json_decode(a_raw_body());
$encoded = a_json_pretty($parsed->payload ?? null);
if ($encoded === false) a_fail('That content could not be saved (invalid characters).', 422);

// base_sha is recorded the first time a file is touched and then left alone, so
// it always points at the version the editor actually started from.
$base = $in['base_sha'] ?? null;
if ($base === null) {
    $file = gh_read_file($path);
    $base = $file['sha'] ?? null;
}

$existing = draft_get($path);

draft_put($path, [
    // Stored as text, exactly as it will be committed — no second round trip.
    'payload'    => $encoded,
    // Keep the ORIGINAL base_sha once a file has been touched: it must point at
    // the version the editor started from, or the publish-time conflict check
    // silently stops detecting concurrent changes.
    'base_sha'   => $existing['base_sha'] ?? $base,
    'deleted'    => false,
    'updated_by' => $user['id'],
    'updated_at' => gmdate('c'),
]);

a_audit('content.save', $path, ['bytes' => strlen($encoded)]);

a_respond(['ok' => true, 'path' => $path, 'state' => 'draft', 'base_sha' => $base]);
