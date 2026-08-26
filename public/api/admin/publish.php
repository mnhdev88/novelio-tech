<?php
// ─────────────────────────────────────────────────────────────────────────────
// Publish: turn every pending draft into ONE commit, which the existing
// deploy.yml picks up and turns into a full build + prerender + FTPS deploy.
//
//   POST  { message?, paths?: [...] }  -> commit and start the deploy
//                                       paths limits it to those files
//   GET   ?status=1             -> state of the most recent publish (for polling)
//
// One commit per publish is deliberate: committing on every save would queue a
// full site deploy per keystroke.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_github.php';

// Latest publish (polled by the progress bar) plus an append-only history.
const A_PUBLISH     = 'publish.json';
const A_PUBLISH_LOG = 'publishes.jsonl';

$method = a_method(['GET', 'POST']);

// ── GET: how is the last publish doing? ──────────────────────────────────────
if ($method === 'GET') {
    a_require('content.read');

    $row = store_get(A_PUBLISH, null);
    if (!$row) a_respond(['publish' => null]);

    // Once a publish is done it never changes again, so stop asking GitHub.
    if (in_array($row['status'] ?? '', ['live', 'failed'], true)) {
        a_respond(['publish' => $row]);
    }

    $run = !empty($row['commit_sha']) ? gh_run_for_commit($row['commit_sha']) : null;
    if ($run) {
        $row['status'] = $run['status'] !== 'completed'
            ? 'building'
            : ($run['conclusion'] === 'success' ? 'live' : 'failed');
        $row['run_id']  = $run['run_id'];
        $row['run_url'] = $run['url'];
        store_put(A_PUBLISH, $row);
    }
    a_respond(['publish' => $row]);
}

// ── POST: commit ─────────────────────────────────────────────────────────────
$user = a_require('content.publish');
$in = a_body();

$drafts = draft_all();
usort($drafts, function ($a, $b) { return strcmp($a['path'], $b['path']); });
if (!$drafts) a_fail('There are no unpublished changes.', 400, 'nothing_to_publish');

// Optional subset: publish only these paths and leave the rest pending. Used by
// the "Publish this post" button, so one finished article can go live without
// dragging along half-written edits to other pages.
$only = null;
if (!empty($in['paths']) && is_array($in['paths'])) {
    $only = array_values(array_unique(array_map('strval', $in['paths'])));
    $drafts = array_values(array_filter($drafts, function ($d) use ($only) {
        return in_array($d['path'], $only, true);
    }));
    if (!$drafts) {
        a_fail('Those changes have already been published.', 400, 'nothing_to_publish');
    }
}

// Refuse to publish over someone else's newer version rather than clobbering it.
// base_sha is what the editor loaded; if the file has moved on since, the two
// versions need reconciling by a human.
$conflicts = [];
foreach ($drafts as $d) {
    $current = gh_read_file($d['path']);
    $currentSha = $current['sha'] ?? null;
    if (!empty($d['base_sha']) && $currentSha !== null && $d['base_sha'] !== $currentSha) {
        $conflicts[] = $d['path'];
    }
}
if ($conflicts && empty($in['force'])) {
    a_fail(
        'These files changed since you opened them: ' . implode(', ', $conflicts) .
        '. Reload them to see the newer version, or publish again with "overwrite" to keep yours.',
        409,
        'conflict'
    );
}

$files = [];
foreach ($drafts as $d) {
    // Drafts already hold the exact text to commit (see content.php), so this
    // never re-encodes and can never reformat a file.
    $files[] = !empty($d['deleted'])
        ? ['path' => $d['path'], 'delete' => true]
        : ['path' => $d['path'], 'content' => $d['payload']];
}

$note = a_clean_line($in['message'] ?? '', 120);
$message = 'content: ' . ($note !== '' ? $note : count($files) . ' file(s) updated from the admin panel')
         . "\n\nPublished by " . $user['name'] . ' <' . $user['email'] . '>';

$sha = gh_commit($files, $message);

$paths = array_column($drafts, 'path');
$record = [
    'id'         => store_id(),
    'user_id'    => $user['id'],
    'user_name'  => $user['name'],
    'commit_sha' => $sha,
    'message'    => $note !== '' ? $note : 'Content update',
    'paths'      => json_encode($paths),
    'status'     => 'building',
    'created_at' => gmdate('c'),
];
store_put(A_PUBLISH, $record);
store_append(A_PUBLISH_LOG, $record);
$publishId = $record['id'];

// Only clear drafts after the commit lands, so a GitHub failure leaves the
// client's work exactly where it was. A subset publish clears just what it
// committed — anything else stays pending and still shows in the panel.
if ($only === null) {
    draft_clear_all();
} else {
    foreach ($drafts as $d) draft_delete($d['path']);
}

a_audit('content.publish', $sha, ['paths' => $paths, 'count' => count($paths)]);

a_respond([
    'ok'         => true,
    'publish_id' => $publishId,
    'commit_sha' => $sha,
    'paths'      => $paths,
    'status'     => 'building',
    // The client shows this as an estimate next to the progress bar.
    'eta_seconds' => 240,
]);
