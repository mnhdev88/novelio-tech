import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Clock, ArrowRight, Phone, MessageCircle, CheckCircle, ChevronRight, Tag, Eye } from 'lucide-react';
import SEO from '../components/SEO';
import { BLOG_POSTS, COMPANY, SERVICES, PHONE_TEL } from '../data/siteData';
import NotFoundPage from './NotFoundPage';

const ARTICLE_CSS = `
.blog-article-root{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff;line-height:1.75;font-size:17px}
.blog-article-root a{color:#0057d9;text-decoration:none}
.blog-article-root a:hover{text-decoration:underline}
.blog-article-root .container{max-width:820px;margin:0 auto;padding:40px 24px}
.blog-article-root header.hero{background:linear-gradient(135deg,#0057d9 0%,#00b4d8 100%);color:#fff;padding:60px 24px;text-align:center}
.blog-article-root header.hero h1{font-size:2.2rem;line-height:1.3;max-width:720px;margin:0 auto 16px}
.blog-article-root header.hero .meta{font-size:.9rem;opacity:.85}
.blog-article-root .toc{background:#f0f7ff;border-left:4px solid #0057d9;padding:20px 24px;border-radius:6px;margin:32px 0}
.blog-article-root .toc h2{font-size:1.1rem;margin-bottom:12px;color:#0057d9}
.blog-article-root .toc ol{padding-left:20px}
.blog-article-root .toc li{margin:6px 0}
.blog-article-root h2{font-size:1.55rem;color:#0057d9;margin:48px 0 16px;border-bottom:2px solid #e8f0fe;padding-bottom:8px}
.blog-article-root h3{font-size:1.2rem;color:#1a1a2e;margin:32px 0 12px}
.blog-article-root p{margin-bottom:18px}
.blog-article-root ul,.blog-article-root ol{padding-left:24px;margin-bottom:18px}
.blog-article-root li{margin:8px 0}
.blog-article-root .highlight-box{background:#e8f0fe;border-left:4px solid #0057d9;padding:16px 20px;border-radius:4px;margin:24px 0;font-style:italic}
.blog-article-root .stat-box{background:#fff3cd;border:1px solid #ffc107;border-radius:6px;padding:16px 20px;margin:24px 0}
.blog-article-root .stat-box strong{color:#856404}
.blog-article-root table{width:100%;border-collapse:collapse;margin:24px 0;font-size:.95rem}
.blog-article-root th{background:#0057d9;color:#fff;padding:12px 14px;text-align:left}
.blog-article-root td{padding:11px 14px;border-bottom:1px solid #e0e7ff}
.blog-article-root tr:nth-child(even) td{background:#f8f9ff}
.blog-article-root .cta-box{background:linear-gradient(135deg,#0057d9 0%,#00b4d8 100%);color:#fff;padding:40px 32px;border-radius:12px;text-align:center;margin:48px 0}
.blog-article-root .cta-box h2{color:#fff;border:none;margin:0 0 12px;font-size:1.7rem}
.blog-article-root .cta-box p{margin-bottom:24px;font-size:1.05rem;opacity:.95}
.blog-article-root .cta-btn{display:inline-block;background:#fff;color:#0057d9;font-weight:700;font-size:1rem;padding:14px 32px;border-radius:6px;transition:transform .2s}
.blog-article-root .cta-btn:hover{transform:translateY(-2px);text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.2)}
.blog-article-root .faq-item{border:1px solid #e0e7ff;border-radius:8px;padding:20px 24px;margin:16px 0}
.blog-article-root .faq-item h3{margin:0 0 10px;color:#0057d9;font-size:1.05rem}
.blog-article-root .author-box{display:flex;align-items:center;gap:20px;background:#f8f9ff;border:1px solid #e0e7ff;border-radius:8px;padding:20px 24px;margin:40px 0}
.blog-article-root .author-avatar{width:64px;height:64px;border-radius:50%;background:#0057d9;display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.5rem;font-weight:700;flex-shrink:0}
.blog-article-root .tag{display:inline-block;background:#e8f0fe;color:#0057d9;font-size:.8rem;padding:4px 10px;border-radius:20px;margin:0 4px 8px 0;font-weight:600}
.blog-article-root img{max-width:100%;height:auto}
.blog-article-root figure{margin:36px 0}
.blog-article-root figure img{width:100%;display:block;border-radius:10px;border:1px solid #e0e7ff;box-shadow:0 4px 16px rgba(15,23,42,.08)}
.blog-article-root figcaption{font-size:.85rem;color:#64748b;text-align:center;margin-top:10px;line-height:1.5}
@media(max-width:600px){.blog-article-root header.hero h1{font-size:1.6rem}.blog-article-root h2{font-size:1.3rem}}
`;

