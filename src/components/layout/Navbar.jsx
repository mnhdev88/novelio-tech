import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { SERVICES } from '../../data/siteData';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services', hasDropdown: true },
    { label: 'How It Works', to: '/#how-it-works', isAnchor: true },
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
  ];

  const isActive = (to) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-[0_4px_24px_rgba(27,49,114,0.08)]'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="container-xl">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img
                src="/logo.png"
                alt="Novelio Technologies LLC"
                className="h-10 w-auto object-contain transition-all duration-300"
                loading="eager"
              />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div key={link.label} className="relative" ref={dropdownRef}>
                    <button
                      onMouseEnter={() => setServicesOpen(true)}
                      onMouseLeave={() => setServicesOpen(false)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-[15px] font-medium transition-all duration-200 ${
                        isActive(link.to) ? 'text-[#1B3172]' : 'text-[#475569] hover:text-[#1B3172]'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    <div
                      onMouseEnter={() => setServicesOpen(true)}
                      onMouseLeave={() => setServicesOpen(false)}
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
                        servicesOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      <div className="bg-white rounded-2xl p-4 w-[580px] grid grid-cols-3 gap-2 border border-slate-200 shadow-[0_8px_32px_rgba(27,49,114,0.12)]">
                        {SERVICES.map((s) => (
                          <Link
                            key={s.id}
                            to={s.slug}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white text-xs font-bold">{s.short[0]}</span>
                            </div>
                            <span className="text-[13px] font-medium text-[#334155] group-hover:text-[#1B3172] transition-colors leading-tight">
                              {s.title}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  link.isAnchor ? (
                  <a
                    key={link.label}
                    href={link.to}
                    className="px-4 py-2 rounded-lg text-[15px] font-medium transition-all duration-200 text-[#475569] hover:text-[#1B3172]"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`px-4 py-2 rounded-lg text-[15px] font-medium transition-all duration-200 ${
                      isActive(link.to) ? 'text-[#1B3172]' : 'text-[#475569] hover:text-[#1B3172]'
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
              <a href="tel:+19082012264" className="hidden lg:inline-flex btn-primary text-sm py-2.5 px-5">
                Get Free Growth Audit
              </a>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[#1B3172]"
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

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
            />
          </Link>
          <button onClick={() => setMenuOpen(false)} className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-[#1B3172]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-2">
          {navLinks.filter(l => !l.hasDropdown).map((link) => (
            <Link key={link.label} to={link.to} className="block px-4 py-3 rounded-xl text-lg font-medium text-[#334155] hover:text-[#1B3172] hover:bg-slate-50 transition-all">
              {link.label}
            </Link>
          ))}
          <div className="pt-4">
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest px-4 mb-3">Services</p>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((s) => (
                <Link key={s.id} to={s.slug} className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-all">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex-shrink-0`} />
                  <span className="text-sm text-[#475569]">{s.short}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-8">
          <a href="tel:+19082012264" className="btn-primary w-full justify-center text-base py-4">
            Get Free Growth Audit
          </a>
        </div>
      </div>
    </>
  );
}
