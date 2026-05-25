import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const LAST_UPDATED = 'May 15, 2025';

export default function RefundPolicyPage() {
  return (
    <main className="pt-28 pb-20 bg-[#F8FAFF] min-h-screen">
      <SEO title="Refund Policy" description="Novelio Technologies LLC refund policy — understand our project and retainer refund terms." canonical="/refund-policy" noindex />
      <div className="bg-[#0E1E38] py-16 mb-12">
        <div className="container-xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 mb-5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <RefreshCw className="w-4 h-4 text-purple-400" />
              Legal Document
            </div>
            <h1 className="text-4xl lg:text-5xl font-heading font-700 text-white mb-3">Refund Policy</h1>
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

          <Section title="1. Our Commitment">
            <p>At Novelio Technologies LLC, we are committed to delivering measurable results and high-quality work. We stand behind every service we provide. This Refund Policy outlines the conditions under which refunds may be issued.</p>
          </Section>

          <Section title="2. Free Growth Audit">
            <p>The Free 30-Minute Growth Audit is provided at no cost. There is nothing to refund for this service.</p>
          </Section>

          <Section title="3. Project-Based Services">
            <p>For one-time project engagements (e.g., website design, branding, SEO setup):</p>
            <ul>
              <li><strong>Before Work Begins:</strong> If you cancel before any work has started, you are entitled to a full refund of any deposit paid.</li>
              <li><strong>After Work Has Begun:</strong> If work has commenced, refunds are prorated based on the percentage of work completed at the time of cancellation. The remaining balance will be refunded after deducting the value of completed work.</li>
              <li><strong>After Final Delivery:</strong> No refunds are issued once final deliverables have been delivered and approved by the client.</li>
            </ul>
          </Section>

          <Section title="4. Monthly Retainer Services">
            <p>For ongoing monthly service plans (e.g., SEO management, lead generation, automation maintenance):</p>
            <ul>
              <li>Monthly fees are non-refundable once the billing period has begun.</li>
              <li>You may cancel future months by providing written notice at least 7 days before the next billing date.</li>
              <li>No partial refunds are issued for unused days within a billing period.</li>
            </ul>
          </Section>

          <Section title="5. Exceptions — When Refunds Are Granted">
            <p>A full or partial refund may be issued in the following circumstances:</p>
            <ul>
              <li>Novelio fails to deliver agreed services within the specified timeline without client-caused delays.</li>
              <li>The final deliverable is materially different from what was agreed upon in the signed Statement of Work.</li>
              <li>A billing error occurred (e.g., duplicate charge).</li>
            </ul>
            <p>All exception-based refund requests must be submitted in writing within 14 days of the triggering event.</p>
          </Section>

          <Section title="6. Non-Refundable Items">
            <p>The following are non-refundable under all circumstances:</p>
            <ul>
              <li>Third-party costs paid on your behalf (e.g., domain registration, hosting, ad spend, software licenses)</li>
              <li>Rush fees or expedited service surcharges</li>
              <li>Completed and approved work</li>
            </ul>
          </Section>

          <Section title="7. How to Request a Refund">
            <p>To initiate a refund request, please email us at <strong>info@noveliotech.com</strong> with:</p>
            <ul>
              <li>Your full name and business name</li>
              <li>Invoice or project reference number</li>
              <li>Reason for the refund request</li>
            </ul>
            <p>We will respond within 3 business days and resolve eligible refunds within 10 business days of approval. Refunds are issued via the original payment method.</p>
          </Section>

          <Section title="8. Disputes">
            <p>If you are unsatisfied with a refund decision, we encourage you to contact us to discuss. We are committed to fair resolution. In the event of an unresolved dispute, the matter shall be subject to the governing law outlined in our Terms of Service.</p>
          </Section>

          <Section title="9. Contact Us">
            <p>Questions about refunds? We're here to help:</p>
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
