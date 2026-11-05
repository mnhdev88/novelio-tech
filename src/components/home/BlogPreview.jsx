import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../../data/siteData';

function BlogCard({ post, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true }}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="group flex flex-col h-full rounded-3xl overflow-hidden bg-white border border-[#0D246A]/15 transition-shadow duration-200 hover:shadow-[0_18px_44px_rgba(8,22,72,0.14)]"
      >
        <div className="relative overflow-hidden h-52">
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className={`absolute top-4 left-4 text-xs font-600 text-white px-3 py-1.5 rounded-full bg-gradient-to-r ${post.categoryColor}`}>
            {post.category}
          </span>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <span className="text-xs text-[#5C6685] flex items-center gap-1.5 mb-3">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />{post.readTime}
          </span>

          <h3 className="font-heading font-700 text-xl mb-3 leading-snug line-clamp-2 decoration-2 underline-offset-4 group-hover:underline">
            {post.title}
          </h3>

          <p className="text-[#3F4A6B] text-sm leading-relaxed flex-1 mb-5 line-clamp-2">{post.excerpt}</p>

          <div className="flex items-center justify-between text-xs text-[#5C6685] pt-4 border-t border-[#0D246A]/10">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0D246A] flex items-center justify-center text-white text-[10px] font-700">
                {post.author[0]}
              </span>
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
    <section className="section-pad bg-[#FBFAF6]">
      <div className="container-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 mb-10">
          <div>
            <div className="section-label">Insights & Resources</div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-800 leading-[1.05]">
              Latest <span className="gradient-text">from Our Blog</span>
            </h2>
          </div>
          <Link to="/blog" className="btn-ghost whitespace-nowrap group flex-shrink-0">
            View All Articles
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>

        {/* Newsletter teaser */}
        <div className="on-dark mt-8 rounded-3xl p-7 lg:p-9 flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-[#0D246A] text-white">
          <div className="flex-1">
            <div className="text-white font-heading font-700 text-2xl">Get digital marketing insights in your inbox</div>
            <div className="text-white/85 text-sm mt-1.5">Join 2,000+ marketers reading our weekly newsletter.</div>
          </div>
          <Link to="/contact" className="btn-primary flex-shrink-0 text-[15px] py-3 px-6">
            Subscribe Free
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
