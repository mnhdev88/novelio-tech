import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight, Send } from 'lucide-react';
import { FaLinkedinIn, FaXTwitter, FaInstagram, FaFacebookF, FaYoutube } from 'react-icons/fa6';
import { COMPANY, SERVICES } from '../../data/siteData';
import { useState } from 'react';

async function subscribeNewsletter(email) {
  const res = await fetch('https://crm.noveliotech.com/api/newsletter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_CRM_API_KEY,
    },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const data = await subscribeNewsletter(email);
      if (data.success) {
        setStatus('success');
        setEmail('');
      } else {
        setErrorMsg(data.message || 'Something went wrong.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  const footerServices = SERVICES.slice(0, 6);

  return (
    <footer className="relative bg-[#0E1E38] overflow-hidden">
      {/* gradient top border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brand-purple to-transparent" />

      {/* bg orbs */}
      <div className="orb orb-purple w-96 h-96 -bottom-48 -left-48" style={{ opacity: 0.2 }} />
      <div className="orb orb-blue w-96 h-96 -bottom-48 -right-48" style={{ opacity: 0.15 }} />

      <div className="container-xl relative z-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">

          {/* Brand col */}
          <div className="lg:col-span-1 md:col-span-2">
            <Link to="/" className="inline-flex mb-5">
              <img
                src="/logo.png"
                alt="Novelio Technologies LLC"
                className="h-10 w-auto object-contain"
                loading="lazy"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your end-to-end digital growth partner. We help businesses achieve measurable results through data-driven digital marketing and cutting-edge web development.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: FaLinkedinIn, href: COMPANY.social.linkedin },
                { Icon: FaXTwitter, href: COMPANY.social.twitter },
                { Icon: FaInstagram, href: COMPANY.social.instagram },
                { Icon: FaFacebookF, href: COMPANY.social.facebook },
                { Icon: FaYoutube, href: COMPANY.social.youtube },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-slate-400 hover:text-white hover:border-brand-purple/50 hover:bg-brand-purple/20 transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services col */}
          <div>
            <h4 className="text-white font-heading font-600 mb-5 text-sm uppercase tracking-widest">Services</h4>
            <ul className="space-y-3">
              {footerServices.map((s) => (
                <li key={s.id}>
                  <Link to={s.slug} className="text-slate-400 hover:text-white text-sm flex items-center gap-2 group transition-colors">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-brand-purple" />
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries col */}
          <div>
            <h4 className="text-white font-heading font-600 mb-5 text-sm uppercase tracking-widest">Industries</h4>
            <ul className="space-y-3">
              {[
                { label: 'Bookkeeping & Accounting — California', href: '/website-design-california-bookkeeping-accounting/' },
                { label: 'Bookkeeping & Accounting — Texas', href: '/website-design-texas-bookkeeping-accounting/' },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-slate-400 hover:text-white text-sm flex items-center gap-2 group transition-colors">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-brand-purple" />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company col */}
          <div>
            <h4 className="text-white font-heading font-600 mb-5 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-3">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'How It Works', to: '/#how-it-works' },
                { label: 'Blog & Resources', to: '/blog' },
                { label: 'Careers', to: '/careers' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Refund Policy', to: '/refund-policy' },
                { label: 'Disclaimer', to: '/disclaimer' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-400 hover:text-white text-sm flex items-center gap-2 group transition-colors">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-brand-purple" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter col */}
          <div>
            <h4 className="text-white font-heading font-600 mb-5 text-sm uppercase tracking-widest">Get In Touch</h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-purple mt-0.5 flex-shrink-0" />
                <a href={`mailto:${COMPANY.email}`} className="text-slate-400 hover:text-white text-sm transition-colors">{COMPANY.email}</a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-purple mt-0.5 flex-shrink-0" />
                <a href={`tel:${COMPANY.phone}`} className="text-slate-400 hover:text-white text-sm transition-colors">{COMPANY.phone}</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-purple mt-0.5 flex-shrink-0" />
                <span className="text-slate-400 text-sm">{COMPANY.address}</span>
              </li>
            </ul>

            <h4 className="text-white font-heading font-600 mb-3 text-sm uppercase tracking-widest">Newsletter</h4>
            {status === 'success' ? (
              <p className="text-emerald-400 text-sm font-medium">Thanks for subscribing!</p>
            ) : (
              <>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    disabled={status === 'loading'}
                    className="flex-1 bg-slate-800 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/60 transition-colors disabled:opacity-50"
                    required
                  />
                  <button type="submit" disabled={status === 'loading'} className="w-11 h-10 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 hover:shadow-glow transition-all disabled:opacity-60">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
                {status === 'error' && (
                  <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © 2026 Novelio Technologies LLC. All rights reserved. | Registered in Delaware, USA.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-slate-500 hover:text-white text-xs transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-white text-xs transition-colors">Terms of Service</Link>
            <a href="/sitemap.xml" className="text-slate-500 hover:text-white text-xs transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
