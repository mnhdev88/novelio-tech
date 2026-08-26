<?php
// ─────────────────────────────────────────────────────────────────────────────
// Admin panel — flat-file storage.
//
// Replaces MySQL. Everything the panel keeps is small and rarely contended: a
// handful of users, drafts that exist only until the next publish, and a few
// hundred leads a year. A relational database buys nothing at that size and
// costs a provisioning step, a second set of credentials, and one more service
// that can be "unavailable".
//
// WHERE THE DATA LIVES IS THE CRITICAL DETAIL. The site deploys as an FTPS
// *mirror* of dist/, which deletes anything inside public_html that isn't in the
// build — so storing data under the web root would silently wipe every lead on
// the next deploy, and expose them to the world in the meantime. Everything here
// lives beside the credentials file, one level ABOVE the web root.
//
// Concurrency: two editors saving at once, or a form submission landing mid-read,
// must not interleave into a corrupt file. Two rules make that safe:
//   * every write goes to a temp file and is then rename()d over the target —
//     rename is atomic, so a reader sees either the old file or the new one,
//     never a half-written one;
//   * every read-modify-write holds an exclusive flock() for the whole cycle.
// Appends (leads, audit) use LOCK_EX + a single write() of one line, which the
// OS will not split.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_config.php';

/** The storage directory, created on first use. Above the web root. */
function store_dir() {
    static $dir = null;
    if ($dir !== null) return $dir;

    $dir = ADMIN_DATA_DIR;
    if (!is_dir($dir)) {
        if (!@mkdir($dir, 0700, true) && !is_dir($dir)) {
            @error_log('[admin] cannot create storage dir: ' . $dir);
            a_store_unavailable();
        }
    }
    if (!is_writable($dir)) {
        @error_log('[admin] storage dir not writable: ' . $dir);
        a_store_unavailable();
    }
    return $dir;
}

function a_store_unavailable() {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => 'The panel cannot write to its data folder on the server.',
        'code'  => 'storage_unavailable',
    ]);
    exit;
}

function store_path($name) {
    // Names are internal constants, never user input, but validate anyway so a
    // future caller can't turn one into a traversal.
    if (!preg_match('#^[a-z0-9._/-]+$#', $name) || strpos($name, '..') !== false) {
        throw new InvalidArgumentException('bad store name');
    }
    $path = store_dir() . '/' . $name;
    $parent = dirname($path);
    if (!is_dir($parent)) @mkdir($parent, 0700, true);
    return $path;
}

// ── Whole-document JSON ──────────────────────────────────────────────────────

function store_get($name, $default = []) {
    $path = store_path($name);
    if (!is_file($path)) return $default;
    $raw = @file_get_contents($path);
    if ($raw === false || $raw === '') return $default;
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $default;
}

/** Atomic write: temp file in the same directory, then rename over the target. */
function store_put($name, $data) {
    $path = store_path($name);
    $tmp  = $path . '.' . bin2hex(random_bytes(6)) . '.tmp';

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) throw new RuntimeException('cannot encode store data');

    if (@file_put_contents($tmp, $json) === false) { @unlink($tmp); a_store_unavailable(); }
    @chmod($tmp, 0600);
    if (!@rename($tmp, $path)) { @unlink($tmp); a_store_unavailable(); }
    return $data;
}

/**
 * Read-modify-write under an exclusive lock.
 * $fn receives the current contents and returns the new contents.
 */
