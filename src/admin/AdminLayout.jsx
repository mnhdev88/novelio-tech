// Panel shell: header (with the publish control), sidebar, and the routed page.

import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  FileText, LayoutTemplate, DollarSign, Inbox, Users, ScrollText, House,
  Home, LogOut, Menu, X, ExternalLink, MessageSquareQuote, HelpCircle,
  PanelTop, PanelBottom, Phone, CloudUpload,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAdmin } from './AdminContext';
import PublishButton from './PublishButton';

// Grouped rather than one flat list: ten equal-weight links give no sense of
// where anything lives, and the two halves behave differently — editing content
// needs publishing, the business section is live data that does not.
// `cap` hides a section the signed-in role cannot use; the server enforces the
// same list, so this only avoids showing a door that will not open.
const NAV = [
  {
    items: [{ to: '/admin', end: true, icon: Home, label: 'Overview' }],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/home',         icon: House,              label: 'Home page' },
      { to: '/admin/blog',         icon: FileText,           label: 'Blog' },
      { to: '/admin/pages',        icon: LayoutTemplate,     label: 'Pages & SEO' },
      { to: '/admin/testimonials', icon: MessageSquareQuote, label: 'Testimonials' },
      { to: '/admin/faq',          icon: HelpCircle,         label: 'Questions & answers' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { to: '/admin/header',  icon: PanelTop,     label: 'Header' },
      { to: '/admin/footer',  icon: PanelBottom,  label: 'Footer' },
      { to: '/admin/contact', icon: Phone,        label: 'Contact details' },
      { to: '/admin/pricing', icon: DollarSign,   label: 'Pricing', cap: 'pricing.write' },
    ],
  },
  {
    title: 'Publishing',
    items: [
      { to: '/admin/unpublished', icon: CloudUpload, label: 'Unpublished', badge: 'pending' },
    ],
  },
  {
    title: 'Business',
    items: [
      { to: '/admin/leads',    icon: Inbox,      label: 'Leads',    cap: 'leads.read' },
      { to: '/admin/team',     icon: Users,      label: 'Team',     cap: 'users.manage' },
      { to: '/admin/activity', icon: ScrollText, label: 'Activity', cap: 'audit.read' },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout, can, pending } = useAdmin();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const doLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  // Drop any group left empty once this role's hidden links are removed, so a
  // section heading never sits above nothing.
  const groups = NAV
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.cap || can(i.cap)) }))
    .filter((g) => g.items.length > 0);

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 pl-3 pr-2.5 py-2 rounded-lg text-[13px] transition-colors ${
      isActive
        ? 'bg-white text-[#1B3172] font-semibold shadow-[0_1px_2px_rgba(27,49,114,0.06)]'
        : 'text-[#5b6b8c] font-medium hover:bg-white/60 hover:text-[#1B3172]'
    }`;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* The panel must never be indexed, and must never end up in the sitemap. */}
      <SEO title="Site manager" canonical="/admin" noindex />

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 -ml-2 text-[#475569] cursor-pointer"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <img src="/logo.png" alt="" className="h-6 w-auto hidden sm:block" />
          <span className="font-heading font-800 text-[#1B3172] text-[15px]">Site manager</span>

          <div className="flex-1" />

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1B3172] transition-colors"
          >
            View site <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <PublishButton />

          <span className="hidden sm:block w-px h-5 bg-slate-200" />

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue grid place-items-center text-white text-[11px] font-bold shrink-0">
              {user.name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-semibold text-[#1B3172]">{user.name}</p>
              <p className="text-[11px] text-[#94a3b8] capitalize">{user.role}</p>
            </div>
          </div>

          <button
            onClick={doLogout}
            className="p-2 rounded-lg text-[#94a3b8] hover:bg-[#F1F5F9] hover:text-[#1B3172] transition-colors cursor-pointer"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside
          className={`${menuOpen ? 'block' : 'hidden'} lg:block fixed lg:sticky top-14 left-0 z-20
                      w-64 h-[calc(100vh-3.5rem)] shrink-0 bg-[#F6F8FD] border-r border-slate-200
                      px-2.5 py-4 overflow-y-auto`}
        >
          <nav>
            {groups.map((group, gi) => (
              <div key={group.title || `g${gi}`} className={gi === 0 ? '' : 'mt-5'}>
                {group.title && (
                  <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
                    {group.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map(({ to, end, icon: Icon, label, badge }) => (
                    <NavLink key={to} to={to} end={end} className={linkClass} onClick={() => setMenuOpen(false)}>
                      {({ isActive }) => (
                        <>
                          {/* Accent bar on the active row: the strongest "you are
                              here" signal that does not rely on colour alone. */}
                          <span
                            className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-gradient-to-b from-brand-purple to-brand-blue transition-opacity ${
                              isActive ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1B3172]' : 'text-[#94a3b8] group-hover:text-[#1B3172]'}`} />
                          <span className="truncate flex-1">{label}</span>
                          {badge === 'pending' && pending.length > 0 && (
                            <span className="inline-grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-100 text-amber-700 text-[11px] font-bold leading-none">
                              {pending.length}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Tapping the page behind an open mobile menu should close it. */}
        {menuOpen && (
          <div
            className="lg:hidden fixed inset-0 top-14 z-10 bg-black/20"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
        )}

        {/* ── Page ──────────────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
