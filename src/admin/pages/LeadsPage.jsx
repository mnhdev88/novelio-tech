import { useEffect, useState, useCallback } from 'react';
import { Download, Search, Mail, Phone, ExternalLink, ArrowDownWideNarrow } from 'lucide-react';
import * as api from '../api';
import { inputCls, ErrorNote, Spinner, PageHeader } from '../ui';

const TABS = [
  { id: 'leads',        label: 'Enquiries',   statuses: ['new', 'contacted', 'won', 'lost', 'spam'] },
  { id: 'newsletter',   label: 'Subscribers', statuses: ['subscribed', 'unsubscribed'] },
  { id: 'applications', label: 'Job applications', statuses: ['new', 'reviewing', 'rejected', 'hired'] },
  { id: 'audits',       label: 'SEO audits',   statuses: ['new', 'contacted', 'won', 'lost', 'spam'] },
];

// The worse the score, the easier the call: there is more obviously wrong to
// talk about, and they have already seen it themselves.
function scoreClass(score) {
  if (score >= 75) return 'bg-green-100 text-green-700';
  if (score >= 55) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

const STATUS_STYLE = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  reviewing: 'bg-amber-100 text-amber-700',
  won: 'bg-green-100 text-green-700',
  hired: 'bg-green-100 text-green-700',
  subscribed: 'bg-green-100 text-green-700',
  lost: 'bg-slate-100 text-slate-600',
  rejected: 'bg-slate-100 text-slate-600',
  unsubscribed: 'bg-slate-100 text-slate-600',
  spam: 'bg-red-100 text-red-700',
};

export default function LeadsPage() {
  const [type, setType] = useState('leads');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sortByScore, setSortByScore] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const tab = TABS.find((t) => t.id === type);

  const load = useCallback(async () => {
    setData(null);
    try {
      setData(await api.leads.list(type, { q, status, sort: sortByScore ? 'score' : '' }));
    } catch (e) {
      setError(e.message);
    }
  }, [type, q, status, sortByScore]);

  // Debounced so typing in the search box does not fire a query per keystroke.
  useEffect(() => {
    const id = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(id);
  }, [load, q]);

  const setRowStatus = async (id, value) => {
    setData((d) => ({ ...d, items: d.items.map((r) => (r.id === id ? { ...r, status: value } : r)) }));
    try {
      await api.leads.setStatus(type, id, value);
    } catch (e) {
      setError(e.message);
      load();
    }
  };

  return (
    <div>
      <PageHeader title="Leads" subtitle="Everything submitted through the website.">
        <a
          href={api.leads.exportUrl(type, { q, status })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#475569] hover:text-[#1B3172] hover:border-[#1B3172]"
        >
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </PageHeader>

      <ErrorNote>{error}</ErrorNote>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setType(t.id); setStatus(''); setSortByScore(false); }}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer ${
              type === t.id ? 'bg-[#1B3172] text-white' : 'bg-white border border-slate-200 text-[#475569]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={type === 'audits' ? 'Search name, email, company or site…' : 'Search name, email or phone…'}
            className={`${inputCls} pl-9`}
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} w-auto`}>
          <option value="">All statuses</option>
          {tab.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {type === 'audits' && (
          <button
            onClick={() => setSortByScore((v) => !v)}
            title="Worst-scoring sites first"
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer border ${
              sortByScore ? 'bg-[#1B3172] text-white border-[#1B3172]' : 'bg-white border-slate-200 text-[#475569]'
            }`}
          >
            <ArrowDownWideNarrow className="w-4 h-4" /> Worst first
          </button>
        )}
      </div>

      {!data ? <Spinner /> : data.items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-sm text-[#64748b]">Nothing here yet.</p>
          <p className="text-xs text-[#94a3b8] mt-1">
            New submissions appear as soon as they come in — no publishing needed.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {data.items.map((row) => (
              <div key={row.id} className="px-4 py-3 border-b border-slate-100 last:border-0">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-[#1B3172] truncate">
                      {row.name || row.email || '(no name)'}
                      {row.role && <span className="font-normal text-[#64748b]"> — {row.role}</span>}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-[#94a3b8] mt-0.5">
                      {row.email && (
                        <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1 hover:text-[#1B3172]">
                          <Mail className="w-3 h-3" /> {row.email}
                        </a>
                      )}
                      {row.phone && (
                        <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1 hover:text-[#1B3172]">
                          <Phone className="w-3 h-3" /> {row.phone}
                        </a>
                      )}
                      <span>{new Date(row.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      {row.page && <span className="font-mono">{row.page}</span>}
                    </div>
                  </div>

                  {typeof row.score === 'number' && row.url && (
                    <span className={`text-xs font-semibold rounded-lg px-2 py-1 ${scoreClass(row.score)}`}>
                      {row.score}/100
                    </span>
                  )}

                  <select
                    value={row.status}
                    onChange={(e) => setRowStatus(row.id, e.target.value)}
                    className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer ${STATUS_STYLE[row.status] || ''}`}
                  >
                    {tab.statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {row.url && (
                  <div className="mt-2 pl-3 border-l-2 border-slate-200">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 text-sm text-[#1B3172] font-medium hover:underline break-all"
                    >
                      {row.url} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    {row.top_issues?.length > 0 && (
                      // The opening line for the call, already written.
                      <p className="text-xs text-[#64748b] mt-1">
                        Worst findings: {row.top_issues.join(' · ')}
                      </p>
                    )}
                  </div>
                )}

                {row.message && (
                  <p className="text-sm text-[#475569] mt-2 whitespace-pre-wrap border-l-2 border-slate-200 pl-3">
                    {row.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-[#94a3b8] mt-3">
            Showing {data.items.length} of {data.total}.
          </p>
        </>
      )}
    </div>
  );
}
