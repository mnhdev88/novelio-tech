// Panel shell: sidebar, publish bar, and the routed page.

import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  FileText, Settings, LayoutTemplate, DollarSign, Inbox, Users, ScrollText, House,
  Home, LogOut, Menu, X, ExternalLink,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useAdmin } from './AdminContext';
import PublishBar from './PublishBar';

// `cap` hides a section the signed-in role cannot use. The server enforces the
// same list — this only avoids showing a door that will not open.
const NAV = [
  { to: '/admin',           end: true, icon: Home,           label: 'Overview' },
  { to: '/admin/home',      icon: House,          label: 'Home page' },
  { to: '/admin/blog',      icon: FileText,       label: 'Blog' },
  { to: '/admin/pages',     icon: LayoutTemplate, label: 'Pages & SEO' },
  { to: '/admin/site',      icon: Settings,       label: 'Header, footer & contact' },
  { to: '/admin/pricing',   icon: DollarSign,     label: 'Pricing',   cap: 'pricing.write' },
  { to: '/admin/leads',     icon: Inbox,          label: 'Leads',     cap: 'leads.read' },
  { to: '/admin/team',      icon: Users,          label: 'Team',      cap: 'users.manage' },
  { to: '/admin/activity',  icon: ScrollText,     label: 'Activity',  cap: 'audit.read' },
];

export default function AdminLayout() {
  const { user, logout, can } = useAdmin();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const doLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const items = NAV.filter((item) => !item.cap || can(item.cap));

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive ? 'bg-[#1B3172] text-white' : 'text-[#475569] hover:bg-white hover:text-[#1B3172]'
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

          <span className="font-heading font-800 text-[#1B3172]">Novelio site manager</span>

          <div className="flex-1" />

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#1B3172]"
          >
            View site <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="hidden sm:block text-right leading-tight">
            <p className="text-xs font-semibold text-[#1B3172]">{user.name}</p>
            <p className="text-[11px] text-[#94a3b8] capitalize">{user.role}</p>
          </div>

          <button
            onClick={doLogout}
            className="p-2 text-[#475569] hover:text-[#1B3172] cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside
          className={`${menuOpen ? 'block' : 'hidden'} lg:block fixed lg:sticky top-14 left-0 z-20
                      w-64 h-[calc(100vh-3.5rem)] shrink-0 bg-[#EEF2FF] border-r border-slate-200
                      p-3 overflow-y-auto`}
        >
          <nav className="space-y-1">
            {items.map(({ to, end, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={end} className={linkClass} onClick={() => setMenuOpen(false)}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
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
          <div className="mb-5">
            <PublishBar />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
