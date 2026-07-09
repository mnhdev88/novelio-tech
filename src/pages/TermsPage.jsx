import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const LAST_UPDATED = 'July 10, 2026';

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
            <p>By accessing our website at <strong>www.noveliotech.com</strong> or engaging services from Novelio Technologies LLC ("Novelio," "we," "us," or "our"), you agree to be bound by these Terms of Service.</p>
            <p>If you do not agree with these Terms, please do not use our website, request an audit, purchase a plan, or engage our services.</p>
            <p>These Terms apply to all website visitors, prospects, clients, subscribers, partners, and users of our services.</p>
          </Section>

          <Section title="2. Services">
            <p>Novelio Technologies LLC provides digital growth and technology services, including but not limited to:</p>
            <ul>
              <li>Website design and development</li>
              <li>Mobile app development</li>
              <li>Search engine optimization</li>
              <li>Google Business Profile optimization</li>
              <li>Lead generation</li>
              <li>Paid advertising support</li>
              <li>Marketing automation</li>
              <li>CRM setup and integration</li>
              <li>Email marketing and list management</li>
              <li>Branding and creative services</li>
              <li>Technology operations and integrations</li>
              <li>Business growth consulting</li>
              <li>Digital marketing strategy</li>
            </ul>
            <p>Specific deliverables, timelines, inclusions, exclusions, pricing, revisions, support terms, and responsibilities are outlined in a separate proposal, Service Agreement, Statement of Work, checkout page, invoice, or approved written communication.</p>
            <p>If there is any conflict between these Terms and a signed Service Agreement or Statement of Work, the signed agreement will control for that specific engagement.</p>
          </Section>

          <Section title="3. Free Growth Audit">
            <p>Novelio may offer a free growth audit, consultation, discovery call, website review, marketing review, or similar advisory session.</p>
            <p>The Free 30-Minute Growth Audit is provided at no cost and with no obligation. It is for informational and educational purposes only.</p>
            <p>The audit does not create a client relationship unless both parties agree to proceed with a paid service. It also does not guarantee specific results, rankings, leads, traffic, sales, revenue, approvals, or business outcomes.</p>
            <p>Novelio reserves the right to accept, decline, reschedule, or cancel audit requests at its discretion.</p>
          </Section>

          <Section title="4. Payment Terms">
            <p>Payment terms are specified in each individual proposal, Service Agreement, Statement of Work, checkout page, invoice, subscription plan, or approved written communication.</p>
            <p>Unless otherwise agreed in writing:</p>
            <ul>
              <li>Invoices are due within seven (7) days of issuance.</li>
              <li>All fees are in USD unless otherwise stated.</li>
              <li>Project work begins only after the agreed deposit, setup fee, subscription fee, or first payment is received.</li>
              <li>Late payments may incur a 1.5% monthly interest charge or the maximum amount permitted by law, whichever is lower.</li>
              <li>Novelio may pause work, delivery, hosting, support, advertising management, automation, CRM access, or other services if payment is overdue.</li>
              <li>The client is responsible for all taxes, bank charges, processor fees, currency conversion charges, and payment-related fees unless otherwise stated in writing.</li>
            </ul>
            <p>In some approved cases, Novelio may offer a preview-first website model where a draft or demo website is created before full payment, and payment becomes due after client approval and fifteen (15) days from the website going live. This option applies only when confirmed by Novelio in writing.</p>
          </Section>

          <Section title="5. Accepted Payment Methods">
            <p>Novelio Technologies LLC may accept payments through approved methods including credit card, debit card, ACH bank transfer, wire transfer, online invoice, payment link, or other payment methods made available by Novelio.</p>
            <p>For ACH bank transfer payments, clients must use only the official payment instructions provided by Novelio through an approved invoice, secure payment link, payment processor, or written company communication.</p>
            <p>Novelio does not publish full bank account details or routing details on its website for security reasons.</p>
            <p>By choosing ACH payment, the client authorizes Novelio Technologies LLC, its bank, or its approved payment processor to process the agreed invoice amount, subscription fee, setup fee, renewal fee, or other approved charges.</p>
            <p>ACH payments may take several business days to process. A payment is considered received only after successful settlement.</p>
            <p>The client is responsible for ensuring that bank account details, authorization details, billing information, invoice references, and payment amounts are accurate.</p>
            <p>Returned, failed, reversed, disputed, or insufficient-fund payments may result in:</p>
            <ul>
              <li>Service delay</li>
              <li>Service suspension</li>
              <li>Reprocessing fees</li>
              <li>Bank charges</li>
              <li>Processor fees</li>
              <li>Collection of unpaid amounts</li>
              <li>Termination of access to unpaid services</li>
            </ul>
            <p>If a payment is reversed, charged back, disputed, or returned after services have been delivered, the client remains responsible for the unpaid amount and any related charges permitted by law.</p>
          </Section>

          <Section title="6. Subscription Growth Plans">
            <p>Novelio may offer paid subscription growth plans, including but not limited to plans such as Start My Growth, Grow My Leads, Scale My Business, or similar plans.</p>
            <p>Subscription plans may be billed monthly, quarterly, annually, or as otherwise agreed in writing.</p>
            <p>Unless otherwise agreed in writing, subscription growth plans carry a minimum commitment of twelve (12) months.</p>
            <p>Applicable setup fees, monthly fees, billing frequency, included services, and exclusions are stated at checkout, invoice, proposal, Service Agreement, Statement of Work, or approved written communication.</p>
            <p>If the website, SSL, hosting, setup, marketing systems, automation, CRM configuration, landing pages, or other growth assets are included as part of a subscription plan at no separate upfront website-development cost, such assets remain the property of Novelio until the minimum term is completed or an early buyout fee is paid.</p>
            <p>During the subscription term, the client receives a license to use the website and included assets for their business, subject to timely payment and compliance with these Terms.</p>
            <p>If the client cancels, pauses, defaults, or fails to complete the minimum subscription term, Novelio may retain ownership and control of the website, hosting environment, templates, CRM configuration, automation setup, and related assets until all outstanding amounts, remaining term balances, or applicable buyout fees are paid.</p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>Upon full payment of all applicable fees, the client owns the final deliverables created specifically for the client, such as final website content, approved custom copy, approved graphics, and final design assets, unless otherwise stated in the Service Agreement or Statement of Work.</p>
            <p>Novelio retains ownership of all pre-existing tools, templates, code libraries, frameworks, processes, methods, automation flows, strategy documents, internal systems, training materials, and proprietary methodologies used to deliver services.</p>
            <p>Novelio may use completed work, screenshots, project summaries, results, testimonials, and case studies in its portfolio, website, presentations, and marketing materials unless the client requests otherwise in writing.</p>
            <p>For websites provided free or bundled as part of a subscription growth plan, full ownership of the website transfers to the client only after completion of the minimum subscription term or payment of the agreed buyout fee.</p>
            <p>Until ownership transfer is complete, the client receives a limited license to use the website for normal business use, subject to payment compliance and these Terms.</p>
          </Section>

          <Section title="8. Client Responsibilities">
            <p>The client agrees to:</p>
            <ul>
              <li>Provide accurate business information, approvals, content, images, access credentials, brand assets, and required materials in a timely manner.</li>
              <li>Review and approve deliverables within agreed timelines.</li>
              <li>Provide truthful and lawful information for marketing, advertising, payment processing, compliance, and website publication.</li>
              <li>Not use Novelio's services for unlawful, deceptive, abusive, misleading, harmful, fraudulent, or prohibited activities.</li>
              <li>Maintain confidentiality of login credentials, payment links, private documents, and access details shared by Novelio.</li>
              <li>Ensure that any content, images, trademarks, claims, testimonials, offers, and product information provided to Novelio are legal, accurate, and properly authorized.</li>
              <li>Respond to reasonable requests for approval, clarification, and feedback.</li>
            </ul>
            <p>Novelio is not responsible for delays, missed deadlines, poor performance, rejected campaigns, suspended accounts, or incomplete work caused by delayed client responses, missing materials, inaccurate information, denied access, third-party restrictions, or client-side non-cooperation.</p>
          </Section>

          <Section title="9. Third-Party Platforms and Tools">
            <p>Novelio may use or integrate third-party platforms such as hosting providers, domain registrars, website builders, CRM tools, email platforms, advertising platforms, analytics tools, payment processors, automation tools, social media platforms, and other technology providers.</p>
            <p>The client understands that third-party platforms are governed by their own terms, policies, pricing, limits, restrictions, review processes, and availability.</p>
            <p>Novelio is not responsible for:</p>
            <ul>
              <li>Third-party downtime</li>
              <li>Account suspensions</li>
              <li>Platform policy changes</li>
              <li>Payment processor reviews</li>
              <li>Advertising disapprovals</li>
              <li>Search engine algorithm updates</li>
              <li>Hosting outages</li>
              <li>Email deliverability issues caused by third-party systems</li>
              <li>Domain or DNS issues outside Novelio's control</li>
              <li>Pricing changes made by third-party providers</li>
            </ul>
            <p>Where required, the client is responsible for maintaining active subscriptions, licenses, renewals, payment methods, and account ownership for third-party tools.</p>
          </Section>

          <Section title="10. Confidentiality">
            <p>Both parties agree to keep confidential any proprietary, sensitive, financial, technical, operational, strategic, or business information shared during the course of the engagement.</p>
            <p>Confidential information may include but is not limited to login credentials, business plans, financial information, client lists, marketing data, payment details, internal processes, pricing, technical configurations, and unpublished materials.</p>
            <p>This obligation continues even after the service relationship ends.</p>
            <p>Confidentiality does not apply to information that is publicly available, already known before disclosure, independently developed, or required to be disclosed by law.</p>
          </Section>

          <Section title="11. No Guarantee of Results">
            <p>Novelio works to deliver measurable improvements, but digital growth depends on many factors outside our control.</p>
            <p>Novelio does not guarantee specific:</p>
            <ul>
              <li>Search engine rankings</li>
              <li>Traffic levels</li>
              <li>Lead volumes</li>
              <li>Sales revenue</li>
              <li>Conversion rates</li>
              <li>Advertising results</li>
              <li>Google Business Profile rankings</li>
              <li>Social media growth</li>
              <li>Email open rates</li>
              <li>Payment processor approvals</li>
              <li>Third-party account approvals</li>
              <li>Business outcomes</li>
            </ul>
            <p>Results may vary based on market conditions, competition, client offer, pricing, reviews, budget, response time, sales process, platform rules, algorithm changes, and client implementation.</p>
            <p>Any examples, projections, estimates, case studies, audits, or performance references are for illustration only and do not guarantee future results.</p>
          </Section>

          <Section title="12. Limitation of Liability">
            <p>To the fullest extent permitted by law, Novelio Technologies LLC shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages.</p>
            <p>This includes but is not limited to loss of revenue, loss of profits, loss of data, loss of goodwill, loss of business opportunities, website downtime, advertising loss, search ranking changes, account suspension, payment delay, or third-party platform issues.</p>
            <p>Our total liability in connection with any service shall not exceed the total fees paid by the client to Novelio in the three (3) months preceding the claim.</p>
            <p>The client agrees that Novelio is not liable for issues caused by third-party tools, client-provided content, client delays, unauthorized access, policy violations, payment processor decisions, hosting outages, or platform changes outside Novelio's control.</p>
          </Section>

          <Section title="13. Refunds and Cancellations">
            <p>Refund terms may vary depending on the service, subscription plan, project stage, or Service Agreement.</p>
            <p>Unless otherwise agreed in writing:</p>
            <ul>
              <li>Setup fees are non-refundable once work has started.</li>
              <li>Strategy, audit, consulting, planning, research, and advisory fees are non-refundable once delivered or initiated.</li>
              <li>Website, design, development, automation, CRM, and marketing work already completed or in progress is non-refundable.</li>
              <li>Subscription fees are non-refundable for the billing period already started.</li>
              <li>Third-party costs, hosting fees, domain fees, software fees, advertising spend, payment processor fees, and purchased tools are non-refundable.</li>
            </ul>
            <p>Approved refunds, if any, may be processed through the original payment method where possible. Processing timelines may depend on the bank, payment processor, or payment method used.</p>
            <p>For detailed refund rules, please refer to Novelio's <Link to="/refund-policy" className="text-[#1D4ED8] hover:underline">Refund Policy</Link>, if published separately.</p>
          </Section>

          <Section title="14. Termination">
            <p>Either party may terminate a service engagement with thirty (30) days' written notice unless a different termination process is stated in the applicable Service Agreement, Statement of Work, subscription plan, or approved written communication.</p>
            <p>Upon termination:</p>
            <ul>
              <li>The client is responsible for payment of all services rendered up to the termination date.</li>
              <li>The client remains responsible for unpaid invoices, approved charges, remaining subscription commitments, buyout fees, and third-party costs.</li>
              <li>Novelio will deliver completed work and transfer relevant access credentials within ten (10) business days after all outstanding payments are cleared.</li>
              <li>Novelio may withhold transfer of websites, files, hosting access, CRM setup, automation assets, or other deliverables until all due amounts are paid.</li>
              <li>For subscription growth plans terminated before the 12-month minimum term, the remaining term balance or agreed buyout fee applies before ownership transfers.</li>
            </ul>
            <p>For ACH, card, wire, or invoice-based payments, termination does not cancel unpaid invoices, minimum-term commitments, approved payment authorizations, chargeback liability, returned payment fees, or any other amounts already due.</p>
            <p>If a payment is returned, reversed, disputed, or charged back after cancellation or termination, the client remains responsible for the unpaid amount, applicable bank or processor fees, and any reasonable recovery costs permitted by law.</p>
          </Section>

          <Section title="15. Service Suspension">
            <p>Novelio may suspend services, access, delivery, hosting, support, advertising management, CRM support, automation, or other work if:</p>
            <ul>
              <li>Payment is overdue</li>
              <li>Payment fails, reverses, disputes, or is returned</li>
              <li>Client does not provide required information or access</li>
              <li>Client violates these Terms</li>
              <li>Client uses services for unlawful or harmful purposes</li>
              <li>A third-party platform suspends, restricts, or reviews the related account</li>
              <li>Continued work creates legal, compliance, payment, security, or reputational risk</li>
            </ul>
            <p>Service suspension does not remove the client's responsibility to pay outstanding amounts.</p>
          </Section>

          <Section title="16. Website Hosting, Domains, and Access">
            <p>If Novelio provides hosting, domain support, SSL, email setup, or technical access as part of a service or subscription plan, the exact terms will be stated in the applicable proposal, invoice, Service Agreement, or Statement of Work.</p>
            <p>Unless otherwise agreed in writing:</p>
            <ul>
              <li>Domains purchased by the client remain the client's property.</li>
              <li>Domains purchased by Novelio on behalf of the client may be transferred after all related payments are cleared.</li>
              <li>Hosting included with a plan remains active only while the plan is active and paid.</li>
              <li>SSL certificates, plugins, tools, licenses, or software may depend on third-party providers and renewal terms.</li>
              <li>Novelio is not responsible for domain expiry, email failure, hosting suspension, or service disruption caused by unpaid third-party charges, client-side changes, or failure to renew.</li>
            </ul>
          </Section>

          <Section title="17. Advertising and Marketing Accounts">
            <p>If Novelio manages or supports advertising, SEO, Google Business Profile, email marketing, social media, or lead generation, the client remains responsible for the accuracy and legality of all claims, offers, promotions, prices, service descriptions, testimonials, images, and business information.</p>
            <p>Novelio is not responsible for ad disapprovals, account restrictions, suspended profiles, rejected listings, keyword competition, review removals, algorithm changes, policy changes, or platform decisions outside Novelio's control.</p>
            <p>Advertising spend is separate from Novelio's service fees unless specifically included in writing.</p>
          </Section>

          <Section title="18. Compliance and Prohibited Use">
            <p>The client agrees not to use Novelio's website, services, systems, payment methods, marketing support, automation, or technology for any unlawful, deceptive, abusive, fraudulent, high-risk, restricted, or harmful activity.</p>
            <p>Novelio may refuse, pause, or terminate services if we believe the client's business, content, payment activity, product, service, or conduct creates legal, compliance, payment processor, platform, security, or reputational risk.</p>
            <p>The client is responsible for complying with all applicable laws, regulations, platform policies, advertising rules, privacy laws, payment rules, tax obligations, and industry requirements.</p>
          </Section>

          <Section title="19. Privacy">
            <p>Your use of our website and services may involve the collection and processing of personal information, business information, billing information, and payment-related information.</p>
            <p>Please review our <Link to="/privacy" className="text-[#1D4ED8] hover:underline">Privacy Policy</Link> to understand how we collect, use, protect, and share information.</p>
            <p>For security reasons, clients should not send full bank account details, card details, passwords, or sensitive access credentials through unsecured email, chat, WhatsApp, or social media unless specifically requested through an approved secure method.</p>
          </Section>

          <Section title="20. Changes to Services or Terms">
            <p>Novelio may update its services, pricing, plans, inclusions, policies, and Terms from time to time.</p>
            <p>Changes take effect when posted on the website or communicated to the client, unless a different effective date is stated.</p>
            <p>Continued use of our website or services after changes are posted means you accept the updated Terms.</p>
            <p>For existing paid engagements, material changes will not override a signed Service Agreement unless both parties agree in writing.</p>
          </Section>

          <Section title="21. Governing Law">
            <p>These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles.</p>
            <p>Any disputes shall be resolved in the state or federal courts located in Delaware, unless otherwise agreed in writing.</p>
          </Section>

          <Section title="22. Contact Us">
            <p>Questions about these Terms, invoices, payment methods, ACH payment instructions, service plans, billing, or subscriptions? Please contact us:</p>
            <ContactBlock />
            <p>For security reasons, ACH bank account details are shared only through approved invoices, secure payment links, payment processors, or official written communication from Novelio Technologies LLC.</p>
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
