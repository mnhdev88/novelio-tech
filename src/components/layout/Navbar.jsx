import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowRight, Handshake, Gauge, ListChecks } from 'lucide-react';
import { SERVICES, NAVIGATION } from '../../data/siteData';

// Which services appear in the header dropdown, in this order. Google Business
// and Lead Gen stay out — they remain on /services and in the growth plans — as
// do Email Marketing and the Email Validator.
//
// This is an explicit id list rather than a positional slice: content/services.json
// is reorderable from the admin panel, so a slice would silently pull the wrong
// entries the first time someone drags a row.
const NAV_SERVICE_IDS = [
  'website-development',
  'mobile-app-development',
  'automation',
  'branding',
  'tech-ops',
  'search-engine-optimization',
];

// filter(Boolean) guards the case where a service is deleted in the admin panel
// but its id is still listed above.
const NAV_SERVICES = NAV_SERVICE_IDS
  .map((id) => SERVICES.find((s) => s.id === id))
  .filter(Boolean);

// Free tools that earn a top-level menu of their own. Adding one is a single
// entry here — both the desktop dropdown and the mobile menu read this array.
const TOOLS = [
  {
    to: '/free-seo-audit',
    title: 'Free SEO Audit',
    blurb: 'Score any website in about a minute',
    Icon: Gauge,
    color: 'from-violet-600 to-blue-600',
  },
  {
    // Deep link to the self-check on the website development page. ScrollToTop
    // in App.jsx is hash-aware, which is what makes this land on the section
    // rather than the top of the page.
    to: '/services/website-development#website-check',
    title: 'Check My Website',
    blurb: 'Six questions, an instant score',
    Icon: ListChecks,
    color: 'from-emerald-500 to-teal-600',
  },
];
import { useAuth } from '../../portal/AuthContext';
import TopBar from './TopBar';

// Which panel a dropdown link opens. An entry saved from the admin panel before
// Tools existed has no `dropdown` key at all, so the fallback has to be the
// services menu — otherwise editing a menu item's label in the CMS would quietly
// empty the dropdown underneath it.
const menuKeyFor = (link) => link.dropdown || 'services';

