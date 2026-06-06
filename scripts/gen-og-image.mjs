// Generates the 1200x630 social-share image at public/og-image.png by rendering a
// branded HTML card with headless Chromium and screenshotting it.
// Run: node scripts/gen-og-image.mjs   (re-run whenever the card design changes)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'og-image.png')

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    background: #0B1A33;
    color: #fff; position: relative; overflow: hidden;
  }
  .wrap { position:absolute; inset:0; padding:84px 90px; display:flex; flex-direction:column; justify-content:space-between; }
  .glow1 { position:absolute; width:620px; height:620px; border-radius:50%; top:-220px; right:-160px;
    background: radial-gradient(circle, rgba(107,63,160,0.55) 0%, rgba(107,63,160,0) 70%); }
  .glow2 { position:absolute; width:560px; height:560px; border-radius:50%; bottom:-240px; left:-160px;
    background: radial-gradient(circle, rgba(14,165,233,0.40) 0%, rgba(14,165,233,0) 70%); }
  .brand { display:flex; align-items:center; gap:18px; font-size:34px; font-weight:800; letter-spacing:-0.5px; }
  .mark { width:54px; height:54px; border-radius:14px; display:flex; align-items:center; justify-content:center;
    font-size:30px; font-weight:800; color:#fff;
    background: linear-gradient(135deg,#6B3FA0 0%,#1D4ED8 50%,#0EA5E9 100%); }
  h1 { font-size:78px; line-height:1.06; font-weight:800; letter-spacing:-1.6px; max-width:1000px; }
  .grad { background:linear-gradient(135deg,#A78BFA 0%,#60A5FA 50%,#38BDF8 100%);
    -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
  .sub { font-size:30px; color:#AFC0DC; font-weight:500; }
  .pills { display:flex; gap:14px; flex-wrap:wrap; }
  .pill { font-size:22px; padding:10px 22px; border-radius:999px; background:rgba(255,255,255,0.07);
    border:1px solid rgba(255,255,255,0.15); color:#DCE6F7; }
  .bar { position:absolute; left:0; bottom:0; width:100%; height:10px;
    background: linear-gradient(90deg,#F97316,#FACC15,#22C55E,#0EA5E9,#1D4ED8,#6B3FA0); }
</style></head>
<body>
  <div class="glow1"></div><div class="glow2"></div>
  <div class="wrap">
    <div class="brand"><div class="mark">N</div>Novelio Technologies</div>
    <div>
      <h1>Your Dedicated <span class="grad">Business Growth Partner</span></h1>
      <p class="sub" style="margin-top:26px">Websites that convert. SEO that ranks. Systems that scale.</p>
    </div>
    <div class="pills">
      <span class="pill">Web Development</span>
      <span class="pill">SEO &amp; Local</span>
      <span class="pill">Lead Generation</span>
      <span class="pill">Automation &amp; CRM</span>
      <span class="pill">Free 30-Min Growth Audit</span>
    </div>
  </div>
  <div class="bar"></div>
</body></html>`

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.screenshot({ path: OUT, type: 'png' })
  console.log(`[og-image] wrote ${OUT}`)
} finally {
  await browser.close()
}
