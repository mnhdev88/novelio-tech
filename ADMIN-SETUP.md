# Admin panel — setup

How the client-facing admin panel is wired, and what has to exist on the server
before it works. Companion to `PAYPAL-SETUP.md` / `PAYONEER-SETUP.md`, and it
follows the same credential conventions.

---

## How it works

The site is a static build. Content is **not** read from a database at runtime —
it is compiled into the pages at build time, which is what keeps every route
prerendered, schema-marked and crawlable. So the panel does not edit the live
site directly. It edits the *source of truth* and lets the existing pipeline
rebuild:

```
Client edits in /admin
      │
      ├─ Save ──────────► draft file          (instant, no deploy)
      │
      └─ Publish ───────► one git commit ──► GitHub Actions ──► build
                                                 + prerender
                                                 + FTPS to Hostinger  (~3–5 min)
```

Two consequences worth telling the client up front:

- **Saving is instant, publishing takes a few minutes.** Drafts are written as
  files on the server, so editing never waits on anything. Publishing rebuilds and redeploys the whole
  site; the panel shows live progress.
- **Publishing batches everything.** All pending drafts go out as a single
  commit, so ten edits cost one deploy, not ten.

### What the panel can and cannot write

The GitHub token can technically write the whole repo, so the server enforces a
whitelist (`$GLOBALS['ADMIN_WRITABLE']` in `_config.php`). Only these are
writable:

| Path | Holds |
|---|---|
| `content/` | all site content JSON (blog, pricing, settings, testimonials…) |
| `public/blog/` | uploaded images |

Anything else — `src/`, the deploy workflow, the PHP endpoints — is rejected
before a request reaches GitHub. The panel cannot change code.

### Derived files

`scripts/gen-derived.mjs` runs automatically before every build (`prebuild`) and
regenerates three files from `content/`:

- **`public/sitemap.xml`** — blog entries only; the other ~43 routes are carried
  over untouched. This matters because `prerender.mjs` discovers routes *from the
  sitemap*: a post missing here would ship as an empty SPA shell with no meta
  tags and no schema.
- **`public/api/_pricing.php`** — the server-side price table both payment
  gateways charge from. Generating it is what stops the displayed price and the
  charged price from drifting apart.
- **`content/seo/routes.json`** — the list of pages shown in the panel's
  Pages & SEO section, taken from the sitemap so it cannot drift from what is
  actually published.

Never hand-edit those files; edit `content/` and rebuild.

---

## Server setup (once)

### 1. Create the GitHub token

GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained
tokens**.

- **Repository access:** *Only select repositories* → this repo. Nothing else.
- **Permissions:** *Contents: Read and write*. That is the only one needed.
- **Expiration:** set a calendar reminder — publishing stops working the day it
  lapses, and the panel will say so explicitly.

### 2. Upload the credentials file

Copy `public/api/admin/credentials.example.php`, fill it in, and upload it as
`novelio-admin-credentials.php` **one level above `public_html`** — the same
place as `novelio-paypal-credentials.php`.

> It must not go inside `public_html`. The deploy is an FTPS *mirror* of `dist/`:
> anything in the web root that is not in `dist/` gets deleted on the next
> deploy, and anything in the web root is publicly reachable. Above the web root
> it is neither.

### 3. Create the first account

Deploy once so the PHP files exist on the server, then:

```bash
curl -X POST https://www.noveliotech.com/api/admin/install.php \
  -H 'Content-Type: application/json' \
  -d '{"key":"<ADMIN_INSTALL_KEY>","name":"Your Name","email":"you@noveliotech.com","password":"a-long-password"}'
```

This creates the data folder and one admin account. It refuses to run again once
an admin exists, so it is safe to leave deployed (the FTPS mirror would restore
it anyway if you deleted it).

Afterwards, blank out `ADMIN_INSTALL_KEY` in the credentials file. Add the rest
of the team from **Settings → Team** in the panel.