function store_mutate($name, callable $fn, $default = []) {
    $path = store_path($name);
    $lock = @fopen($path . '.lock', 'c');
    if ($lock === false) a_store_unavailable();

    try {
        if (!flock($lock, LOCK_EX)) a_store_unavailable();
        $current = store_get($name, $default);
        $next = $fn($current);
        if ($next !== null) store_put($name, $next);
        return $next;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

// ── Append-only collections (JSON Lines) ─────────────────────────────────────
// One JSON object per line. Appending never rewrites what is already there, so
// a lead arriving while an admin is reading the inbox cannot corrupt anything,
// and the file stays readable even if a write is interrupted mid-line.

function store_append($name, array $record) {
    $record['id'] = $record['id'] ?? store_id();
    $record['created_at'] = $record['created_at'] ?? gmdate('c');

    $line = json_encode($record, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($line === false) throw new RuntimeException('cannot encode record');

    $fh = @fopen(store_path($name), 'a');
    if ($fh === false) a_store_unavailable();
    try {
        flock($fh, LOCK_EX);
        fwrite($fh, $line . "\n");
        fflush($fh);
    } finally {
        flock($fh, LOCK_UN);
        fclose($fh);
    }
    return $record;
}

/** Every record, newest first. */
function store_all($name) {
    $path = store_path($name);
    if (!is_file($path)) return [];

    $rows = [];
    $fh = @fopen($path, 'r');
    if ($fh === false) return [];
    flock($fh, LOCK_SH);
    while (($line = fgets($fh)) !== false) {
        $line = trim($line);
        if ($line === '') continue;
        $row = json_decode($line, true);
        // A torn final line (power loss mid-write) is skipped rather than
        // failing the whole read.
        if (is_array($row)) $rows[] = $row;
    }
    flock($fh, LOCK_UN);
    fclose($fh);

    return array_reverse($rows);
}

/**
 * Rewrite a JSONL collection under lock — used for status edits and deletes.
 * $fn receives all rows (newest first) and returns the rows to keep.
 */
function store_rewrite($name, callable $fn) {
    $path = store_path($name);
    $lock = @fopen($path . '.lock', 'c');
    if ($lock === false) a_store_unavailable();

    try {
        if (!flock($lock, LOCK_EX)) a_store_unavailable();

        $rows = $fn(store_all($name));
        $tmp = $path . '.' . bin2hex(random_bytes(6)) . '.tmp';

        $out = '';
        // store_all() hands back newest-first; the file itself is oldest-first.
        foreach (array_reverse($rows) as $row) {
            $out .= json_encode($row, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
        }
        if (@file_put_contents($tmp, $out) === false) { @unlink($tmp); a_store_unavailable(); }
        @chmod($tmp, 0600);
        if (!@rename($tmp, $path)) { @unlink($tmp); a_store_unavailable(); }

        return $rows;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

/** Opaque, collision-proof record id. No counter to keep in sync. */
function store_id() {
    return bin2hex(random_bytes(12));
}

// ── Drafts ───────────────────────────────────────────────────────────────────
// One file per content path rather than one big drafts document: two people
// editing different pages then never contend, and a corrupt draft can only ever
// affect the page it belongs to.

function draft_key($path) {
    return 'drafts/' . sha1($path) . '.json';
}

function draft_get($path) {
    $d = store_get(draft_key($path), null);
    return is_array($d) ? $d : null;
}

function draft_put($path, array $draft) {
    $draft['path'] = $path;
    return store_put(draft_key($path), $draft);
}

function draft_delete($path) {
    $file = store_path(draft_key($path));
    if (is_file($file)) @unlink($file);
}

/** Every pending draft, oldest edit first. */
function draft_all() {
    $dir = store_dir() . '/drafts';
    if (!is_dir($dir)) return [];

    $out = [];
    foreach ((array) @scandir($dir) as $f) {
        if (substr($f, -5) !== '.json') continue;
        $raw = @file_get_contents($dir . '/' . $f);
        if ($raw === false) continue;
        $row = json_decode($raw, true);
        if (is_array($row) && isset($row['path'])) $out[] = $row;
    }
    usort($out, function ($a, $b) {
        return strcmp($a['updated_at'] ?? '', $b['updated_at'] ?? '');
    });
    return $out;
}

function draft_clear_all() {
    $dir = store_dir() . '/drafts';
    if (!is_dir($dir)) return;
    foreach ((array) @scandir($dir) as $f) {
        if (substr($f, -5) === '.json') @unlink($dir . '/' . $f);
    }
}
