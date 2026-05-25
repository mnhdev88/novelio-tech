import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const LAST_UPDATED = 'May 15, 2025';

export default function TermsPage() {
  return (
    <main className="pt-28 pb-20 bg-[#F8FAFF] min-h-screen">
      <SEO title="Terms of Service" description="Novelio Technologies LLC terms of service — your rights and obligations when using our services." canonical="/terms" noindex />
      <div className="bg-[#0E1E38] py-16 mb-12">
        <div className="container-xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 mb-5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <FileText className="w-4 h-4 text-purple-400" />
              Legal Document
            </div>
            <h1 className="text-4xl lg:text-5xl font-heading font-700 text-white mb-3">Terms of Service</h1>
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

          <Section title="1. Acceptance of Terms">
            <p>By accessing our website at <strong>www.noveliotech.com</strong> or engaging services from Novelio Technologies LLC ("Novelio," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree, please do not use our website or services.</p>
          </Section>

          <Section title="2. Services">
            <p>Novelio Technologies LLC provides digital growth services including but not limited to:</p>
            <ul>
              <li>Website design and development</li>
              <li>Search engine optimization (SEO)</li>
              <li>Google Business Profile optimization</li>
              <li>Lead generation and marketing automation</li>
              <li>Branding and creative services</li>
              <li>Email marketing and list management</li>
              <li>Technology operations and integrations</li>
            </ul>
            <p>Specific deliverables, timelines, and pricing for each engagement are outlined in a separate Service Agreement or Statement of Work (SOW) provided to the client.</p>
          </Section>

          <Section title="3. Free Growth Audit">
            <p>The Free 30-Minute Growth Audit is provided at no cost and with no obligation. The audit is for informational purposes only and does not constitute a binding contract or guarantee of results. Novelio reserves the right to decline or reschedule audit requests at its discretion.</p>
          </Section>

          <Section title="4. Payment Terms">
            <p>Payment terms are specified in each individual Service Agreement. Generally:</p>
            <ul>
              <li>Invoices are due within 7 days of issuance unless otherwise agreed in writing.</li>
              <li>Late payments may incur a 1.5% monthly interest charge.</li>
              <li>Project work will not commence until the agreed deposit or full payment is received.</li>
              <li>All fees are in USD unless otherwise stated.</li>
            </ul>
          </Section>

          <Section title="5. Intellectual Property">
            <p>Upon full payment of all fees:</p>
            <ul>
              <li>Client owns all final deliverables created specifically for them (e.g., website design, custom copy, graphics).</li>
              <li>Novelio retains ownership of any pre-existing tools, templates, frameworks, and proprietary methodologies used in the delivery of services.</li>
              <li>Novelio may use completed work in its portfolio and marketing materials unless the client requests otherwise in writing.</li>
            </ul>
          </Section>

          <Section title="6. Client Responsibilities">
            <p>The client agrees to:</p>
            <ul>
              <li>Provide accurate information, access credentials, and materials in a timely manner</li>
              <li>Review and approve deliverables within agreed timelines</li>
              <li>Not use our services for unlawful, deceptive, or harmful purposes</li>
              <li>Maintain the confidentiality of any login credentials provided by Novelio</li>
            </ul>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>To the fullest extent permitted by law, Novelio Technologies LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of revenue, loss of profits, loss of data, or loss of business opportunities arising from your use of our services.</p>
            <p>Our total liability in connection with any service shall not exceed the total fees paid by you in the three (3) months preceding the claim.</p>
          </Section>

          <Section title="8. No Guarantee of Results">
            <p>Digital marketing results depend on numerous factors outside our control including search engine algorithm changes, market conditions, and client implementation. While we strive for measurable outcomes, Novelio does not guarantee specific rankings, traffic levels, lead volumes, or revenue increases.</p>
          </Section>

          <Section title="9. Confidentiality">
            <p>Both parties agree to keep confidential any proprietary or sensitive information shared during the course of the engagement. This obligation survives the termination of the service relationship.</p>
          </Section>

          <Section title="10. Termination">
            <p>Either party may terminate a service engagement with 30 days written notice. Upon termination:</p>
            <ul>
              <li>Client is responsible for payment of all services rendered up to the termination date.</li>
              <li>Novelio will deliver all completed work and transfer relevant access credentials to the client within 10 business days.</li>
            </ul>
          </Section>

          <Section title="11. Governing Law">
            <p>These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law provisions. Any disputes shall be resolved in the courts of Delaware.</p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>We reserve the right to update these Terms at any time. Changes take effect upon posting to our website. Continued use of our services constitutes acceptance of the updated Terms.</p>
          </Section>

          <Section title="13. Contact Us">
            <p>Questions about these Terms? Reach out:</p>
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
