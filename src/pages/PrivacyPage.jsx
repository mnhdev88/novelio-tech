import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const LAST_UPDATED = 'May 15, 2025';

export default function PrivacyPage() {
  return (
    <main className="pt-28 pb-20 bg-[#F8FAFF] min-h-screen">
      <SEO title="Privacy Policy" description="Novelio Technologies LLC privacy policy — how we collect, use, and protect your personal information." canonical="/privacy" noindex />
      {/* Hero */}
      <div className="bg-[#0E1E38] py-16 mb-12">
        <div className="container-xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/70 mb-5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Shield className="w-4 h-4 text-purple-400" />
              Legal Document
            </div>
            <h1 className="text-4xl lg:text-5xl font-heading font-700 text-white mb-3">Privacy Policy</h1>
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

          <Section title="1. Introduction">
            <p>Novelio Technologies LLC ("Novelio," "we," "us," or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at <strong>www.noveliotech.com</strong> or engage our services.</p>
            <p>By using our website or services, you agree to the collection and use of information in accordance with this policy.</p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We may collect the following types of information:</p>
            <ul>
              <li><strong>Personal Identification Information:</strong> Name, email address, phone number, business name, and any information you voluntarily provide via contact forms, audit requests, or newsletter sign-ups.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, pages visited, time spent on pages, referring URLs, and device information — collected automatically via Google Analytics and Microsoft Clarity.</li>
              <li><strong>Communications:</strong> Emails, messages, and call records when you contact us.</li>
              <li><strong>Business Information:</strong> Details about your business provided during a Growth Audit or onboarding process.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and improve our services</li>
              <li>Respond to inquiries and deliver your requested Growth Audit</li>
              <li>Send transactional and marketing communications (with your consent)</li>
              <li>Analyze website usage to improve user experience</li>
              <li>Comply with legal obligations</li>
              <li>Detect and prevent fraud or misuse</li>
            </ul>
          </Section>

          <Section title="4. Cookies & Tracking Technologies">
            <p>We use cookies and similar tracking technologies including:</p>
            <ul>
              <li><strong>Google Analytics (GA4):</strong> Tracks website traffic and user behavior anonymously.</li>
              <li><strong>Microsoft Clarity:</strong> Records session replays and heatmaps to improve UX.</li>
            </ul>
            <p>You may disable cookies through your browser settings. Note that disabling cookies may affect site functionality.</p>
          </Section>

          <Section title="5. Sharing Your Information">
            <p>We do not sell, trade, or rent your personal information to third parties. We may share data with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Trusted tools and platforms (e.g., email providers, CRM, analytics) used to operate our business, bound by confidentiality agreements.</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <p>We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. You may request deletion of your data at any time by contacting us.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your location, you may have rights including:</p>
            <ul>
              <li>Access to the personal data we hold about you</li>
              <li>Correction of inaccurate data</li>
              <li>Deletion of your data ("right to be forgotten")</li>
              <li>Opt-out of marketing communications at any time</li>
              <li>Data portability</li>
            </ul>
            <p>To exercise any right, contact us at <strong>info@noveliotech.com</strong>.</p>
          </Section>

          <Section title="8. Data Security">
            <p>We implement industry-standard security measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete it immediately.</p>
          </Section>

          <Section title="10. Third-Party Links">
            <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their policies.</p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes by updating the "Last updated" date at the top of this page. Continued use of our website after changes constitutes acceptance.</p>
          </Section>

          <Section title="12. SMS / Text Messaging Program">
            <p>When you provide your mobile phone number and opt in through one of our forms (such as our contact form or free website request form), you consent to receive text messages (SMS) from Novelio Technologies related to your inquiry. These messages may include replies to your questions, appointment scheduling and reminders, quote and proposal follow-ups, and project updates.</p>
            <ul>
              <li><strong>Message frequency:</strong> varies based on your interaction with us.</li>
              <li><strong>Message and data rates:</strong> may apply, depending on your mobile carrier and plan.</li>
              <li><strong>Opt out:</strong> reply <strong>STOP</strong> at any time to unsubscribe from text messages.</li>
              <li><strong>Help:</strong> reply <strong>HELP</strong> for assistance, or email <strong>info@noveliotech.com</strong>.</li>
            </ul>
            <p><strong>We do not sell, rent, or share your mobile phone number or SMS opt-in information with any third parties or affiliates for their own marketing or promotional purposes.</strong> Consent to receive text messages is not a condition of purchasing any product or service. You may opt out at any time without affecting our other services.</p>
          </Section>

          <Section title="13. Contact Us">
            <p>If you have questions about this Privacy Policy, please contact us:</p>
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
      <p>Phone: <a href="tel:+18887384655" className="text-[#1D4ED8] hover:underline">(888) 738-4655</a></p>
    </div>
  );
}