---

## What's in the panel

| Section | What the client can do |
|---|---|
| **Overview** | Post count, unpublished changes, new leads, last publish. |
| **Unpublished** | Everything edited but not yet live, described in plain language, with the Publish button and an optional note. A count badge sits on this item in the sidebar. |
| **Home page** | Hero (badge, three-part headline, tagline, paragraph, button), the four growth areas with their symptom lists, the 12-stage growth cycle, three pillars, the 10-point website checklist, offer benefits, why-choose-us reasons and result bars, and the homepage FAQ. |
| **Blog** | Write, edit, reorder, delete. Draft / published / scheduled per post. Block editor with rich text, headings, stat callouts, CTA boxes, highlights, FAQ blocks, images and tables. Image upload. Article + FAQ schema generated automatically. Google result preview. |
| **Pages & SEO** | Title, description and "hide from Google" for any of the 55 routes, with a live Google preview. Blank keeps the page's built-in wording. |
| **Testimonials** | Add, edit, reorder and remove customer reviews — quote, name, business, star rating, result. |
| **Questions & answers** | The home page and pricing FAQs. The home set also feeds the FAQ markup Google reads. |
| **Header** | The main menu: add, rename, reorder, remove items. |
| **Footer** | Legal links and the copyright line. |
| **Contact details** | Phone, email, WhatsApp, address, office hours and social profiles — changed once, applied everywhere they appear. |
| **Pricing** | Plans, prices, yearly totals, upfront months, features, add-ons. Admin only. |
| **Leads** | Enquiries, newsletter subscribers, job applications. Status tracking and CSV export. |
| **Team** | Add people, set roles, disable accounts, set passwords. Admin only. |
| **Activity** | Who changed what, and when. Admin only. |

### Homepage copy

`content/homepage.json` was extracted from the section components by
`scripts/extract-home.mjs` rather than retyped — several thousand words of
marketing copy, where one silent typo is a live regression. The script strips the
JSX with Vite, imports the result, and turns lucide icon *components* back into
their names by identity lookup. It is disposable; it has already run.

The editor exposes **text only**. Icons, gradient classes, hex accents and glow
values are spread through untouched on save, so changing wording cannot break a
section's layout or colour. The homepage FAQ feeds the `FAQPage` schema on `/`,
so editing a question there updates what Google reads.

Verified after extraction: the prerendered homepage's visible text is identical
to before, character for character.

### Page titles and descriptions

Each page's title and description live in that page's own component, not in
`content/`, so the panel has no stored value to show for them. Rather than
refactor ~40 page components, **Pages & SEO** fetches the live page and reads its
`<title>` and meta description straight out of the prerendered HTML — the panel
is same-origin with the site, so this needs no API. The client sees what Google
sees today, and typing in a field creates an override in `content/seo/pages.json`.

### Publishing one post

