import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';
import CTABanner from '../components/home/CTABanner';
import { STATES, getCitiesForState } from '../data/locationData';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true },
});

const hubSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Locations — Novelio Technologies',
  description: 'Novelio Technologies serves small businesses across the US. Find your city and see how we can grow your local digital presence.',
  url: 'https://www.noveliotech.com/locations',
  publisher: {
    '@type': 'Organization',
    name: 'Novelio Technologies LLC',
    url: 'https://www.noveliotech.com',
  },
};

export default function LocationHubPage() {
  return (
    <main className="pt-20">
      <SEO
        title="Locations — Digital Growth Services Across the US"
        description="Novelio serves small businesses in Austin, Houston, Miami, Tampa, Denver, and more — AI-powered websites, local SEO, and lead generation."
        canonical="/locations"
        keywords={['local SEO services', 'small business digital marketing', 'website design near me', 'Novelio Technologies locations']}
        schema={hubSchema}
      />

      {/* ── Hero ── */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[600px] h-[600px] -top-64 -left-48 opacity-10" />
        <div className="orb orb-cyan w-[400px] h-[400px] -bottom-48 -right-48 opacity-8" />
        <div className="dot-grid absolute inset-0 opacity-40" />

        <div className="container-xl relative z-10 text-center">
          <motion.div {...fadeUp(0)}>
            <div className="section-label mx-auto mb-4">
              <MapPin className="w-3.5 h-3.5" />
              Cities We Serve
            </div>
            <h1 className="text-5xl lg:text-7xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
              Local Growth, <span className="gradient-text">Everywhere You Are</span>
            </h1>
            <p className="text-[#475569] text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              We help small businesses across the US rank higher on Google, generate more leads, and grow faster — with strategies built specifically for their city and market.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:+19082012264" className="btn-primary text-base px-8 py-4">
                Get Your Free Local Audit
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link to="/services" className="btn-ghost text-base px-8 py-4">
                View All Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Why Local SEO Matters ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">Why It Matters</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              Your City. Your Customers. Your Rankings.
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Generic digital marketing doesn't cut it in competitive local markets. We build hyper-local strategies that match exactly what your customers are searching for.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { stat: '46%', desc: 'of all Google searches have local intent — people looking for businesses near them.' },
              { stat: '76%', desc: 'of people who search for a local business on mobile visit that business within 24 hours.' },
              { stat: '28%', desc: 'of local searches result in a purchase. Local SEO is the highest-intent channel available.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-2xl p-8 text-center"
              >
                <div className="text-5xl font-heading font-800 gradient-text mb-3">{item.stat}</div>
                <p className="text-[#475569] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── State + City Grid ── */}
      <section className="section-pad bg-dark">
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />
        <div className="container-xl relative z-10">
          <motion.div className="text-center mb-14" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">Select Your Location</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              Find Your City
            </h2>
            <p className="text-[#475569] text-lg max-w-xl mx-auto">
              Select your state and city to see a tailored growth strategy for your local market.
            </p>
          </motion.div>

          <div className="space-y-12">
            {STATES.map((stateData, si) => {
              const cities = getCitiesForState(stateData.stateSlug);
              return (
                <motion.div key={stateData.stateSlug} {...fadeUp(si * 0.12)}>
                  {/* State header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stateData.gradient} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-heading font-700 text-sm">{stateData.stateCode}</span>
                    </div>
                    <div>
                      <Link
                        to={`/locations/${stateData.stateSlug}`}
                        className="text-2xl font-heading font-700 text-[#1B3172] hover:text-[#6B3FA0] transition-colors"
                      >
                        {stateData.state}
                      </Link>
                      <p className="text-[#64748b] text-sm mt-0.5">{stateData.description}</p>
                    </div>
                  </div>

                  {/* City cards */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-16">
                    {cities.map((city) => (
                      <Link
                        key={city.citySlug}
                        to={`/locations/${city.stateSlug}/${city.citySlug}`}
                        className="group bg-white border border-[#E2E8F0] rounded-2xl p-6 hover:border-[#6B3FA0] hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-heading font-700 text-[#1B3172] group-hover:text-[#6B3FA0] transition-colors">
                              {city.city}, {city.stateCode}
                            </h3>
                            <p className="text-xs text-[#64748b] mt-0.5">Pop. {city.population}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#6B3FA0] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {city.industries.slice(0, 2).map((ind) => (
                            <span key={ind} className="text-[10px] bg-[#EEF2FF] text-[#4338CA] rounded-full px-2.5 py-0.5 font-medium">
                              {ind}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}

                    {/* Coming soon placeholder */}
                    <div className="bg-[#F8FAFF] border border-dashed border-[#CBD5E1] rounded-2xl p-6 flex items-center justify-center">
                      <p className="text-sm text-[#64748b] text-center">More cities coming soon</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What We Do In Every City ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">Our Services</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              What We Build for Local Businesses
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Every city page is backed by the same full-service growth system — tailored to your local market.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Local SEO', desc: 'City-specific keyword targeting, on-page optimization, and content that ranks for local searches.', link: '/services/search-engine-optimization' },
              { title: 'Google Business Profile', desc: 'Full GBP optimization, review strategy, and local citation building to dominate Google Maps.', link: '/services/google-business' },
              { title: 'Website Design', desc: 'Fast, mobile-first websites built to convert local visitors into leads and customers.', link: '/services/website-development' },
              { title: 'Lead Generation', desc: 'Forms, funnels, and follow-up systems that capture and convert local traffic automatically.', link: '/services/lead-generation' },
              { title: 'Automation & CRM', desc: 'Connect your tools and automate follow-ups so no local lead falls through the cracks.', link: '/services/automation' },
              { title: 'Branding', desc: 'Consistent identity and messaging that builds trust with local customers at every touchpoint.', link: '/services/branding' },
            ].map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}>
                <Link
                  to={s.link}
                  className="group flex flex-col h-full bg-[#F8FAFF] border border-[#E2E8F0] rounded-2xl p-7 hover:border-[#6B3FA0] hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-heading font-700 text-[#1B3172] group-hover:text-[#6B3FA0] transition-colors">{s.title}</h3>
                    <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#6B3FA0] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-[#475569] text-sm leading-relaxed">{s.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust strip ── */}
      <section className="py-10 bg-[#F8FAFF] border-y border-[#E2E8F0]">
        <div className="container-xl">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-[#64748b]">
            {[
              '200+ Small Businesses Served',
              'Dover, DE Registered',
              '4.9★ Google Reviews',
              '12+ Years Experience',
              'Free 30-Min Growth Audit',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
