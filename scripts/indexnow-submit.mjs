// IndexNow submitter — pings api.indexnow.org (shared by Bing, Yandex, Seznam, etc.)
// with the URLs in public/sitemap.xml so participating engines re-crawl on demand.
//
// Usage:
//   node scripts/indexnow-submit.mjs                 # submit every URL in sitemap.xml
//   node scripts/indexnow-submit.mjs https://www.noveliotech.com/pricing  # submit specific URL(s)
//
// The key file (public/<key>.txt) must already be live at the site root for engines
// to accept the submission — it proves we own the host.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const KEY = 'a0854d27a4a831a20f9af1fecd61d74d';
const HOST = 'www.noveliotech.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function urlsFromSitemap() {
  const xml = await readFile(resolve(__dirname, '../public/sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const cliUrls = process.argv.slice(2);
  const urlList = cliUrls.length ? cliUrls : await urlsFromSitemap();

  if (!urlList.length) {
    console.error('No URLs to submit.');
    process.exit(1);
  }

  // IndexNow caps a single request at 10,000 URLs; we're far under that.
  const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  // 200 = accepted, 202 = accepted (validation pending). Anything else is a problem.
  const text = await res.text();
  console.log(`IndexNow ${res.status} ${res.statusText} — submitted ${urlList.length} URL(s)`);
  if (text.trim()) console.log(text);

  if (res.status !== 200 && res.status !== 202) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('IndexNow submission failed:', err);
  process.exit(1);
});
