import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, User, ArrowRight, Search } from 'lucide-react';
import SEO from '../components/SEO';
import { BLOG_POSTS } from '../data/siteData';
import CTABanner from '../components/home/CTABanner';

const CATEGORIES = ['All', 'SEO', 'PPC', 'Social Media', 'Web Dev', 'Email Marketing', 'Content'];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = BLOG_POSTS.filter((post) => {
    const matchCat = activeCategory === 'All' || post.category === activeCategory;
    const matchSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const featured = [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date))[0];

  return (
    <main className="pt-20">
      <SEO
        title="Blog — Digital Marketing Tips for Small Businesses"
        description="Expert guides on SEO, Google Ads, web design, email marketing, and social media for small business owners. Free actionable advice from Novelio Technologies."
        canonical="/blog"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          '@id': 'https://noveliotech.com/blog#collection',
          name: 'Novelio Technologies Blog',
          description: 'Expert guides on SEO, Google Ads, web design, email marketing, and social media for small business owners.',
          url: 'https://noveliotech.com/blog',
          publisher: { '@type': 'Organization', '@id': 'https://noveliotech.com/#business', name: 'Novelio Technologies LLC' },
          hasPart: BLOG_POSTS.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            url: `https://noveliotech.com/blog/${post.slug}`,
          })),
        }}
      />
      {/* Hero */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="section-label mx-auto mb-4">Insights & Resources</div>
            <h1 className="text-5xl lg:text-7xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
              Digital Marketing <span className="gradient-text">Blog</span>
            </h1>
            <p className="text-[#475569] text-xl max-w-2xl mx-auto mb-10">
              Expert guides, tips, and industry insights to help you grow your business online.
            </p>
            {/* Search */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-[#1B3172] placeholder-slate-400 focus:outline-none focus:border-brand-purple/60 transition-colors text-[15px]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured post */}
      {featured && (
        <section className="pb-0 pt-4 bg-[#EEF2FF]">
          <div className="container-xl">
            <Link to={`/blog/${featured.slug}`} className="group block glass-card gradient-border rounded-3xl overflow-hidden grid md:grid-cols-2 hover:shadow-glow transition-all duration-300">
              <div className="relative h-64 md:h-auto overflow-hidden">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                <span className={`absolute top-5 left-5 text-xs font-600 text-white px-3 py-1.5 rounded-full bg-gradient-to-r ${featured.categoryColor}`}>
                  Featured • {featured.category}
                </span>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-xs text-[#64748b] mb-4">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{featured.author}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime}</span>
                  <span>{featured.date}</span>
                </div>
                <h2 className="text-[#1B3172] font-heading font-700 text-2xl md:text-3xl mb-4 leading-snug group-hover:gradient-text transition-all">
                  {featured.title}
                </h2>
                <p className="text-[#475569] mb-6 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-2 text-brand-purple font-medium text-sm group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Category filter */}
      <section className="py-10 bg-[#EEF2FF]">
        <div className="container-xl">
          <div className="flex flex-wrap gap-3 justify-center">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'glass-card text-[#475569] hover:text-[#1B3172] border-slate-200'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="section-pad-sm bg-[#EEF2FF] pt-0">
        <div className="container-xl">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#64748b]">No articles found matching your search.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }} viewport={{ once: true }}>
                  <Link to={`/blog/${post.slug}`}
                    className="group glass-card gradient-border rounded-2xl overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-300 hover:shadow-glow block h-full">
                    <div className="relative overflow-hidden h-48">
                      <img src={post.image} alt={post.title} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className={`absolute top-4 left-4 text-xs font-600 text-white px-3 py-1.5 rounded-full bg-gradient-to-r ${post.categoryColor}`}>
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-[#1B3172] font-heading font-600 text-lg mb-3 leading-snug group-hover:gradient-text transition-all line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[#64748b] text-sm leading-relaxed flex-1 mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-[#64748b]">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                        </div>
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