The post editor has its own **Publish post** button. It commits only that post
(plus `content/blog/index.json` when the post's status changes) and leaves every
other pending edit as a draft, so a finished article can go live without
dragging along half-written changes to other pages. `publish.php` takes an
optional `paths` array for this and clears only the drafts it committed.

It always does *both* halves of publishing — flips the status to `published`
**and** deploys. Doing only one is the trap: a post marked published that never
deployed looks live in the panel and is invisible on the site.

Note that `index.json` is a single file holding every post's status and order,
so publishing one post also carries any other pending status or ordering changes
in it. The whole site still rebuilds either way — there is no such thing as
deploying one page of a static site.

### Previewing a draft

The editor's **Preview** button opens `/blog/<slug>?preview=1`, which renders the
*real* blog page with the draft content pulled from the admin API — real navbar,
footer, article CSS and layout, so what the client checks cannot drift from what
ships. Any queued autosave is flushed first so the preview is never stale.

The draft only appears for a signed-in session. Anyone else following the link
gets the published version (or a 404 for a post that was never published), so
nothing unpublished leaks. Preview pages are always `noindex,nofollow` and their
Article/FAQ schema is suppressed — a draft URL must never reach Google.

### The blog body editor

Posts are edited as a list of blocks rather than one WYSIWYG box. That is a
deliberate choice: the existing posts carry hand-built structures (stat boxes,
comparison tables, FAQ items, figures with captions) whose CSS classes a normal
rich-text editor silently strips — taking the styling and the FAQ schema with them.

`src/admin/blog/blockModel.js` enforces one rule: opening a post and saving it
unchanged must not alter its HTML. If a post's markup cannot be taken apart
safely, the editor says so and falls back to HTML for that post rather than
guessing. `npm run test:blocks` verifies this against every real post in a
headless browser; keep it passing.

---

## Roles

| | Editor | Admin |
|---|---|---|
| Blog, SEO, header/footer, contact details | ✅ | ✅ |
| Upload images | ✅ | ✅ |
| Publish | ✅ | ✅ |
| Leads inbox | ✅ | ✅ |
| **Pricing** | ❌ | ✅ |
| **Team management** | ❌ | ✅ |
| **Audit log** | ❌ | ✅ |

Pricing is admin-only because it changes what customers are charged. The audit
log is admin-only because it is the record that makes shared editing
accountable.

---

## Where the data lives

There is **no database**. The panel keeps everything as files in
`novelio-admin-data/`, created automatically beside the credentials file — one
level **above** `public_html`:

| File | Holds |
|---|---|
| `users.json` | accounts, bcrypt hashes, roles, lockout state |
| `drafts/*.json` | one file per unpublished edit, cleared on publish |
| `publish.json` | the current deploy's status (polled by the progress bar) |
| `publishes.jsonl` | publish history |
| `audit.jsonl` | who changed what |
| `leads.jsonl`, `newsletter.jsonl`, `applications.jsonl` | form submissions |

Two things follow from that, and both matter:

- **It must stay above the web root.** The deploy is an FTPS *mirror* of `dist/`,
  so a data folder inside `public_html` would be deleted on the next deploy — and
  would be publicly downloadable until then.
- **Back it up by copying that one folder.** There is nothing else to dump.

Concurrent writes are safe: every whole-file update takes an exclusive `flock()`
across the read-modify-write and lands via an atomic `rename()`, and submissions
are appended one line at a time. This was load-tested rather than assumed —
30 simultaneous signups wrote 30 records with no corruption and none lost, and
20 simultaneous signups for the *same* address produced exactly one record.

Sessions are PHP's own (file-based) — nothing extra to configure.

## Security notes

- Passwords are bcrypt (`password_hash`), never stored or logged in plain text.
- Sessions are `HttpOnly` + `SameSite=Lax` + `Secure`, with the session id
  regenerated on login. Every mutating request also carries a CSRF token.
- Six failed logins locks that account for 15 minutes. Lockout is per-account,
  not per-IP, so it cannot be used to lock your whole office out by spoofing
  an address.
- Uploads are validated by decoding the image, not by trusting the filename or
  the browser-supplied MIME type.
- The GitHub PAT never reaches the browser. The panel talks only to our own PHP
  endpoints.
- `.htaccess` denies any `_*.php` include and any `credentials*.php` directly.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| `"The admin panel is not configured on this server yet."` | `novelio-admin-credentials.php` is missing or above the wrong directory. |
| `"The panel cannot write to its data folder on the server."` | The directory above `public_html` is not writable by PHP. |
| `"GitHub rejected the access token."` | PAT expired, or it lost `Contents: write` on this repo. |
| `"Someone else published while you were editing."` | Another publish (or a normal `git push`) landed first. Reload and publish again. |
| Publish says **live** but the site looks unchanged | Browser/Hostinger cache. Hard-reload; check the Actions run linked in the panel actually succeeded. |
| A new post 404s | Its `status` in `content/blog/index.json` is `draft`, or it is scheduled for a future date. |
