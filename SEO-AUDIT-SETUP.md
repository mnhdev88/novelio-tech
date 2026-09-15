# Free SEO Audit tool — setup

The lead magnet at **/free-seo-audit**. A visitor enters a URL, the server audits
it, and the score plus the three worst findings appear immediately. The rest of
the report unlocks in exchange for an email address, which lands in the admin
panel under **Leads → SEO audits**.

It works with no setup at all — except the Speed section, which needs a Google
API key. Everything below is about that key and about where the leads go.

---

## 1. The PageSpeed API key

The Speed card is the part clients react to most, so this is worth the ten
minutes.

1. Go to <https://console.cloud.google.com/apis/credentials>.
2. **Create credentials → API key.** Copy it.
3. On the same project, go to **APIs & Services → Library**, search for
   **PageSpeed Insights API**, and click **Enable**. Without this step the key
   exists but every call returns 403.
4. Back on the key, click **Edit API key** and set:
   - **API restrictions → Restrict key →** PageSpeed Insights API only.
   - **Application restrictions → IP addresses →** your Hostinger server's IP.
     The key is only ever used server-side, so this is safe and it means a
     leaked key is useless to anyone else.

There is no billing and no quota to buy. The free tier is 25,000 requests a day,
which this tool will not come close to.

> **If a key ever leaks** (pasted into a chat, committed, emailed), delete it in
> the console and create a new one. Restricting it limits the damage; rotating it
> ends it.

## 2. Putting the key on the server

**The deploy wipes `public_html`.** The site is published as an FTPS *mirror* of
`dist/`, so anything inside the web root that is not part of the build is deleted
on the next push — and everything that is there is web-accessible. So the key
goes one level **above** `public_html`, exactly like the payment gateway
credentials.

1. Open **Hostinger → File Manager** (or FTP) and go to your home directory —
   the folder that *contains* `public_html`, not `public_html` itself.
2. Create a file there called **`novelio-audit-credentials.php`**.
3. Paste this in, with your real key:

   ```php
   <?php
   define('AUDIT_PSI_KEY', 'AIza...your key...');
   ```

4. Save. That is the whole deployment step — the tool picks it up on the next
   request, no restart needed.

Optional settings you can add to the same file:

```php
define('AUDIT_CACHE_TTL', 86400);     // how long a result for one URL is reused
define('AUDIT_RATE_PER_HOUR', 10);    // audits allowed per visitor IP per hour
define('AUDIT_NOTIFY_EMAIL', 'ajay@noveliotech.com');
```

### Local development

Put the same `define()` line in `public/api/audit/credentials.local.php`. That
file is gitignored **and** excluded from the deploy (`**/credentials.local.php`
is in the workflow's exclude list), so it stays on your machine.

**`npm run dev` alone cannot run this tool.** Vite does not execute PHP, and its
SPA fallback answers `/api/audit/run.php` with `index.html` — so the page loads,
you click *Run my free audit*, and it says "something went wrong" with no clue
why. Two terminals:

```
npm run dev        # the site, on :5173
npm run dev:api    # PHP serving public/, on :8000
```

Vite proxies `/api` to the second one (see `server.proxy` in `vite.config.js`).
If you forget the second terminal, the page now says so in as many words.

#### If every site comes back as "broken SSL certificate"

Then it is your PHP, not their websites. A PHP install with no CA bundle fails
every HTTPS request the same way a genuinely expired certificate does. The tool
checks for this — before blaming an audited site it tries two known-good hosts,
and if neither verifies it reports the problem as ours instead. You will see
this in the PHP log:

```
[audit] this server cannot verify any SSL certificate — set curl.cainfo in php.ini
```

Fix it by downloading <https://curl.se/ca/cacert.pem> and pointing `php.ini` at
it:

```ini
curl.cainfo = "C:/path/to/cacert.pem"
openssl.cafile = "C:/path/to/cacert.pem"
```

Hostinger's PHP ships with a CA bundle already, so this is a local-machine
problem only.

### Checking it worked

Run an audit on the live site. If the Speed card says *"Speed data unavailable"*,
the key is missing, not restricted the way you think, or the PageSpeed Insights
API is not enabled on that project. The server writes the real reason to the PHP
error log as `[audit] PSI returned <code>`.

Everything else in the report works regardless — a missing key costs you one
card, not the tool.

---

## 3. Where the leads go

Each unlocked report appends one line to **`novelio-admin-data/audits.jsonl`**,
beside the admin panel's other data, above the web root. The panel reads it under
**Leads → SEO audits**, where each row shows:

- the email, name and company they gave,
- **the URL they audited** — the valuable half, since it tells you their
  industry, their platform and what is broken before you call,
- their score out of 100, and
- the five worst findings, which is your opening line already written.

**Worst first** sorts by score ascending. A site scoring 34 is a much easier
conversation than one scoring 88 — they already saw the number.

Ajay also gets a plain-text email per lead at `AUDIT_NOTIFY_EMAIL`.

### No email is sent to the visitor

By design, for now. The report opens on the page and nothing is mailed out, so
there is no deliverability question to answer and no spam-folder problem.

The trade-off: **the email address is unverified.** Someone can type
`a@b.com` to unlock. You still capture the audited URL, which is the part worth
having. If you later want verified addresses, either send the report by
authenticated SMTP from a real `@noveliotech.com` mailbox, or add a six-digit
code before unlocking — neither requires rebuilding the tool.

---

## 4. How it is put together

```
public/api/audit/
  run.php       POST {url} -> score, categories, 3 worst findings, locked titles
  speed.php     POST {token} -> the PageSpeed card (a second call; Google is slow)
  unlock.php    POST {token,email} -> every finding in full; records the lead
  _checks.php   the ~30 checks, each with its own "why it matters" and "how to fix"
  _lib.php      URL safety, fetching, caching
  _config.php   credential loading
```

Three things in here are load-bearing and should not be "simplified" later:

**The locked half of the report is never sent to the browser.** `run.php` returns
the three free findings with their explanations and the rest as bare titles.
Hiding the full report behind a CSS blur instead would put the whole lead magnet
one devtools panel away from being free.

**Redirects are followed by hand.** The tool fetches a URL an anonymous stranger
supplied, which makes it a server-side request forgery engine unless it is
fenced in. Every hostname is checked to resolve to a public address — and because
a perfectly public URL can redirect to `169.254.169.254`, each redirect hop is
re-checked rather than letting cURL follow them. See the header comment in
`_lib.php`.

**`unlock.php` does not load the admin panel's config.** That file exits with a
503 when the CMS is not configured, which would take the audit tool down for a
reason unrelated to auditing. It writes `audits.jsonl` directly instead, in the
same format the panel reads.

### Changing what the audit says

All the wording lives in `_checks.php`, in three fields per check: `title` (shown
free — it is the tease), `impact` (why it matters to their business) and `detail`
(how to fix it). The wording rule is in the file header: if a check cannot say
something specific and true about *this* site, it returns `na` and is left out
entirely. A lead magnet that pads its findings gets caught, and then nothing else
in it is believed.

### Costs

None. PageSpeed is free, the checks run on the existing hosting, and results are
cached per URL for 24 hours so a visitor refreshing does not re-crawl anyone.
