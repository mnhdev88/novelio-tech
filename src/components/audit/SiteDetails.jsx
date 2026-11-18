import { useState } from 'react';
import { Globe, Layers, Activity, Bot, Link2, CheckCircle2, XCircle, AlertTriangle, MinusCircle, ChevronDown } from 'lucide-react';
import { Panel, Note } from './PageSnapshot';

// Facts about the domain, the server and the page's links, looked up by the
// audit server (RDAP, DNS, response headers, robots.txt). Everything is rendered
// as plain React text: registry records and headers are other people's data.

const TONE = {
  good: 'text-[#0A8547]',
  warn: 'text-[#B86E0A]',
  bad: 'text-[#E02A2A]',
  muted: 'text-[#5C6685]',
};

function regionName(code) {
  if (!code) return null;
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function fmtAge(days) {
  if (days == null || days < 0) return null;
  const years = Math.floor(days / 365.25);
  const months = Math.floor((days - years * 365.25) / 30.44);
  const y = years ? `${years} year${years === 1 ? '' : 's'}` : '';
  const m = months ? `${months} month${months === 1 ? '' : 's'}` : '';
  if (!y && !m) return 'Under a month';
  return [y, m].filter(Boolean).join(', ');
}

function Fact({ label, value, sub, tone, note, children }) {
  return (
    <div className="py-3.5 border-t border-[#0D246A]/10">
      <div className="text-[12px] font-600 uppercase tracking-wide text-[#5C6685] mb-0.5">{label}</div>
      {value
        ? <div className={`text-[15px] font-600 break-words ${tone ? TONE[tone] : 'text-[#0D246A]'}`}>{value}</div>
        : <div className="text-[14px] text-[#5C6685]">Not available</div>}
      {sub && <div className="text-[13px] text-[#3F4A6B] mt-0.5 break-words">{sub}</div>}
      {children}
      {note && <Note id={note} />}
    </div>
  );
}

function StatusIcon({ state }) {
  if (state === 'good') return <CheckCircle2 className="w-4 h-4 text-[#0A8547] flex-shrink-0 mt-px" aria-hidden="true" />;
  if (state === 'warn') return <AlertTriangle className="w-4 h-4 text-[#B86E0A] flex-shrink-0 mt-px" aria-hidden="true" />;
  if (state === 'bad') return <XCircle className="w-4 h-4 text-[#E02A2A] flex-shrink-0 mt-px" aria-hidden="true" />;
  return <MinusCircle className="w-4 h-4 text-[#94a3b8] flex-shrink-0 mt-px" aria-hidden="true" />;
}

function PanelTitle({ Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon className="w-[18px] h-[18px] text-brand-purple" aria-hidden="true" />
      {children}
    </span>
  );
}

// ── Domain and hosting ───────────────────────────────────────────────────────

function DomainHosting({ domain, dns, hosting }) {
  const d = domain || {};
  const h = hosting || {};

  let expiryTone = null;
  let expirySub = null;
  if (d.expires_in_days != null) {
    const n = d.expires_in_days;
    expiryTone = n < 30 ? 'bad' : n < 60 ? 'warn' : 'good';
    expirySub = n < 0 ? `Expired ${Math.abs(n)} days ago` : `In ${n.toLocaleString()} days`;
  }

  const lock = d.locked === true ? 'Transfer lock on' : d.locked === false ? 'Transfer lock off: the domain could be moved away more easily' : null;

  const hostValue = h.behind_cdn ? `Hidden behind ${h.cdn}` : h.provider;
  const hostSub = h.behind_cdn
    ? 'The CDN sits in front of the real server, so the host cannot be seen from outside.'
    : [h.org && h.org !== h.provider ? h.org : null, h.network && h.network !== h.org ? `Network ${h.network}` : null].filter(Boolean).join(' · ') || null;

  const locValue = h.cdn ? 'Served worldwide' : regionName(h.country);
  const locSub = h.cdn
    ? `Visitors get the site from the nearest ${h.cdn} location.${h.country && !h.behind_cdn ? ` Main server registered in ${regionName(h.country)}.` : ''}`
    : null;

  // PHP gets its own line below, so do not repeat it here.
  const serverSub = h.powered_by && !/^php\//i.test(h.powered_by) ? h.powered_by : null;

  return (
    <Panel
      title={<PanelTitle Icon={Globe}>Domain and hosting</PanelTitle>}
      intro="Public registry and network records for the domain, and what the server says about itself."
    >
      {d.platform ? (
        <div className="flex items-start gap-2 rounded-xl bg-[#FFF6E5] border border-[#F0A030]/40 p-4 mb-2 text-[14px] text-[#2B3557]">
          <AlertTriangle className="w-4 h-4 text-[#B86E0A] flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            This site runs on a shared <strong>{d.platform}</strong> address rather than a domain of its own, so there is
            no domain registration to look up. A domain of your own is what customers remember, and it keeps your
            search history if you ever change platform.
          </span>
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-x-8">
        {!d.platform && (
          <>
            <Fact label="Domain age" value={fmtAge(d.age_days)} sub={d.created ? `Registered ${fmtDate(d.created)}` : null} note="domain_age" />
            <Fact label="Registrar" value={d.registrar} sub={lock} note="registrar" />
            <Fact
              label="Registration expires"
              value={fmtDate(d.expires)}
              sub={expirySub}
              tone={expiryTone}
              note="expiry"
            />
            <Fact
              label="DNS provider"
              value={dns?.provider}
              sub={dns?.nameservers?.length ? dns.nameservers.join(', ') : null}
              note="dns"
            />
          </>
        )}
        <Fact label="Hosting provider" value={hostValue} sub={hostSub} note="hosting" />
        <Fact label="Server location" value={locValue} sub={locSub} note="location" />
        <Fact label="IP address" value={h.ip} sub={h.rdns ? `Reverse DNS: ${h.rdns}` : null} />
        <Fact label="CDN" value={h.cdn || 'None detected'} tone={h.cdn ? null : 'muted'} />
        <Fact label="Web server" value={h.server || (h.powered_by ? null : 'Not disclosed')} sub={serverSub} tone={h.server ? null : 'muted'}>
          {h.php && (
            <div className={`text-[13px] mt-0.5 ${h.php_eol ? 'text-[#E02A2A] font-500' : 'text-[#3F4A6B]'}`}>
              PHP {h.php}{h.php_eol ? ': no longer receives security fixes' : ''}
            </div>
          )}
        </Fact>
        <Fact
          label="Connection protocol"
          value={h.http_version}
          sub={h.http3 && h.http_version !== 'HTTP/3' ? 'HTTP/3 also offered' : null}
          tone={h.http_version === 'HTTP/1.1' || h.http_version === 'HTTP/1.0' ? 'warn' : null}
          note="protocol"
        />
      </div>

      {!d.platform && d.source === 'whois' && (
        <p className="text-[12px] text-[#5C6685] mt-3">Domain details from the registry&rsquo;s WHOIS service.</p>
      )}
    </Panel>
  );
}

// ── Technology ───────────────────────────────────────────────────────────────

function Technology({ tech }) {
  const groups = {};
  (tech || []).forEach((t) => {
    (groups[t.cat] = groups[t.cat] || []).push(t);
  });
  const cats = Object.keys(groups);

  return (
    <Panel
      title={<PanelTitle Icon={Layers}>What the site is built with</PanelTitle>}
      intro="Detected from the page's code and the server's response headers."
    >
      {cats.length === 0 ? (
        <p className="text-[14px] text-[#5C6685]">We could not identify the platform from the page&rsquo;s code.</p>
      ) : (
        <div className="space-y-3">
          {cats.map((cat) => (
            <div key={cat} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <div className="text-[12.5px] font-600 text-[#5C6685] sm:w-40 flex-shrink-0">{cat}</div>
              <div className="flex flex-wrap gap-1.5">
                {groups[cat].map((t) => (
                  <span key={t.name} className="inline-flex items-center gap-1 text-[13px] font-500 px-2.5 py-1 rounded-full bg-[#EEF1FA] text-[#0D246A]">
                    {t.name}
                    {t.version && <span className="text-[#5C6685] font-400">{t.version}</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4"><Note id="tech" /></div>
    </Panel>
  );
}

// ── Tracking ─────────────────────────────────────────────────────────────────

// Missing this is worth a red cross; the rest are optional tools.
const ESSENTIAL = new Set(['ga4']);

function Tracking({ tracking }) {
  return (
    <Panel
      title={<PanelTitle Icon={Activity}>Analytics and tracking</PanelTitle>}
      intro="Which measurement and verification tags the page carries."
    >
      <ul className="list-none p-0 m-0 space-y-2.5">
        {(tracking || []).map((t) => {
          const state = t.id === 'ua' ? 'bad'
            : t.state === 'yes' ? 'good'
              : t.state === 'maybe' ? 'warn'
                : ESSENTIAL.has(t.id) ? 'bad'
                  // Search Console can be verified in ways we cannot see, so
                  // "not found" there is a question, not a failure.
                  : t.id === 'gsc' ? 'warn' : 'none';
          const label = t.id === 'ua' ? 'Found, but no longer collects data'
            : t.state === 'yes' ? 'Found'
              : t.state === 'maybe' ? 'Possibly' : 'Not found';
          return (
            <li key={t.id} className="flex items-start gap-2.5 text-[14px]">
              <StatusIcon state={state} />
              <span className="min-w-0">
                <span className="font-600 text-[#0D246A]">{t.name}</span>
                <span className="text-[#5C6685]"> · {label}</span>
                {t.detail && (
                  <span className={`block text-[12.5px] text-[#3F4A6B] ${/^(G-|GTM-|UA-|AW-|\d)/.test(t.detail) ? 'font-mono break-all' : ''}`}>
                    {t.detail}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-[12px] text-[#5C6685] mt-4">
        Read from the page&rsquo;s HTML. A tag that another script adds after the page loads may not show here.
      </p>
      <Note id="tracking" />
    </Panel>
  );
}

// ── Crawlers ─────────────────────────────────────────────────────────────────

const KIND = {
  search: { label: 'Search', cls: 'bg-[#0D246A] text-white' },
  user: { label: 'On request', cls: 'border border-[#0D246A] text-[#0D246A]' },
  training: { label: 'AI training', cls: 'bg-[#E8E7DF] text-[#3F4A6B]' },
};

function Crawlers({ ai }) {
  if (!ai) return null;
  const bots = ai.bots || [];

  return (
    <Panel
      title={<PanelTitle Icon={Bot}>Search engines and AI assistants</PanelTitle>}
      intro={ai.robots_found
        ? `Who your robots.txt lets read this page (${ai.path}).`
        : 'There is no robots.txt, so every crawler is allowed to read the site.'}
    >
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-[13.5px] border-collapse min-w-[420px]">
          <thead>
            <tr className="text-left text-[12px] text-[#5C6685]">
              <th className="font-600 pb-2 pr-3">Crawler</th>
              <th className="font-600 pb-2 pr-3">Used for</th>
              <th className="font-600 pb-2 pr-3">Type</th>
              <th className="font-600 pb-2">Access</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((b) => {
              const blockedTone = b.kind === 'training' ? 'text-[#5C6685]' : 'text-[#E02A2A]';
              return (
                <tr key={b.name} className="border-t border-[#0D246A]/10">
                  <td className="py-2 pr-3 font-mono text-[12.5px] text-[#0D246A]">{b.name}</td>
                  <td className="py-2 pr-3 text-[#3F4A6B]">{b.owner}</td>
                  <td className="py-2 pr-3">
                    <span className={`inline-block text-[11px] font-600 px-2 py-px rounded-full whitespace-nowrap ${KIND[b.kind]?.cls || ''}`}>
                      {KIND[b.kind]?.label || b.kind}
                    </span>
                  </td>
                  <td className={`py-2 font-600 whitespace-nowrap ${b.allowed ? 'text-[#0A8547]' : blockedTone}`}>
                    {b.allowed ? 'Allowed' : 'Blocked'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[12.5px] text-[#3F4A6B] mt-3 leading-relaxed">
        Blocking AI training crawlers is a reasonable choice and does not affect search. Blocking search or
        on-request crawlers keeps you out of that product&rsquo;s answers. A firewall (such as Cloudflare&rsquo;s
        bot blocking) can also block crawlers that robots.txt allows; that cannot be seen from outside.
      </p>
      <Note id="crawlers" />

      <div className="mt-4 pt-4 border-t border-[#0D246A]/10 flex items-start gap-2.5 text-[14px]">
        <StatusIcon state={ai.llms_txt ? 'good' : 'none'} />
        <span>
          <span className="font-600 text-[#0D246A] font-mono text-[13px]">llms.txt</span>
          <span className="text-[#5C6685]"> · {ai.llms_txt ? 'Found' : 'Not found'}</span>
        </span>
      </div>
      <Note id="llms" />
    </Panel>
  );
}

// ── Links and HTTPS ──────────────────────────────────────────────────────────

const WWW_TEXT = {
  redirects: ['good', 'Redirects to your main address'],
  duplicate: ['warn', 'Loads separately without redirecting, so it counts as a duplicate site'],
  no_dns: ['warn', 'Does not exist, so anyone who types it gets an error'],
  ssl: ['warn', 'Shows a security warning: its SSL certificate does not cover this address'],
  unreachable: ['warn', 'Refuses the connection, so anyone who types it gets an error'],
  error: ['warn', 'Returns an error page'],
  elsewhere: ['none', 'Redirects to a different site'],
};

function Links({ links }) {
  if (!links) return null;
  const { www, mixed, broken } = links;
  const wwwRow = www && WWW_TEXT[www.state];

  const brokenCount = broken?.broken?.length || 0;

  return (
    <Panel
      title={<PanelTitle Icon={Link2}>Links and secure loading</PanelTitle>}
      intro="Whether visitors reach the right address, and whether what the page links to actually works."
    >
      <div className="space-y-5">
        {wwwRow && (
          <div>
            <div className="flex items-start gap-2.5 text-[14px]">
              <StatusIcon state={wwwRow[0]} />
              <span className="min-w-0">
                <span className="font-600 text-[#0D246A] break-all">{www.variant}</span>
                <span className="text-[#3F4A6B]"> · {wwwRow[1]}</span>
                {www.state === 'elsewhere' && www.detail && <span className="text-[#3F4A6B]"> ({www.detail})</span>}
              </span>
            </div>
            <Note id="www" />
          </div>
        )}

        {mixed && (
          <div>
            <div className="flex items-start gap-2.5 text-[14px]">
              <StatusIcon state={mixed.active > 0 ? 'bad' : mixed.passive > 0 ? 'warn' : 'good'} />
              <span className="min-w-0">
                <span className="font-600 text-[#0D246A]">Insecure (http://) files on an HTTPS page</span>
                <span className="text-[#3F4A6B]">
                  {' · '}
                  {mixed.active + mixed.passive === 0
                    ? 'None'
                    : [
                      mixed.active ? `${mixed.active} script, style or frame` : null,
                      mixed.passive ? `${mixed.passive} image or media` : null,
                    ].filter(Boolean).join(', ')}
                </span>
                {mixed.samples?.length > 0 && (
                  <ul className="list-none p-0 m-0 mt-1 space-y-0.5">
                    {mixed.samples.map((u) => (
                      <li key={u} className="font-mono text-[12px] text-[#3F4A6B] break-all">{u}</li>
                    ))}
                  </ul>
                )}
              </span>
            </div>
            <Note id="mixed" />
          </div>
        )}

        {broken && broken.checked > 0 && (
          <div>
            <div className="flex items-start gap-2.5 text-[14px]">
              <StatusIcon state={brokenCount === 0 ? 'good' : brokenCount === 1 ? 'warn' : 'bad'} />
              <span className="min-w-0">
                <span className="font-600 text-[#0D246A]">Links on the page</span>
                <span className="text-[#3F4A6B]">
                  {' · '}
                  {brokenCount === 0
                    ? `All ${broken.ok} we could check work`
                    : `${brokenCount} broken out of ${broken.checked} checked`}
                </span>
              </span>
            </div>

            {brokenCount > 0 && (
              <ul className="list-none p-0 m-0 mt-2 ml-6 space-y-1.5">
                {broken.broken.map((l) => (
                  <li key={l.url} className="text-[13px]">
                    <span className="font-mono text-[12px] text-[#0D246A] break-all">{l.url}</span>
                    <span className="block text-[#E02A2A] text-[12.5px]">
                      {l.reason}{l.internal ? '' : ' · link to another site'}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-[12px] text-[#5C6685] mt-2">
              We checked a sample of {broken.checked} links from this page.
              {broken.unverified > 0 ? ` ${broken.unverified} could not be checked because the other site blocks automated requests or did not answer in time.` : ''}
            </p>
            <Note id="broken" />
          </div>
        )}
      </div>
    </Panel>
  );
}

// ── The section ──────────────────────────────────────────────────────────────

// ── At a glance ──────────────────────────────────────────────────────────────

// Which platform to name in the summary when several were detected.
const PRIMARY_CATS = ['Website builder', 'E-commerce', 'CMS', 'Static site generator', 'Framework'];

function shortAge(days) {
  if (days == null || days < 0) return null;
  const years = Math.floor(days / 365.25);
  if (years >= 1) return `${years} year${years === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30.44);
  return months >= 1 ? `${months} month${months === 1 ? '' : 's'}` : 'Under a month';
}

/** One line per fact: [label, value, tone]. Tone 'good' | 'warn' | 'bad' | null. */
function summaryItems(site) {
  const d = site.domain || {};
  const h = site.hosting || {};
  const items = [];

  if (d.platform) {
    items.push(['Domain', `None (uses ${d.platform})`, 'warn']);
  } else {
    items.push(['Domain age', shortAge(d.age_days), null]);
    items.push(['Registrar', d.registrar, null]);
    const n = d.expires_in_days;
    items.push(['Domain expires', n == null ? null : n < 0 ? 'Expired' : `In ${n.toLocaleString()} days`,
      n == null ? null : n < 30 ? 'bad' : n < 60 ? 'warn' : 'good']);
  }

  items.push(['Hosting', h.behind_cdn ? `Behind ${h.cdn}` : h.provider, null]);
  items.push(['Server location', h.cdn ? `Worldwide (${h.cdn})` : regionName(h.country), null]);

  const tech = site.tech || [];
  const primary = PRIMARY_CATS.map((c) => tech.find((t) => t.cat === c)).find(Boolean);
  items.push(['Built with', primary ? `${primary.name}${primary.version ? ` ${primary.version}` : ''}` : (tech.length ? 'Custom build' : null), null]);

  const tr = site.tracking || [];
  const found = tr.filter((t) => t.state === 'yes' && t.id !== 'ua' && !['gsc', 'bing', 'meta_pixel', 'google_ads', 'linkedin', 'tiktok'].includes(t.id));
  const ga4 = tr.find((t) => t.id === 'ga4');
  let analytics;
  let analyticsTone;
  if (found.length) {
    analytics = found.map((t) => t.name.replace('Google Analytics 4', 'GA4').replace('Google Tag Manager', 'Tag Manager')).slice(0, 2).join(', ');
    analyticsTone = 'good';
  } else if (ga4?.state === 'maybe') {
    analytics = 'Possibly, via Tag Manager';
    analyticsTone = 'warn';
  } else if (tr.length) {
    analytics = tr.some((t) => t.id === 'ua') ? 'Outdated (Universal Analytics)' : 'None found';
    analyticsTone = 'bad';
  }
  items.push(['Analytics', analytics, analyticsTone]);

  if (site.ai) {
    const bots = site.ai.bots || [];
    const google = bots.find((b) => b.name === 'Googlebot');
    const blocked = bots.filter((b) => b.kind !== 'training' && !b.allowed);
    items.push(['Search and AI crawlers',
      google && !google.allowed ? 'Google is blocked' : blocked.length ? `${blocked.length} blocked` : 'All allowed',
      google && !google.allowed ? 'bad' : blocked.length ? 'warn' : 'good']);
  }

  const { www, mixed, broken } = site.links || {};
  if (broken && broken.checked > 0) {
    const n = broken.broken?.length || 0;
    items.push(['Broken links', n ? `${n} of ${broken.checked} checked` : `None of ${broken.checked} checked`,
      n === 0 ? 'good' : n === 1 ? 'warn' : 'bad']);
  }
  if (www && WWW_TEXT[www.state]) {
    items.push(['www and non-www', www.state === 'redirects' ? 'Consistent' : www.state === 'elsewhere' ? 'Goes elsewhere' : 'Mismatch',
      www.state === 'redirects' ? 'good' : www.state === 'elsewhere' ? null : 'warn']);
  }
  if (mixed) {
    const total = mixed.active + mixed.passive;
    items.push(['Insecure files', total ? `${total} found` : 'None', mixed.active ? 'bad' : mixed.passive ? 'warn' : 'good']);
  }

  return items;
}

function AtAGlance({ site }) {
  const items = summaryItems(site);
  return (
    <section className="glass-card gradient-border rounded-2xl p-5 sm:p-6" aria-label="Domain, hosting and technology at a glance">
      <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 m-0">
        {items.map(([label, value, tone]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[11.5px] font-600 uppercase tracking-wide text-[#5C6685]">{label}</dt>
            <dd className="m-0 mt-0.5 flex items-start gap-1.5">
              {value && tone && <StatusIcon state={tone} />}
              {value
                ? <span className={`text-[14.5px] font-600 break-words min-w-0 ${tone && tone !== 'good' ? TONE[tone] : 'text-[#0D246A]'}`}>{value}</span>
                : <span className="text-[14px] text-[#94a3b8]">Not available</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function SiteDetails({ site }) {
  const [open, setOpen] = useState(false);
  if (!site) return null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-heading font-700 text-[#0D246A] text-[20px] sm:text-[23px] mb-1">
          Domain, hosting and technology
        </h3>
        <p className="text-[14.5px] text-[#5C6685]">
          What the wider internet knows about your site: who registered and hosts it, what it runs on, what it
          measures, and who is allowed to read it.
        </p>
      </div>

      <AtAGlance site={site} />

      <div className="text-center">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-details-full"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#0D246A]/20 text-[14px] font-600 text-[#0D246A] hover:bg-[#0D246A]/5 transition-colors"
        >
          {open ? 'Hide full details' : 'Show full details'}
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div id="site-details-full" className="space-y-5">
          <DomainHosting domain={site.domain} dns={site.dns} hosting={site.hosting} />

          <div className="grid md:grid-cols-2 gap-5">
            <Technology tech={site.tech} />
            <Tracking tracking={site.tracking} />
          </div>

          <Crawlers ai={site.ai} />
          <Links links={site.links} />
        </div>
      )}
    </div>
  );
}