function ServicesMenu() {
  return (
    <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-[0_8px_32px_rgba(13,36,106,0.12)] w-[290px]">
      <div className="flex flex-col gap-0.5">
        {NAV_SERVICES.map((s) => (
          <Link
            key={s.id}
            to={s.slug}
            className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-all group"
          >
            <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white text-xs font-bold">{s.short[0]}</span>
            </div>
            <span className="text-[14px] font-medium text-[#2B3557] group-hover:text-[#0D246A] transition-colors leading-tight">
              {s.title}
            </span>
          </Link>
        ))}
      </div>
      <Link
        to="/services"
        className="mt-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border-t border-slate-100 text-[13px] font-semibold text-[#0D246A] hover:bg-slate-50 transition-all"
      >
        View all services
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function ToolsMenu() {
  return (
    <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-[0_8px_32px_rgba(13,36,106,0.12)] w-[300px]">
      <div className="flex flex-col gap-0.5">
        {TOOLS.map(({ to, title, blurb, Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="flex items-start gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-all group"
          >
            <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="min-w-0">
              <span className="block text-[14px] font-medium text-[#2B3557] group-hover:text-[#0D246A] transition-colors leading-tight">
                {title}
              </span>
              <span className="block text-[12px] text-[#5C6685] leading-snug mt-0.5">{blurb}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Which dropdown is open, by key — not a boolean, because there are two of them.
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenMenu(null);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = NAVIGATION.header.links;

  const isActive = (to) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <>
      {/* Fixed header: TopBar + Nav stacked together */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TopBar />
      <nav className="px-2 sm:px-3 pt-2">
        <div
          className={`max-w-[1280px] mx-auto rounded-2xl bg-white pl-4 pr-2.5 lg:pl-6 lg:pr-3 transition-shadow duration-300 border border-[#0D246A]/10 ${
            scrolled ? 'shadow-[0_10px_32px_rgba(8,22,72,0.18)]' : 'shadow-[0_4px_16px_rgba(8,22,72,0.08)]'
          }`}
        >
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="Novelio Technologies LLC"
                className="h-10 w-auto object-contain transition-all duration-300"
                loading="eager"
                fetchPriority="high"
                width="160"
                height="40"
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div key={link.label} className="relative">
                    <button
                      onMouseEnter={() => setOpenMenu(menuKeyFor(link))}
                      onMouseLeave={() => setOpenMenu(null)}
                      className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-[17px] font-semibold transition-all duration-200 ${
                        isActive(link.to) ? 'text-[#0D246A]' : 'text-[#3F4A6B] hover:text-[#0D246A]'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openMenu === menuKeyFor(link) ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    <div
                      onMouseEnter={() => setOpenMenu(menuKeyFor(link))}
                      onMouseLeave={() => setOpenMenu(null)}
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
                        openMenu === menuKeyFor(link) ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      {menuKeyFor(link) === 'tools' ? <ToolsMenu /> : <ServicesMenu />}
                    </div>
                  </div>
                ) : (
                  link.isAnchor ? (
                  <a
                    key={link.label}
                    href={link.to}
                    className="px-4 py-2.5 rounded-lg text-[17px] font-semibold transition-all duration-200 text-[#3F4A6B] hover:text-[#0D246A]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`px-4 py-2.5 rounded-lg text-[17px] font-semibold transition-all duration-200 ${
                      isActive(link.to) ? 'text-[#0D246A]' : 'text-[#3F4A6B] hover:text-[#0D246A]'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
                )
              )}
            </div>

            {/* CTA + Hamburger */}
            <div className="flex items-center gap-3">
              <Link to="/partners" className="hidden lg:inline-flex items-center gap-2 btn-primary text-[15px] py-3 px-6">
                <Handshake className="w-4 h-4" /> Become a Partner
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-11 h-11 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[#0D246A] cursor-pointer"
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      </div>{/* end fixed header wrapper */}

      {/* Mobile overlay menu */}
      <div
        className={`fixed inset-0 z-40 bg-white flex flex-col transition-all duration-300 lg:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Novelio Technologies LLC"
              className="h-9 w-auto object-contain"
              width="160"
              height="36"
            />
          </Link>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="w-11 h-11 rounded-lg border border-slate-200 flex items-center justify-center text-[#0D246A] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-2">
          {navLinks.filter(l => !l.hasDropdown).map((link) => (
            <Link key={link.label} to={link.to} className="block px-4 py-3 rounded-xl text-lg font-medium text-[#2B3557] hover:text-[#0D246A] hover:bg-slate-50 transition-all">
              {link.label}
            </Link>
          ))}
          <div className="pt-4">
            <p className="text-xs font-semibold text-[#5C6685] uppercase tracking-widest px-4 mb-3">Services</p>
            <div className="grid grid-cols-2 gap-2">
              {NAV_SERVICES.map((s) => (
                <Link key={s.id} to={s.slug} className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-all">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex-shrink-0`} />
                  <span className="text-sm text-[#3F4A6B]">{s.short}</span>
                </Link>
              ))}
            </div>
            <Link to="/services" className="mt-2 flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#0D246A] hover:bg-slate-50 transition-all">
              View all services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="pt-4">
            <p className="text-xs font-semibold text-[#5C6685] uppercase tracking-widest px-4 mb-3">Tools</p>
            {TOOLS.map(({ to, title, blurb, Icon, color }) => (
              <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                </div>
                <span className="min-w-0">
                  <span className="block text-sm text-[#3F4A6B]">{title}</span>
                  <span className="block text-xs text-[#5C6685] leading-snug">{blurb}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="px-6 pb-8 space-y-3">
          <Link to="/partners" className="flex w-full items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 text-base font-semibold text-[#0D246A]">
            <Handshake className="w-4 h-4" /> Become a Partner
          </Link>
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/portal/admin" className="block w-full text-center px-6 py-3.5 rounded-xl border border-slate-200 text-base font-semibold text-[#3F4A6B]">
                  Admin Back-office
                </Link>
              )}
              <Link to="/dashboard" className="btn-primary w-full justify-center text-base py-4">
                My Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="block w-full text-center px-6 py-3.5 rounded-xl border border-slate-200 text-base font-semibold text-[#3F4A6B]">
                Sign In
              </Link>
              <Link to="/pricing" className="btn-primary w-full justify-center text-base py-4">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
