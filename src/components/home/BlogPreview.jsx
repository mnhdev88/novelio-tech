import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../../data/siteData';

function BlogCard({ post, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/blog/${post.slug}`}
        className="group block rounded-2xl overflow-hidden flex flex-col h-full"
        style={{
          background: 'rgba(255,255,255,0.88)',
          border: hovered ? '1px solid rgba(107,63,160,0.25)' : '1px solid rgba(29,78,216,0.1)',
          boxShadow: hovered
            ? '0 20px 60px rgba(107,63,160,0.18), 0 4px 20px rgba(27,49,114,0.08)'
            : '0 4px 20px rgba(27,49,114,0.07)',
          backdropFilter: 'blur(16px)',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        }}>

        {/* Image */}
        <div className="relative overflow-hidden h-52">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.7) 0%, rgba(15,23,42,0.2) 50%, transparent 100%)' }} />

          {/* Shimmer overlay on hover */}
          {hovered && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ x: '-100%', skewX: '-15deg' }}
              animate={{ x: '200%' }}
              transition={{ duration: 0.6 }}
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }}
            />
          )}

          {/* Category badge */}
          <span className={`absolute top-4 left-4 text-xs font-600 text-white px-3 py-1.5 rounded-full bg-gradient-to-r ${post.categoryColor}`}>
            {post.category}
          </span>

          {/* Read more arrow — appears on hover */}
          <motion.div
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          {/* Reading time bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1 rounded-full bg-slate-100 flex-1">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${post.categoryColor}`}
                style={{ width: `${Math.min(parseInt(post.readTime) * 10, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-[#94a3b8] flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3" />{post.readTime}
            </span>
          </div>

          <h3 className="text-[#1B3172] font-heading font-600 text-lg mb-3 leading-snug line-clamp-2"
            style={{ color: hovered ? undefined : '#1B3172' }}>
            <span className={hovered ? 'gradient-text' : ''}>
              {post.title}
            </span>
          </h3>

          <p className="text-[#64748b] text-sm leading-relaxed flex-1 mb-4 line-clamp-2">{post.excerpt}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-[#94a3b8] pt-3"
            style={{ borderTop: '1px solid rgba(148,163,184,0.15)' }}>
            <span className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center text-white text-[9px] font-700">
                {post.author[0]}
              </div>
              {post.author}
            </span>
            <span>{post.date}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogPreview() {
  const posts = BLOG_POSTS.slice(0, 3);

  return (
    <section className="section-pad bg-dark relative overflow-hidden">
      <div className="line-grid absolute inset-0 opacity-25" />
      <div className="orb orb-purple w-[400px] h-[400px] -bottom-32 -right-32 opacity-8" />

      {/* Decorative SVG circuits */}
      <svg className="absolute top-0 left-0 w-64 h-64 opacity-[0.04] pointer-events-none" viewBox="0 0 200 200" fill="none">
        <path d="M10,100 H60 V40 H160 V100 H190" stroke="#6B3FA0" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10,130 H80 V160 H140 V130 H190" stroke="#1D4ED8" strokeWidth="1" strokeLinecap="round" />
        <circle cx="60" cy="100" r="4" fill="#6B3FA0" />
        <circle cx="160" cy="100" r="4" fill="#6B3FA0" />
        <circle cx="80" cy="160" r="3" fill="#1D4ED8" />
        <circle cx="140" cy="130" r="3" fill="#1D4ED8" />
      </svg>

      <div className="container-xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <div className="section-label mb-4">Insights & Resources</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-700 text-[#1B3172]">
              Latest <span className="gradient-text">from Our Blog</span>
            </h2>
          </div>
          <Link to="/blog" className="btn-ghost whitespace-nowrap group flex-shrink-0">
            View All Articles
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>

        {/* Newsletter teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-10 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5"
          style={{
            background: 'linear-gradient(135deg, rgba(107,63,160,0.08) 0%, rgba(29,78,216,0.08) 100%)',
            border: '1px solid rgba(107,63,160,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex-1 text-center sm:text-left">
            <div className="text-[#1B3172] font-heading font-700 text-lg">Get digital marketing insights in your inbox</div>
            <div className="text-[#64748b] text-sm mt-1">Join 2,000+ marketers reading our weekly newsletter.</div>
          </div>
          <Link to="/contact" className="btn-primary flex-shrink-0 text-sm py-3 px-6">
            Subscribe Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
