import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { EntityContactBlock } from '../components/shared/LegalEntities';

const LAST_UPDATED = 'September 2, 2026';

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
            <p>This section applies to both Novelio entities. Amounts are in USD for Novelio US engagements and in INR for Novelio India engagements. India engagements are additionally subject to Section 7 below.</p>
          </Section>

          <Section title="4. Monthly Retainer Services">
            <p>For ongoing monthly service plans (e.g., SEO management, lead generation, automation maintenance):</p>
            <ul>
              <li>Monthly fees are non-refundable once the billing period has begun.</li>
              <li>You may cancel future months by providing written notice at least 7 days before the next billing date.</li>
              <li>No partial refunds are issued for unused days within a billing period.</li>
            </ul>
            <p><strong>Subscription growth plans with website included.</strong> Growth plans (Start My Growth, Grow My Leads, Scale My Business) carry a 12-month minimum commitment because the website, SSL, hosting, and growth setup are provided free with the plan:</p>
            <ul>
              <li>One-time setup fees are non-refundable once onboarding has begun.</li>
              <li>If you cancel before the 12-month minimum term is completed, fees already paid are non-refundable, and the included website remains with Novelio unless the agreed buyout fee is paid.</li>
              <li>After the minimum term, the plan continues month to month and may be cancelled with 7 days notice before the next billing date; website ownership transfers to you in full.</li>
            </ul>
            <p>This section applies to both Novelio entities.</p>
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

          <Section title="7. India Refund Policy — 15-Day Refund Window">
            <p>For projects and services purchased from <strong>Novelio Technologies in India</strong>, payments made through Razorpay, UPI, card, net banking, bank transfer, or any other approved payment method are subject to the following refund policy.</p>

            <h3 className="font-600 text-[#334155] pt-2">7.1 15-Day Refund Window</h3>
            <p>Unless otherwise stated in the applicable Proposal, Order Form, Agreement, or Statement of Work, the Client may request a refund within <strong>15 calendar days from the date Novelio receives the first payment for the project</strong>. The refund request must be submitted in writing within this 15-day period.</p>
            <p>After the expiry of the <strong>15-day refund period, all payments made towards the project shall be considered final and non-refundable</strong>, including where the Client:</p>
            <ul>
              <li>changes their mind;</li>
              <li>decides not to proceed with the project;</li>
              <li>delays or stops providing information, approvals, content, access, or feedback;</li>
              <li>chooses another service provider;</li>
              <li>does not use the completed or partially completed work; or</li>
              <li>changes its business, marketing, technology, or commercial strategy.</li>
            </ul>
            <p>This does not limit any refund or remedy that may be required under applicable Indian law.</p>
            <p>Any non-refundable third-party expenses specifically incurred for the Client, including domains, hosting, paid software, licences, plugins, advertising spend, API charges, cloud services, or similar external costs, may be excluded from the refundable amount where applicable.</p>

            <h3 className="font-600 text-[#334155] pt-2">7.2 Effect of an Approved Refund</h3>
            <p>Once a refund is approved, the Client's right to use any work, licence, access, service, or deliverable supplied by Novelio in connection with the refunded project shall immediately terminate.</p>
            <p>Novelio may deactivate or withdraw access to, where applicable: website hosting; staging or development environments; website administration panels; source-code repositories; software or dashboards; CRM or automation systems; APIs and integrations; paid plugins or licences; design files and prototypes; SEO/AEO/GEO implementation materials; marketing or business strategy documents; workflows, templates and processes; and any other Novelio-created project asset or deliverable.</p>
            <p>The Client must stop using and, where reasonably possible, delete or return all refunded Novelio deliverables in its possession or control.</p>
            <p>Any Client-owned domain, data, content, trademarks, photographs or other pre-existing Client property will remain the Client's property.</p>

            <h3 className="font-600 text-[#334155] pt-2">7.3 Use of Work After Receiving a Refund</h3>
            <p>A refund means that the Client has chosen <strong>not to purchase or retain the refunded Novelio work</strong>. Accordingly, after receiving a refund, the Client shall not directly or indirectly use, copy, publish, deploy, reproduce, modify, commercialise, transfer, share with another developer, or permit any third party to use any refunded Novelio deliverable.</p>
            <p>This includes, where applicable: source code or website components; website layouts, UI/UX or custom designs; written website content created by Novelio; wireframes or prototypes; proprietary strategy documents or implementation plans; SEO structures, schemas or implementation materials; automation workflows; CRM configurations; custom software functionality; and other original or proprietary material created by Novelio.</p>
            <p>If, within <strong>12 months from the refund date</strong>, Novelio reasonably establishes that the Client or a person acting on the Client's behalf has used or commercially deployed any refunded Novelio deliverable, such use will be treated as acceptance and purchase of the relevant work. The Client shall then be liable to pay the applicable contracted price for the work being used, together with applicable taxes, third-party charges and reasonable recovery or enforcement costs, to the extent permitted by law.</p>
            <p>This provision does not restrict the Client from independently developing its own website, business strategy or systems without using Novelio's refunded proprietary materials.</p>

            <h3 className="font-600 text-[#334155] pt-2">7.4 India Refund Processing</h3>
            <p>Where an approved refund relates to a payment made through <strong>Razorpay or another payment aggregator</strong>, Novelio will normally initiate the approved refund within <strong>7 business days</strong>. The refund will normally be returned to the original payment method used for the transaction.</p>
            <p>After Novelio initiates the refund, the Client's bank, card issuer, UPI provider or payment processor may require an additional <strong>5–7 business days or longer</strong> to credit the amount. Such external processing times are outside Novelio's control.</p>
            <p>Any GST adjustment, credit note or refund will be processed in accordance with applicable GST laws and accounting requirements.</p>
          </Section>

          <Section title="8. How to Request a Refund">
            <p>All refund requests must be submitted by email to <strong>info@noveliotech.com</strong> within the applicable refund period. The request must include:</p>
            <ul>
              <li>Client's full name;</li>
              <li>Business/company name;</li>
              <li>GST invoice or invoice number;</li>
              <li>Project or order reference;</li>
              <li>Payment date and amount; and</li>
              <li>Reason for requesting the refund.</li>
            </ul>
            <p>Refund requests made only through telephone calls, WhatsApp messages, social media, or verbal communication will not be treated as formal refund requests.</p>
            <p>Novelio will normally acknowledge a complete refund request within <strong>3 business days</strong>. Once a refund has been approved, Novelio will initiate the refund in accordance with Section 7.4.</p>
            <p><strong>No refund request submitted after the applicable 15-day refund period will be accepted, except where required under applicable law or where Novelio expressly agrees otherwise in writing.</strong></p>
          </Section>

          <Section title="9. Disputes">
            <p>If you are unsatisfied with a refund decision, we encourage you to contact us to discuss. We are committed to fair resolution.</p>
            <p>For Novelio US engagements, unresolved disputes are subject to the governing law in our Terms of Service (Delaware). For Novelio India engagements, unresolved disputes are subject to the jurisdiction of the courts at New Delhi, India, and may also be raised with the Grievance Officer named in our Privacy Policy and Terms of Service.</p>
          </Section>

          <Section title="10. Contact Us">
            <p>Questions about refunds? We're here to help:</p>
            <EntityContactBlock showTaxIds />
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

