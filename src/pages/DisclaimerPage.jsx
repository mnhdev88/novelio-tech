import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const LAST_UPDATED = 'May 15, 2025';

export default function DisclaimerPage() {
  return (
    <main className="pt-28 pb-20 bg-[#F8FAFF] min-h-screen">
      <SEO title="Disclaimer" description="Novelio Technologies LLC disclaimer — limitations on results, professional advice, and third-party content." canonical="/disclaimer" noindex />
      <div className="bg-[#0E1E38] py-16 mb-12">
        <div className="container-xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 mb-5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              Legal Document
            </div>
            <h1 className="text-4xl lg:text-5xl font-heading font-700 text-white mb-3">Disclaimer</h1>
            <p className="text-white/50 text-sm">Last updated: {LAST_UPDATED}</p>
          </motion.div>
        </div>
      </div>

      <div className="container-xl max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl p-8 lg:p-12 space-y-10"
          style={{ background: 'white', border: '1px solid rgba(29,78,216,0.08)', boxShadow: '0 4px 32px rgba(27,49,114,0.07)' }}
        >

          <Section title="1. Website Disclaimer">
            <p>The information provided on <strong>www.noveliotech.com</strong> is for general informational purposes only. While we strive to keep information accurate and up to date, Novelio Technologies LLC makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the website or the information, products, services, or related graphics contained on the website.</p>
          </Section>

          <Section title="2. No Guarantee of Results">
            <p>Any results, case studies, testimonials, or statistics mentioned on our website represent the experiences of specific clients under specific conditions. They are not typical results and should not be interpreted as a guarantee that you will achieve similar outcomes.</p>
            <p>Digital marketing performance depends on numerous factors including industry, competition, geographic location, budget, implementation quality, market conditions, and search engine algorithm changes — many of which are outside Novelio's control.</p>
          </Section>

          <Section title="3. Professional Advice Disclaimer">
            <p>Nothing on this website constitutes legal, financial, tax, or accounting advice. The content is intended for general business informational purposes only. You should consult qualified professionals for advice specific to your situation before making any business, financial, or legal decisions.</p>
          </Section>

          <Section title="4. Testimonials & Case Studies">
            <p>Testimonials and case studies on this website reflect real client experiences. However:</p>
            <ul>
              <li>Results vary by client, industry, and market conditions.</li>
              <li>Testimonials are not compensated unless explicitly disclosed.</li>
              <li>Past performance is not a guarantee of future results.</li>
            </ul>
          </Section>

          <Section title="5. Third-Party Links">
            <p>Our website may contain links to external websites. These links are provided for your convenience. Novelio Technologies LLC has no control over the content of linked sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them.</p>
          </Section>

          <Section title="6. Industry Statistics & Data">
            <p>Statistics cited on our website (e.g., "76% of people who search locally visit a business within 24 hours") are sourced from publicly available industry research. We make reasonable efforts to cite accurate data, but these figures may change over time. We are not responsible for the accuracy of third-party data.</p>
          </Section>

          <Section title="7. Availability">
            <p>We do not guarantee that our website will be available at all times. We may experience hardware, software, or other issues requiring maintenance that results in interruptions, delays, or errors. We reserve the right to modify, suspend, or discontinue the website at any time without notice.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>To the maximum extent permitted by applicable law, Novelio Technologies LLC shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of, or inability to use, this website or our services — even if we have been advised of the possibility of such damages.</p>
          </Section>

          <Section title="9. Fair Use">
            <p>This website may contain copyrighted material used under fair use doctrine for purposes of education, commentary, and news reporting. Such material is made available for informational purposes only.</p>
          </Section>

          <Section title="10. Contact Us">
            <p>If you have questions about this Disclaimer, please contact us:</p>
            <ContactBlock />
          </Section>

        </motion.div>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-heading font-700 text-[#1B3172] mb-4 pb-2 border-b border-slate-100">{title}</h2>
      <div className="space-y-3 text-[#475569] text-[15px] leading-relaxed [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_strong]:text-[#334155] [&_strong]:font-600">
        {children}
      </div>
    </div>
  );
}

function ContactBlock() {
  return (
    <div className="mt-3 p-5 rounded-2xl space-y-1 text-sm"
      style={{ background: '#F8FAFF', border: '1px solid rgba(29,78,216,0.1)' }}>
      <p><strong>Novelio Technologies LLC</strong></p>
      <p>Dover, Delaware, USA</p>
      <p>Email: <a href="mailto:info@noveliotech.com" className="text-[#1D4ED8] hover:underline">info@noveliotech.com</a></p>
      <p>Phone: <a href="tel:+19082012264" className="text-[#1D4ED8] hover:underline">(908) 201-2264</a></p>
    </div>
  );
}
