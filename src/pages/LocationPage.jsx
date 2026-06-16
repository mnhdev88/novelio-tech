import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Star, ChevronDown, ChevronUp, CheckCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import SEO from '../components/SEO';
import CTABanner from '../components/home/CTABanner';
import { getCityData, getStateData, getCitiesForState } from '../data/locationData';
import { SERVICES } from '../data/siteData';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true },
});

// ── FAQ accordion item ────────────────────────────────────────────────────────
function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      {...fadeUp(index * 0.07)}
      className="border border-[#E2E8F0] rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-[#F8FAFF] transition-colors"
      >
        <span className="font-heading font-600 text-[#1B3172] text-base pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-[#6B3FA0] flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-[#64748b] flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-6 pb-6 bg-white text-[#475569] text-sm leading-relaxed border-t border-[#F1F5F9]">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </motion.div>
  );
}

// ── State page ────────────────────────────────────────────────────────────────
function StatePage({ stateData, cities }) {
  const stateSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Digital Marketing Services in ${stateData.state} | Novelio Technologies`,
    description: `Novelio Technologies helps small businesses across ${stateData.state} grow faster with AI-powered websites, local SEO, and lead generation.`,
    url: `https://www.noveliotech.com/locations/${stateData.stateSlug}`,
    publisher: { '@type': 'Organization', name: 'Novelio Technologies LLC', url: 'https://www.noveliotech.com' },
  };

  return (
    <main className="pt-20">
      <SEO
        title={`Digital Marketing for Small Businesses in ${stateData.state}`}
        description={`Novelio helps ${stateData.state} small businesses grow with AI-powered websites, local SEO, and lead generation. Free growth audit — no obligation.`}
        canonical={`/locations/${stateData.stateSlug}`}
        keywords={[`digital marketing ${stateData.state}`, `SEO services ${stateData.state}`, `small business ${stateData.state}`, `website design ${stateData.state}`]}
        schema={stateSchema}
      />

      {/* Hero */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[500px] h-[500px] -top-48 -left-48 opacity-12" />
        <div className="orb orb-cyan w-[400px] h-[400px] -bottom-32 -right-32 opacity-8" />
        <div className="dot-grid absolute inset-0 opacity-40" />

        <div className="container-xl relative z-10 text-center">
          <motion.div {...fadeUp(0)}>
            <div className="section-label mx-auto mb-4 flex items-center gap-1.5 justify-center">
              <MapPin className="w-3.5 h-3.5" />
              {stateData.stateCode} — {stateData.state}
            </div>
            <h1 className="text-5xl lg:text-7xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
              AI-Powered Growth for <span className="gradient-text">{stateData.state}</span> Small Businesses
            </h1>
            <p className="text-[#475569] text-xl max-w-3xl mx-auto leading-relaxed mb-10">
              {stateData.description} We build and execute tailored digital growth plans — websites, local SEO, lead generation, and automation — that drive real revenue.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:+19082012264" className="btn-primary text-base px-8 py-4">
                Get a Free Growth Audit
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link to="/locations" className="btn-ghost text-base px-8 py-4">
                ← All Locations
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* City cards */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div className="text-center mb-12" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">Cities We Serve in {stateData.state}</div>
            <h2 className="text-4xl font-heading font-800 text-[#1B3172]">Select Your City</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {cities.map((city, i) => (
              <motion.div key={city.citySlug} {...fadeUp(i * 0.1)}>
                <Link
                  to={`/locations/${city.stateSlug}/${city.citySlug}`}
                  className="group block bg-[#F8FAFF] border border-[#E2E8F0] rounded-2xl p-7 hover:border-[#6B3FA0] hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-heading font-700 text-[#1B3172] group-hover:text-[#6B3FA0] transition-colors">
                      {city.city}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#6B3FA0] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                  <p className="text-xs text-[#64748b] mb-3">Pop. {city.population} · {city.smallBusinesses} small businesses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {city.industries.slice(0, 3).map((ind) => (
                      <span key={ind} className="text-[10px] bg-[#EEF2FF] text-[#4338CA] rounded-full px-2.5 py-0.5 font-medium">{ind}</span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}

// ── City page ─────────────────────────────────────────────────────────────────
function CityPage({ city }) {
  const citySchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `https://www.noveliotech.com/locations/${city.stateSlug}/${city.citySlug}#business`,
        name: 'Novelio Technologies',
        url: 'https://www.noveliotech.com',
        telephone: '+1-908-201-2264',
        email: 'info@noveliotech.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: city.city,
          addressRegion: city.stateCode,
          addressCountry: 'US',
        },
        areaServed: { '@type': 'City', name: city.city },
        serviceType: ['Local SEO', 'Website Design', 'Digital Marketing', 'AI-Powered Business Tools', 'Google Business Profile Optimisation'],
        priceRange: '$$',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Digital Growth Services for ${city.city} Small Businesses`,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: city.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
  };

  const featuredServices = SERVICES.filter(s =>
    ['website-development', 'search-engine-optimization', 'google-business', 'lead-generation'].includes(s.id)
  );

  return (
    <main className="pt-20">
      <SEO
        title={`Website Design & SEO for Small Businesses in ${city.city}, ${city.stateCode}`}
        description={`Novelio Technologies helps ${city.city} small businesses grow faster with AI-powered websites and local SEO. Free 30-min growth audit — no obligation.`}
        canonical={`/locations/${city.stateSlug}/${city.citySlug}`}
        keywords={[
          `SEO services in ${city.city}`,
          `web design for small business ${city.city}`,
          `digital marketing ${city.city} ${city.stateCode}`,
          `${city.city} small business website`,
          `best SEO company in ${city.city}`,
          `affordable web design ${city.city}`,
        ]}
        schema={citySchema}
      />

      {/* ── Hero ── */}
      <section className="section-pad relative overflow-hidden bg-dark">
        <div className="orb orb-purple w-[600px] h-[600px] -top-64 -left-48 opacity-12" />
        <div className="orb orb-cyan w-[400px] h-[400px] -bottom-48 -right-48 opacity-8" />
        <div className="dot-grid absolute inset-0 opacity-40" />

        <div className="container-xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="section-label mx-auto mb-4 flex items-center gap-1.5 justify-center">
              <MapPin className="w-3.5 h-3.5" />
              Serving {city.city}, {city.stateCode}
            </div>
          </motion.div>

          <h1 className="text-5xl lg:text-7xl font-heading font-800 text-[#1B3172] mb-6 leading-tight">
            {['AI-Powered', 'Digital', 'Growth', 'for'].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
              >{w}</motion.span>
            ))}
            {' '}
            {[`${city.city},`, city.stateCode].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, delay: 0.44 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
                style={{ background: 'linear-gradient(135deg, #6B3FA0 0%, #1D4ED8 50%, #0EA5E9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >{w}</motion.span>
            ))}
            {' '}
            {['Small', 'Businesses'].map((w, i) => (
              <motion.span key={w}
                initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55, delay: 0.62 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-[0.22em]"
              >{w}</motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.82 }}
            className="text-[#475569] text-xl max-w-3xl mx-auto leading-relaxed mb-8"
          >
            {city.localHook}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.96 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <a href="tel:+19082012264" className="btn-primary text-base px-8 py-4 w-full sm:w-auto justify-center">
              Get Your Free {city.city} Audit
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="flex"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </a>
            <Link to="/locations" className="btn-ghost text-base px-8 py-4 w-full sm:w-auto justify-center">
              ← All Locations
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {city.stats.map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <div className="text-2xl font-heading font-800 gradient-text">{stat.value}</div>
                <div className="text-xs text-[#64748b] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">The Challenge</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              What's Holding {city.city} Businesses Back?
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              These are the three most common digital growth problems we see in {city.city} — and exactly what our audit uncovers in 30 minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {city.painPoints.map((point, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-2xl p-8"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center mb-5">
                  <span className="text-white font-heading font-700 text-sm">0{i + 1}</span>
                </div>
                <h3 className="text-lg font-heading font-700 text-[#1B3172] mb-2">{point.title}</h3>
                <p className="text-[#475569] text-sm leading-relaxed">{point.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="section-pad bg-dark">
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />
        <div className="container-xl relative z-10">
          <motion.div className="text-center mb-14" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">Our Services for {city.city}</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              Everything Your {city.city} Business Needs to Grow
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              We don't sell standalone services. We build a complete digital growth system tailored to your market in {city.city}, {city.stateCode}.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {featuredServices.map((service, i) => (
              <motion.div key={service.id} {...fadeUp(i * 0.1)}>
                <Link
                  to={service.slug}
                  className="group flex items-start gap-5 bg-white border border-[#E2E8F0] rounded-2xl p-7 hover:border-[#6B3FA0] hover:shadow-lg transition-all duration-200"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0`}>
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-heading font-700 text-[#1B3172] group-hover:text-[#6B3FA0] transition-colors">
                        {service.title} in {city.city}
                      </h3>
                      <ArrowRight className="w-4 h-4 text-[#64748b] group-hover:text-[#6B3FA0] group-hover:translate-x-1 transition-all flex-shrink-0 mt-1 ml-2" />
                    </div>
                    <p className="text-[#475569] text-sm leading-relaxed mb-3">{service.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {service.features.slice(0, 3).map((f) => (
                        <span key={f} className="inline-flex items-center gap-1 text-[10px] text-[#4338CA] bg-[#EEF2FF] border border-[#C7D2FE] rounded-full px-2.5 py-0.5">
                          <CheckCircle className="w-2.5 h-2.5" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.4)} className="text-center mt-10">
            <Link to="/services" className="btn-ghost text-base px-8 py-4">
              View All Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <motion.div {...fadeUp(0)} className="max-w-3xl mx-auto text-center">
            <div className="section-label mx-auto mb-6">What Our Clients Say</div>

            <div className="bg-[#F8FAFF] border border-[#E2E8F0] rounded-3xl p-10">
              <div className="flex justify-center gap-0.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                ))}
              </div>

              <blockquote className="text-xl text-[#1B3172] font-medium leading-relaxed mb-8 italic">
                "{city.testimonial.quote}"
              </blockquote>

              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center text-white font-heading font-700 text-sm flex-shrink-0">
                  {city.testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <div className="font-heading font-700 text-[#1B3172] text-sm">{city.testimonial.name}</div>
                  <div className="text-[#64748b] text-xs">{city.testimonial.role} · {city.testimonial.company}</div>
                </div>
                <div className="ml-4 pl-4 border-l border-[#E2E8F0]">
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                    {city.testimonial.result}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Local Stats ── */}
      <section className="section-pad bg-dark">
        <div className="dot-grid absolute inset-0 opacity-30 pointer-events-none" />
        <div className="container-xl relative z-10">
          <motion.div className="text-center mb-12" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">{city.city} Market</div>
            <h2 className="text-4xl font-heading font-800 text-[#1B3172] mb-4">
              Why {city.city} Businesses Can't Afford to Ignore Local SEO
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            <motion.div {...fadeUp(0)} className="bg-white border border-[#E2E8F0] rounded-2xl p-7 text-center">
              <div className="text-3xl font-heading font-800 gradient-text mb-1">{city.population}</div>
              <div className="text-sm text-[#64748b]">City Population</div>
            </motion.div>
            <motion.div {...fadeUp(0.1)} className="bg-white border border-[#E2E8F0] rounded-2xl p-7 text-center">
              <div className="text-3xl font-heading font-800 gradient-text mb-1">{city.smallBusinesses}</div>
              <div className="text-sm text-[#64748b]">Small Businesses</div>
            </motion.div>
            <motion.div {...fadeUp(0.2)} className="bg-white border border-[#E2E8F0] rounded-2xl p-7 text-center">
              <div className="text-3xl font-heading font-800 gradient-text mb-1">91%</div>
              <div className="text-sm text-[#64748b]">Never Click Past Page 1</div>
            </motion.div>
            <motion.div {...fadeUp(0.3)} className="bg-white border border-[#E2E8F0] rounded-2xl p-7 text-center">
              <div className="text-3xl font-heading font-800 gradient-text mb-1">76%</div>
              <div className="text-sm text-[#64748b]">Visit Within 24 Hours</div>
            </motion.div>
          </div>

          {/* Industry tags */}
          <motion.div {...fadeUp(0.4)} className="text-center">
            <p className="text-sm text-[#64748b] mb-4">Top industries we serve in {city.city}:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {city.industries.map((ind) => (
                <span key={ind} className="text-sm text-[#4338CA] bg-[#EEF2FF] border border-[#C7D2FE] rounded-full px-4 py-1.5 font-medium">
                  {ind}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-pad bg-white" id="faq">
        <div className="container-xl">
          <motion.div className="text-center mb-14" {...fadeUp(0)}>
            <div className="section-label mx-auto mb-3">FAQ</div>
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-[#1B3172] mb-4">
              Frequently Asked Questions — {city.city}, {city.stateCode}
            </h2>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Common questions from small business owners in {city.city} about digital marketing and local SEO.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3">
            {city.faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Internal links ── */}
      <section className="py-10 bg-[#F8FAFF] border-y border-[#E2E8F0]">
        <div className="container-xl">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link to="/locations" className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              All Locations
            </Link>
            <span className="text-[#CBD5E1]">·</span>
            <Link to={`/locations/${city.stateSlug}`} className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors">
              More in {city.state}
            </Link>
            <span className="text-[#CBD5E1]">·</span>
            <Link to="/services/website-development" className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors">
              Website Development
            </Link>
            <span className="text-[#CBD5E1]">·</span>
            <Link to="/services/google-business" className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors">
              Google Business Profile
            </Link>
            <span className="text-[#CBD5E1]">·</span>
            <Link to="/contact" className="text-[#4338CA] hover:text-[#6B3FA0] font-medium transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}

// ── Router entry point ────────────────────────────────────────────────────────
export default function LocationPage({ type }) {
  const { state: stateSlug, city: citySlug } = useParams();

  if (type === 'city') {
    const cityData = getCityData(stateSlug, citySlug);
    if (!cityData) return <Navigate to="/locations" replace />;
    return <CityPage city={cityData} />;
  }

  if (type === 'state') {
    const stateData = getStateData(stateSlug);
    if (!stateData) return <Navigate to="/locations" replace />;
    const cities = getCitiesForState(stateSlug);
    return <StatePage stateData={stateData} cities={cities} />;
  }

  return <Navigate to="/locations" replace />;
}