const CTA_ITEMS = [
  'Website & UX review',
  'SEO gap analysis',
  'Lead conversion check',
  'Honest, actionable report',
];

export default function BlogPostPage() {
  const { slug } = useParams();
  const published = BLOG_POSTS.find((p) => p.slug === slug);

  // ?preview=1 renders the unpublished draft instead of the built version, so
  // the client can see exactly how a post will look — real navbar, real footer,
  // real article styling — before committing to a 4-minute deploy.
  //
  // The draft comes from the admin API, which requires a signed-in session, so
  // a stranger following a preview link just gets the normal page (or a 404 for
  // a post that was never published). Nothing unpublished leaks.
  const isPreview = new URLSearchParams(useLocation().search).get('preview') === '1';
  const [draft, setDraft] = useState(null);
  const [draftState, setDraftState] = useState(isPreview ? 'loading' : 'off');

  useEffect(() => {
    if (!isPreview) return undefined;
    let cancelled = false;

    fetch(`/api/admin/content.php?path=${encodeURIComponent(`content/blog/${slug}.json`)}`,
      { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('no draft'))))
      .then((d) => {
        if (cancelled) return;
        setDraft(d.payload);
        setDraftState('ready');
      })
      .catch(() => { if (!cancelled) setDraftState('denied'); });

    return () => { cancelled = true; };
  }, [isPreview, slug]);

  const post = (isPreview && draft) ? draft : published;

  if (isPreview && draftState === 'loading') {
    return (
      <main className="pt-32 pb-32 grid place-items-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1B3172] animate-spin" />
      </main>
    );
  }

  if (!post?.content) return <NotFoundPage />;

  const recentPosts = BLOG_POSTS
    .filter((p) => p.slug !== slug)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  const categories = [...new Set(BLOG_POSTS.map((p) => p.category))];

  return (
    <>
      <SEO
        title={post.title}
        description={post.metaDescription || post.excerpt}
        canonical={`/blog/${post.slug}`}
        keywords={post.schema?.['@graph']?.[0]?.keywords}
        image={post.image}
        type="article"
        schema={isPreview ? undefined : post.schema}
        // A preview must never be indexed: it is a draft at a URL that may not
        // exist yet, and its schema would describe a page Google cannot fetch.
        noindex={isPreview}
      />
      <style>{ARTICLE_CSS}</style>

      {isPreview && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1B3172] text-white px-4 py-2.5">
          <div className="max-w-[1320px] mx-auto flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Eye className="w-4 h-4" />
              Preview
            </span>
            <span className="text-xs text-white/70">
              {draft
                ? 'This is your unpublished draft. Visitors still see the published version.'
                : 'Showing the published version — no unsaved draft was found.'}
            </span>
            <div className="flex-1" />
            <Link
              to={`/admin/blog/${slug}`}
              className="text-xs font-semibold underline underline-offset-2 hover:text-white/80"
            >
              Back to editing
            </Link>
          </div>
        </div>
      )}

      <main className={`pt-20 bg-white ${isPreview ? 'pb-16' : ''}`}>
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-14 items-start">

            {/* ── Main Article ── */}
            <div className="flex-1 min-w-0">
              <div className="blog-article-root">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 lg:sticky lg:top-24 lg:self-start space-y-5 pb-12 lg:pt-0">

              {/* ── CTA Widget ── */}
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-gradient-to-br from-[#4f46e5] via-[#7c3aed] to-[#0ea5e9] p-6 text-white">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full mb-3">
                    Free Offer
                  </span>
                  <h3 className="text-xl font-bold leading-snug mb-2">
                    Get a Free 30-Min Website Audit
                  </h3>
                  <p className="text-sm text-white/85 leading-relaxed mb-4">
                    We analyze your website, SEO, and lead pipeline — then show you exactly what to fix. Zero cost. No commitment.
                  </p>
                  <ul className="space-y-2 mb-5">
                    {CTA_ITEMS.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                        <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className="block w-full text-center bg-white text-[#4f46e5] font-bold text-sm py-3 px-4 rounded-xl hover:bg-white/90 transition-all hover:shadow-lg"
                  >
                    Book Your Free Audit →
                  </Link>
                </div>
                <div className="bg-[#f8f9ff] border border-t-0 border-slate-200 p-4 flex gap-3">
                  <a
                    href={PHONE_TEL}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-200 rounded-xl py-2.5 text-xs font-semibold text-[#1B3172] hover:border-[#4f46e5] hover:text-[#4f46e5] transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Us
                  </a>
                  <a
                    href={`https://wa.me/${COMPANY.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#1ebe5d] transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>

              {/* ── Recent Posts Widget ── */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-[#1B3172] text-[15px]">Recent Articles</h3>
                  <Link to="/blog" className="text-[11px] text-[#4f46e5] font-semibold hover:underline">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentPosts.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/blog/${p.slug}`}
                      className="flex gap-3 p-4 hover:bg-[#f8f9ff] transition-colors group"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        className="w-[60px] h-[52px] object-cover rounded-lg shrink-0 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="min-w-0">
                        <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded-full bg-gradient-to-r ${p.categoryColor} inline-block mb-1`}>
                          {p.category}
                        </span>
                        <p className="text-[13px] font-semibold text-[#1B3172] leading-snug line-clamp-2 group-hover:text-[#4f46e5] transition-colors">
                          {p.title}
                        </p>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <Clock className="w-3 h-3" />{p.readTime} &middot; {p.date}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-slate-100">
                  <Link
                    to="/blog"
                    className="text-sm text-[#4f46e5] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    All Articles <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* ── Services Widget ── */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-[#1B3172] text-[15px]">Our Services</h3>
                </div>
                <div className="p-2">
                  {SERVICES.slice(0, 6).map((svc) => (
                    <Link
                      key={svc.id}
                      to={svc.slug}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f0f4ff] group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-br ${svc.color} shrink-0`} />
                        <span className="text-[13px] text-[#334155] group-hover:text-[#4f46e5] font-medium transition-colors">
                          {svc.short}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#4f46e5] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-slate-100">
                  <Link
                    to="/services"
                    className="text-sm text-[#4f46e5] font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    All Services <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* ── Category Tags Widget ── */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-[#1B3172] text-[15px] mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#4f46e5]" /> Browse by Topic
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to="/blog"
                      className="text-xs font-semibold px-3 py-1.5 bg-[#eef2ff] text-[#4f46e5] rounded-full hover:bg-[#4f46e5] hover:text-white transition-all border border-[#c7d2fe] hover:border-[#4f46e5]"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Contact Card ── */}
              <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] rounded-2xl p-5 text-white shadow-xl">
                <h3 className="font-bold text-base mb-1">Have a Question?</h3>
                <p className="text-xs text-white/70 mb-4 leading-relaxed">
                  Our team is happy to help. Reach out directly and we'll get back to you within 1 business day.
                </p>
                <div className="space-y-2 text-xs text-white/80 mb-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#818cf8] shrink-0" />
                    <a href={PHONE_TEL} className="hover:text-white transition-colors">
                      {COMPANY.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                    <a
                      href={`https://wa.me/${COMPANY.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      WhatsApp Us
                    </a>
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="block w-full text-center text-xs font-bold py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                >
                  Send a Message →
                </Link>
              </div>

            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
