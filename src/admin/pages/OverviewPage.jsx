import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Inbox, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import { useAdmin } from '../AdminContext';
import * as api from '../api';

function Tile({ icon: Icon, label, value, to, hint }) {
  const inner = (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 h-full hover:border-[#1B3172] transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue grid place-items-center text-white shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{label}</p>
      </div>
      <p className="font-heading font-800 text-[#1B3172] text-2xl leading-none">{value}</p>
      {hint && <p className="text-xs text-[#94a3b8] mt-1.5">{hint}</p>}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function OverviewPage() {
  const { user, pending, deploy, can } = useAdmin();
  const [posts, setPosts] = useState(null);
  const [newLeads, setNewLeads] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api.content.list('content/blog')
      .then((r) => {
        if (cancelled) return;
        // index.json is the ordering file, not a post.
        setPosts((r.items || []).filter((i) => i.name !== 'index.json').length);
      })
      .catch(() => !cancelled && setPosts('—'));

    if (can('leads.read')) {
      api.leads.list('leads', { status: 'new' })
        .then((r) => !cancelled && setNewLeads(r.total))
        .catch(() => !cancelled && setNewLeads('—'));
    }

    return () => { cancelled = true; };
  }, [can]);

  const lastPublished = deploy?.created_at
    ? new Date(deploy.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Never';

  return (
    <div>
      <h1 className="font-heading font-800 text-[#1B3172] text-xl mb-1">
        Welcome back, {user.name.split(' ')[0]}
      </h1>
      <p className="text-sm text-[#64748b] mb-6">
        Changes save instantly. They go live when you press <strong>Publish</strong> above.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tile icon={FileText} label="Blog posts" value={posts ?? '…'} to="/admin/blog" />
        <Tile
          icon={Clock} label="Unpublished" value={pending.length}
          to="/admin/unpublished"
          hint={pending.length ? 'Waiting to go live' : 'All published'}
        />
        {can('leads.read') && (
          <Tile icon={Inbox} label="New leads" value={newLeads ?? '…'} to="/admin/leads" />
        )}
        <Tile icon={ExternalLink} label="Last published" value={lastPublished.split(',')[0]} hint={lastPublished} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-heading font-800 text-[#1B3172] mb-3">Common tasks</h2>
          <div className="space-y-1">
            {[
              { to: '/admin/blog/new', label: 'Write a new blog post' },
              { to: '/admin/pages', label: 'Edit a page title or description for Google' },
              { to: '/admin/contact', label: 'Update a phone number or email address' },
              { to: '/admin/testimonials', label: 'Add a customer review' },
            ].map((t) => (
              <Link
                key={t.to} to={t.to}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1B3172]"
              >
                {t.label}
                <ChevronRight className="w-4 h-4 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-heading font-800 text-[#1B3172] mb-3">How publishing works</h2>
          <ol className="space-y-2.5 text-sm text-[#475569]">
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#1B3172] text-xs font-bold grid place-items-center shrink-0">1</span>
              Edit anything. Your work saves as you go — nothing is live yet.
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#1B3172] text-xs font-bold grid place-items-center shrink-0">2</span>
              Press <strong>Publish</strong>. Every pending change goes out together.
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#1B3172] text-xs font-bold grid place-items-center shrink-0">3</span>
              The site rebuilds and redeploys — about 4 minutes. The bar shows progress.
            </li>
          </ol>
          <p className="text-xs text-[#94a3b8] mt-3">
            The rebuild is what keeps every page fast and visible to Google, so it is worth the wait.
          </p>
        </div>
      </div>
    </div>
  );
}
