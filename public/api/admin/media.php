<?php
// ─────────────────────────────────────────────────────────────────────────────
// Image upload for blog posts and OG images.
//
//   GET                         -> list what's in public/blog/
//   POST multipart (file, name) -> commit the image straight to the repo
//
// Images go to the repo rather than to the server because the deploy is an FTPS
// mirror of dist/ — anything written into public_html outside that mirror is
// deleted on the next deploy. Committing means the image survives, gets served
// from the same CDN path as every other asset, and is versioned.
//
// This commits immediately (unlike JSON drafts): an editor needs the URL back
// right away to place the image, and an image with no page referencing it is
// harmless on its own.
// ─────────────────────────────────────────────────────────────────────────────

require_once __DIR__ . '/_github.php';

$method = a_method(['GET', 'POST']);
$user = a_require($method === 'GET' ? 'content.read' : 'media.upload');

const MEDIA_DIR = 'public/blog';
const MEDIA_MAX_BYTES = 4 * 1024 * 1024;   // 4 MB — well past a well-compressed hero image
const MEDIA_TYPES = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
];

// ── GET: library ─────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $items = [];
    foreach (gh_list_dir(MEDIA_DIR) as $entry) {
        if (($entry['type'] ?? '') !== 'file') continue;
        if (!preg_match('/\.(jpe?g|png|webp)$/i', $entry['name'])) continue;
        $items[] = [
            'name' => $entry['name'],
            'url'  => '/blog/' . $entry['name'],   // public/ is the web root at build time
            'size' => $entry['size'] ?? 0,
        ];
    }
    a_respond(['items' => $items]);
}

// ── POST: upload ─────────────────────────────────────────────────────────────
if (empty($_FILES['file']) || ($_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    $err = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
        a_fail('That image is larger than the server accepts. Compress it and try again.', 413, 'too_large');
    }
    a_fail('No image was received.', 400, 'no_file');
}

// Multipart POST bypasses the JSON body, so CSRF is checked against the form field.
$sentToken = $_POST['csrf'] ?? ($_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '');
if (empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $sentToken)) {
    a_fail('Your session expired. Please sign in again.', 419, 'csrf');
}

$tmp = $_FILES['file']['tmp_name'];
if (!is_uploaded_file($tmp)) a_fail('Invalid upload.', 400);

$size = (int) $_FILES['file']['size'];
if ($size <= 0 || $size > MEDIA_MAX_BYTES) {
    a_fail('Images must be under 4 MB. Compress it and try again.', 413, 'too_large');
}

// Trust the file's actual contents, never the client-supplied MIME type or
// extension — that is what stops a .php renamed to .jpg from being committed.
$info = @getimagesize($tmp);
$mime = $info['mime'] ?? '';
if (!$info || !isset(MEDIA_TYPES[$mime])) {
    a_fail('That file is not a JPG, PNG or WebP image.', 415, 'bad_type');
}
$ext = MEDIA_TYPES[$mime];

$base = a_slug(pathinfo((string) ($_POST['name'] ?? $_FILES['file']['name']), PATHINFO_FILENAME));
if ($base === '') $base = 'image';
$name = $base . '.' . $ext;

// Never silently replace an existing image — another post may be using it.
$existing = array_column(gh_list_dir(MEDIA_DIR), 'name');
if (in_array($name, $existing, true)) {
    $n = 2;
    while (in_array($base . '-' . $n . '.' . $ext, $existing, true)) $n++;
    $name = $base . '-' . $n . '.' . $ext;
}

$bytes = file_get_contents($tmp);
$path = MEDIA_DIR . '/' . $name;

gh_commit(
    [['path' => $path, 'content' => $bytes, 'binary' => true]],
    'media: add ' . $name . "\n\nUploaded by " . $user['name'] . ' <' . $user['email'] . '>'
);

a_audit('media.upload', $path, ['bytes' => $size, 'mime' => $mime]);

a_respond([
    'ok'   => true,
    'name' => $name,
    'url'  => '/blog/' . $name,
    'width'  => $info[0] ?? null,
    'height' => $info[1] ?? null,
    // The image only reaches the live CDN after the deploy this commit triggers.
    'live_after_deploy' => true,
]);
