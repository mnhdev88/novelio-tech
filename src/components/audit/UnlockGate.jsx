import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { LockedIssueRow } from './IssueCard';
import { unlockReport } from '../../utils/auditApi';
import { trackEvent } from '../../utils/analytics';

/**
 * The gate.
 *
 * What sits above it is the argument for crossing it: the remaining findings,
 * named but unreadable. The server has never sent their explanations, so the
 * list is honest about there being something behind it — and there is no
 * devtools trick that reveals it.
 *
 * Crossing it sends the summary by email rather than revealing it here, so every
 * promise in this component has to say inbox, not page. Copy that still said
 * "opens on this page" would be a lie told at the exact moment someone hands
 * over their details.
 */
export default function UnlockGate({ token, lockedIssues, lockedCount, host, onUnlocked }) {
  const [form, setForm] = useState({ email: '', name: '', phone: '', company: '' });
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');   // honeypot — real people never see it
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Enter a valid email address so we can send your report there.');
      return;
    }
    // Count digits and nothing else. Real numbers arrive as +91 98765 43210,
    // (908) 639-5666, 020 7946 0958 x214 — any pattern strict enough to police
    // the punctuation rejects somebody's genuine number, and on a required
    // field that means turning away a lead over formatting.
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 20) {
      setError('Enter a phone number we can reach you on, including the country code.');
      return;
    }
    if (!consent) {
      setError('Please tick the box so we know we may contact you about this audit.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const data = await unlockReport({ ...form, website, consent, token });
      trackEvent('generate_lead', { form: 'seo_audit', site: host });
      // `sent` false means the lead was captured but the mail server refused it.
      // The parent says so plainly rather than pointing at an empty inbox.
      onUnlocked({ ...data, email: form.email });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const field = (name, placeholder, type = 'text', required = false, extra = {}) => (
    <input
      type={type}
      required={required}
      value={form[name]}
      onChange={(e) => { setForm((f) => ({ ...f, [name]: e.target.value })); if (error) setError(''); }}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-3 text-[#1B3172] placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-brand-purple/60 focus:ring-brand-purple/20 transition-all text-[15px]"
      {...extra}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="glass-card gradient-border rounded-2xl overflow-hidden"
    >
      {lockedCount > 0 && (
        <div className="p-5 sm:p-7 border-b border-slate-200/80">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-brand-purple" aria-hidden="true" />
            <h3 className="font-heading font-700 text-[#1B3172] text-[17px]">
              {lockedCount} more {lockedCount === 1 ? 'issue' : 'issues'} found on {host}
            </h3>
          </div>

          {/* Named, so the visitor knows exactly what they are missing. The
              explanation and the fix for each is what the email unlocks. */}
          <div className="space-y-2">
            {lockedIssues.map((issue) => <LockedIssueRow key={issue.id} issue={issue} />)}
          </div>
        </div>
      )}

      <div className="p-5 sm:p-7 bg-gradient-to-br from-brand-purple/[0.04] to-brand-blue/[0.04]">
        <h3 className="font-heading font-700 text-[#1B3172] text-[19px] sm:text-[21px] mb-1.5">
          Get your report by email
        </h3>
        <p className="text-[14.5px] text-[#475569] leading-relaxed mb-5">
          {lockedCount > 0
            ? `We will send the full summary for ${host} — your score, every category, and the problems we found — straight to your inbox.`
            : `${host} scored well, which is rare. We will email you the full summary so you have it on record, along with where the remaining upside is.`}
        </p>

        <form onSubmit={submit} className="space-y-3">
          {/* The two required fields first and full width, so what is being
              asked for is obvious before anyone starts typing. */}
          {field('email', 'you@company.com', 'email', true, { autoComplete: 'email' })}

          {/* type="tel" gets a keypad rather than a keyboard on a phone, which
              is where most of these are filled in. Validation stays loose on
              purpose — see the digit count in submit(). */}
          {field('phone', 'Phone number', 'tel', true, { autoComplete: 'tel', inputMode: 'tel' })}

          <div className="grid sm:grid-cols-2 gap-3">
            {field('name', 'Your name (optional)', 'text', false, { autoComplete: 'name' })}
            {field('company', 'Company (optional)', 'text', false, { autoComplete: 'organization' })}
          </div>

          {/* Honeypot. Hidden from people, irresistible to form bots. */}
          <input
            type="text" name="website" tabIndex={-1} autoComplete="off"
            value={website} onChange={(e) => setWebsite(e.target.value)}
            className="absolute left-[-9999px] w-px h-px opacity-0" aria-hidden="true"
          />

          <label className="flex items-start gap-2.5 cursor-pointer pt-0.5">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => { setConsent(e.target.checked); if (error) setError(''); }}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-purple focus:ring-brand-purple/30"
            />
            <span className="text-[13px] text-[#64748b] leading-relaxed">
              You may contact me about this audit. No newsletter, no list — just this report and a
              follow-up if I want one.
            </span>
          </label>

          {error && <p className="text-[13.5px] text-red-600">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60">
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending your report…</>
            ) : (
              <>Email me the report <ArrowRight className="w-4 h-4" aria-hidden="true" /></>
            )}
          </button>

          <p className="text-[12px] text-[#94a3b8] text-center">
            One email with your results. No newsletter, and we never sell your details.
          </p>
        </form>
      </div>
    </motion.div>
  );
}
