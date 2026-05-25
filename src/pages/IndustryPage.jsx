import { useParams, Link, Navigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Globe, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { INDUSTRIES } from '../data/siteData';

// Extracts clean domain label from a URL
function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function SiteCard({ site, index, industryColor }) {
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const timerRef = useRef(null);

  const handleLoad = () => {
    setLoaded(true);
    clearTimeout(timerRef.current);
  };

  // After 5s, if not loaded, treat as blocked/slow
  const handleStart = () => {
    timerRef.current = setTimeout(() => setBlocked(true), 5000);
  };

  const domain = getDomain(site.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(29,78,216,0.11)',
          boxShadow: '0 4px 20px rgba(27,49,114,0.08)',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 20px 56px rgba(107,63,160,0.18)';
          e.currentTarget.style.border = '1px solid rgba(107,63,160,0.25)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(27,49,114,0.08)';
          e.currentTarget.style.border = '1px solid rgba(29,78,216,0.11)';
        }}
      >
        {/* Thumbnail area */}
        <div className="relative overflow-hidden bg-slate-50" style={{ height: '185px' }}>

          {/* Iframe thumbnail */}
          {!blocked && (
            <iframe
              src={site.url}
              title={site.label}
              loading="lazy"
              scrolling="no"
              sandbox="allow-scripts allow-same-origin"
              onLoad={handleLoad}
              ref={el => { if (el) handleStart(); }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '960px',
                height: '540px',
                border: 'none',
                transformOrigin: 'top left',
                transform: 'scale(0.334)',   // 320 / 960 ≈ 0.334
                pointerEvents: 'none',
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.4s',
              }}
            />
          )}

          {/* Fallback / loading state */}
          {(!loaded || blocked) && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${industryColor.a}18 0%, ${industryColor.b}18 100%)`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${industryColor.a}, ${industryColor.b})`,
                  boxShadow: `0 4px 20px ${industryColor.a}44`,
                }}
              >
                <Globe className="w-6 h-6 text-white" />
              </div>
              {!blocked && (
                <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading preview…
                </div>
              )}
              {blocked && (
                <div className="text-xs text-[#94a3b8] text-center px-4">
                  Click to open site
                </div>
              )}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <div className="flex items-center gap-1.5 text-white text-xs font-medium">
              <ExternalLink className="w-3.5 h-3.5" />
              Open in new tab
            </div>
          </div>
        </div>

        {/* Card footer */}
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[#1B3172] font-heading font-600 text-sm truncate">{site.label}</div>
            <div className="text-[#94a3b8] text-xs truncate mt-0.5">{domain}</div>
          </div>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${industryColor.a}, ${industryColor.b})`,
              boxShadow: `0 2px 10px ${industryColor.a}40`,
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </a>
    </motion.div>
  );
}

// Parse Tailwind gradient class → hex colors for inline use
const GRADIENT_COLORS = {
  'from-rose-500 to-pink-600':      { a: '#F43F5E', b: '#DB2777' },
  'from-orange-500 to-amber-400':   { a: '#F97316', b: '#FBBF24' },
  'from-emerald-500 to-teal-600':   { a: '#10B981', b: '#0D9488' },
  'from-yellow-500 to-orange-500':  { a: '#EAB308', b: '#F97316' },
  'from-blue-600 to-indigo-700':    { a: '#2563EB', b: '#4338CA' },
  'from-violet-500 to-purple-600':  { a: '#8B5CF6', b: '#9333EA' },
  'from-cyan-500 to-blue-600':      { a: '#06B6D4', b: '#2563EB' },
  'from-slate-600 to-slate-800':    { a: '#475569', b: '#1E293B' },
  'from-gray-500 to-zinc-700':      { a: '#6B7280', b: '#3F3F46' },
  'from-pink-500 to-rose-500':      { a: '#EC4899', b: '#F43F5E' },
  'from-amber-600 to-yellow-500':   { a: '#D97706', b: '#EAB308' },
  'from-indigo-500 to-blue-700':    { a: '#6366F1', b: '#1D4ED8' },
};

export default function IndustryPage() {
  const { sector } = useParams();
  const industry = INDUSTRIES.find(ind => ind.slug === sector);

  if (!industry) return <Navigate to="/" replace />;

  const gradColors = GRADIENT_COLORS[industry.color] || { a: '#6B3FA0', b: '#1D4ED8' };

  return (
    <main className="pt-20 min-h-screen bg-[#F5F7FF]">
      <SEO
        title={`${industry.name} Website Design & Digital Marketing`}
        description={`See our ${industry.name} website portfolio. Novelio Technologies builds high-converting, SEO-optimized websites for ${industry.name.toLowerCase()} businesses.`}
        canonical={`/industries/${sector}`}
      />

      {/* Hero */}
      <section
        className="relative overflow-hidden py-16 px-4"
        style={{
          background: `linear-gradient(135deg, ${gradColors.a}18 0%, ${gradColors.b}14 100%)`,
          borderBottom: `1px solid ${gradColors.a}22`,
        }}
      >
        {/* Background orb */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: `${gradColors.a}18` }} />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: `${gradColors.b}14` }} />

        {/* Dot grid */}
        <div className="dot-grid absolute inset-0 opacity-40" />

        <div className="container-xl relative z-10">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748b] hover:text-[#1B3172] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-5"
          >
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${gradColors.a}22, ${gradColors.b}22)`,
                border: `1.5px solid ${gradColors.a}40`,
                boxShadow: `0 8px 32px ${gradColors.a}28`,
              }}
            >
              {industry.icon}
            </div>
            <div>
              <div className="section-label mb-2" style={{ display: 'inline-flex' }}>Industry Portfolio</div>
              <h1 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] leading-tight">
                {industry.name}
              </h1>
            </div>
          </motion.div>

          {industry.sites.length > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-[#475569] text-lg mt-4 max-w-2xl"
            >
              Showing {industry.sites.length} client website{industry.sites.length !== 1 ? 's' : ''} we've built in the {industry.name} sector.
              Click any card to open the full site.
            </motion.p>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="container-xl py-12">
        {industry.sites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-24"
          >
            <div className="text-6xl mb-6">{industry.icon}</div>
            <h2 className="text-2xl font-heading font-700 text-[#1B3172] mb-3">
              Coming Soon
            </h2>
            <p className="text-[#64748b] max-w-sm mx-auto mb-8">
              We're building our {industry.name} portfolio. Check back soon or contact us to be featured.
            </p>
            <Link to="/contact" className="btn-primary inline-flex">
              Get In Touch
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {industry.sites.map((site, i) => (
              <SiteCard
                key={site.url}
                site={site}
                index={i}
                industryColor={gradColors}
              />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-xl pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 text-center"
          style={{
            background: `linear-gradient(135deg, ${gradColors.a}10 0%, ${gradColors.b}10 100%)`,
            border: `1px solid ${gradColors.a}22`,
          }}
        >
          <div className="text-2xl mb-3">{industry.icon}</div>
          <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-2">
            Need a Website for Your {industry.name} Business?
          </h3>
          <p className="text-[#64748b] mb-6 max-w-md mx-auto text-sm">
            We build high-converting, SEO-optimized websites tailored specifically for the {industry.name} sector.
          </p>
          <Link to="/contact" className="btn-primary inline-flex">
            Get a Free Quote
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
