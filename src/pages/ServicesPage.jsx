import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, TrendingUp, Share2, Code2, ShoppingCart, FileText, Palette, Mail, Briefcase } from 'lucide-react';
import { SERVICES } from '../data/siteData';
import ProcessSection from '../components/home/ProcessSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CTABanner from '../components/home/CTABanner';

const ICON_MAP = { Search, TrendingUp, Share2, Code2, ShoppingCart, FileText, Palette, Mail, Briefcase };

export default function ServicesPage() {
  return (
    <main className="pt-20">
      <SEO
        title="Digital Growth Services for Small Businesses"
        description="Website & SEO, Google Business Profile optimization, lead generation, automation, branding, email marketing and more — all under one roof. Free 30-min audit."
        canonical="/services"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          '@id': 'https://noveliotech.com/services#list',
          name: 'Digital Growth Services for Small Businesses',
          description: 'Website & SEO, Google Business Profile optimization, lead generation, automation, branding, email marketing and more.',
          url: 'https://noveliotech.com/services',
          numberOfItems: SERVICES.length,
          itemListElement: SERVICES.map((service, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: service.title,
            url: `https://noveliotech.com${service.slug}`,
            description: service.description,
          })),
        }}
      />
      {/* Hero */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-15" />
        <div className="orb orb-blue w-[400px] h-[400px] top-0 -right-32 opacity-10" />
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="section-label mx-auto mb-4">What We Offer</div>
            <h1 className="text-5xl lg:text-7xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
              Full-Service <span className="gradient-text">Digital Solutions</span>
            </h1>
            <p className="text-[#475569] text-xl max-w-3xl mx-auto leading-relaxed">
              From search engine domination to stunning websites and social media growth — we have every digital capability you need under one roof.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-pad bg-[#EEF2FF] relative overflow-hidden">
        <div className="line-grid absolute inset-0 opacity-40" />
        <div className="container-xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => {
              const Icon = ICON_MAP[service.icon] || Search;
              return (
                <motion.div key={service.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }} viewport={{ once: true }}>
                  <Link to={service.slug}
                    className="group glass-card gradient-border rounded-2xl p-7 flex flex-col h-full hover:-translate-y-2 transition-all duration-300 hover:shadow-glow block">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[#1B3172] font-heading font-700 text-xl mb-3">{service.title}</h3>
                    <p className="text-[#64748b] text-sm leading-relaxed flex-1 mb-6">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {service.features.slice(0, 3).map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-[#475569] text-xs">
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${service.color}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 text-brand-purple font-medium text-sm group-hover:gap-3 transition-all">
                      Explore Service
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <ProcessSection />
      <TestimonialsSection />
      <CTABanner />
    </main>
  );
}
