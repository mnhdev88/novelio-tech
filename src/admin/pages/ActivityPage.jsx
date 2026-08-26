import { useEffect, useState } from 'react';
import * as api from '../api';
import { inputCls, ErrorNote, Spinner, PageHeader } from '../ui';

// Plain-English labels — an audit log nobody can read is not accountability.
const ACTION_LABEL = {
  'auth.login': 'Signed in',
  'auth.logout': 'Signed out',
  'content.save': 'Edited',
  'content.delete': 'Deleted',
  'content.discard': 'Discarded a draft of',
  'content.publish': 'Published to the live site',
  'media.upload': 'Uploaded image',
  'leads.status': 'Changed lead status',
  'leads.export': 'Exported',
  'users.create': 'Added team member',
  'users.update': 'Updated team member',
  'users.delete': 'Removed team member',
};

export default function ActivityPage() {
  const [data, setData] = useState(null);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  // Fetch inside the effect so every state update happens after an await, and
  // so a slow earlier request can never land on top of a newer one.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.audit.list({ action, page });
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => { cancelled = true; };
  }, [action, page]);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Activity" subtitle="Every change made in the panel, newest first." />

      <ErrorNote>{error}</ErrorNote>

      <select
        value={action}
        onChange={(e) => { setAction(e.target.value); setPage(1); }}
        className={`${inputCls} w-auto mb-4`}
      >
        <option value="">All activity</option>
        {(data?.actions || []).map((a) => <option key={a} value={a}>{ACTION_LABEL[a] || a}</option>)}
      </select>

      {!data ? <Spinner /> : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {data.items.map((row) => (
              <div key={row.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-4 py-2.5 border-b border-slate-100 last:border-0">
                <span className="text-sm font-semibold text-[#1B3172]">{row.user_email || 'system'}</span>
                <span className="text-sm text-[#475569]">{ACTION_LABEL[row.action] || row.action}</span>
                {row.target && (
                  <span className="text-xs font-mono text-[#64748b] truncate">
                    {String(row.target).replace(/^content\//, '')}
                  </span>
                )}
                <div className="flex-1" />
                <span className="text-xs text-[#94a3b8]">
                  {new Date(row.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            ))}

            {data.items.length === 0 && (
              <p className="px-4 py-6 text-sm text-[#94a3b8] text-center">Nothing recorded yet.</p>
            )}
          </div>

          {data.pages > 1 && (
            <div className="flex items-center gap-3 mt-4">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#475569] disabled:opacity-40 cursor-pointer">
                Previous
              </button>
              <span className="text-xs text-[#94a3b8]">Page {data.page} of {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#475569] disabled:opacity-40 cursor-pointer">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
