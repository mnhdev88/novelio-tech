import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, CheckCircle, AlertCircle, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

// Reuses the same Formspree form as the contact page; tagged with a distinct
// subject so these leads can be filtered. Override via VITE_FORMSPREE_LEAD_ID.
const FORM_ENDPOINT = `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_LEAD_ID || 'xwpbqpbq'}`;

const INDUSTRIES = [
  'Restaurant / Café', 'Retail / Store', 'Salon / Spa / Beauty', 'Home Services (Plumbing, HVAC, etc.)',
  'Real Estate', 'Healthcare / Clinic / Dental', 'Legal / Professional Services', 'Fitness / Gym / Wellness',
  'Automotive', 'Construction / Contractor', 'Education / Coaching', 'E-commerce / Online Store', 'Other',
];

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-[rgba(29,78,216,0.15)] bg-[#f8faff] text-[#334155] text-sm placeholder-[#94a3b8] focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)] transition-all';

function Label({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-[#1B3172] mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Field({ label, required, type = 'text', placeholder, value, onChange, hint }) {
  return (
    <div>
      <Label required={required}>
        {label}
        {hint && <span className="font-normal text-[#64748b] text-xs ml-1">{hint}</span>}
      </Label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} className={inputCls} />
    </div>
  );
}

export default function FreeWebsiteModal({ onClose }) {
  const [step, setStep] = useState('offer'); // 'offer' | 'form'
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', industry: '',
    gmb: '', website: '', facebook: '', instagram: '',
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) return;
    setStatus('submitting');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'Free Website Lead — Novelio Technologies',
          'Lead Source': 'Hero — Website included with growth plan (24-hour preview) offer',
          'Full Name': form.name,
          Email: form.email,
          Phone: form.phone,
          'Industry / Business Type': form.industry,
          'Google My Business URL': form.gmb || '—',
          'Current Website URL': form.website || '—',
          'Facebook Page': form.facebook || '—',
          'Instagram Handle': form.instagram || '—',
          'Consent to be contacted': 'Yes',
        }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Card */}
        <motion.div
          className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[92dvh] flex flex-col"
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          {/* Close button (floating) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-lg border border-slate-200 bg-white/90 flex items-center justify-center text-[#64748b] hover:text-[#1B3172] hover:border-[#1B3172] transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ── Step 1: Offer ── */}
          {step === 'offer' && (
            <div className="px-7 py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6B3FA0] to-[#1D4ED8] flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-heading font-800 text-[#1B3172] text-2xl sm:text-3xl leading-tight mb-3">
                Start your business growth with the{' '}
                <span style={{ background: 'linear-gradient(135deg, #6B3FA0 0%, #1D4ED8 50%, #0EA5E9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  right website
                </span>
                .
                <br />
                See it live in 24 hours.
              </h2>
              <p className="text-[#64748b] text-sm leading-relaxed max-w-sm mx-auto mb-6">
                Your website, SSL, hosting and lead-capture setup are included free with your
                monthly growth plan — no heavy upfront website cost. We build your preview first.
              </p>
              {/* Trust benefits */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 max-w-xs mx-auto mb-8 text-left">
                {['No credit card', 'Free live preview', 'Preview in 24 hrs', 'Pay only if you love it'].map((b) => (
                  <div key={b} className="flex items-center gap-2 text-sm text-[#475569]">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                    {b}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-[15px] font-semibold transition-all cursor-pointer"
                >
                  Yes, I'm Ready to Grow
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl text-sm font-medium text-[#64748b] hover:text-[#1B3172] transition-all cursor-pointer"
                >
                  No thanks, I'll pass
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Form ── */}
          {step === 'form' && status !== 'success' && (
            <>
              <div className="px-6 pt-7 pb-4 border-b border-[rgba(29,78,216,0.08)] shrink-0">
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#64748b] mb-1">Step 2 of 2</p>
                <h2 className="font-heading font-bold text-[#1B3172] text-lg leading-tight">
                  Great! Tell us a bit about your business
                </h2>
              </div>

              <div className="overflow-y-auto flex-1">
                <form id="free-website-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                  <Field label="Full Name" required placeholder="Your full name" value={form.name} onChange={set('name')} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Email Address" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} />
                    <Field label="Phone Number" type="tel" required placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} />
                  </div>

                  <div>
                    <Label required>Industry / Type of Business</Label>
                    <select required value={form.industry} onChange={set('industry')} className={`${inputCls} appearance-none`}>
                      <option value="" disabled>Select your industry…</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>

                  <Field label="Google My Business URL" type="url" hint="(preferred)" placeholder="https://maps.google.com/…" value={form.gmb} onChange={set('gmb')} />
                  <Field label="Current Website URL" type="url" hint="(if you have one)" placeholder="https://yoursite.com" value={form.website} onChange={set('website')} />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Facebook Page" type="url" hint="(preferred)" placeholder="facebook.com/yourpage" value={form.facebook} onChange={set('facebook')} />
                    <Field label="Instagram Handle" hint="(preferred)" placeholder="@yourbrand" value={form.instagram} onChange={set('instagram')} />
                  </div>

                  {/* Consent */}
                  <label className="flex items-start gap-3 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      required
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#1B3172] focus:ring-[#1B3172] cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-[#64748b] leading-relaxed">
                      I agree that someone from Novelio Technologies may call me to understand my requirements
                      and present the website. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  {status === 'error' && (
                    <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Something went wrong. Please try again or email <a href="mailto:info@noveliotech.com" className="underline font-semibold">info@noveliotech.com</a> directly.</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-4 border-t border-[rgba(29,78,216,0.08)] bg-white rounded-b-3xl">
                <button
                  type="submit"
                  form="free-website-form"
                  disabled={status === 'submitting' || !consent}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-[15px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  ) : (
                    <>Get My Free Website Preview <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[#64748b] mt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  We respect your privacy. No spam, ever. Our team will reach out within a few hours.
                </p>
              </div>
            </>
          )}

          {/* ── Success ── */}
          {status === 'success' && (
            <div className="px-6 py-14 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-heading font-bold text-[#1B3172] text-xl mb-2">You're all set!</h3>
              <p className="text-[#64748b] text-sm leading-relaxed max-w-xs mx-auto mb-7">
                Thanks, <strong>{form.name || 'there'}</strong>! Your request is in. One of our team members
                will reach out within a few hours to get started on your free website preview.
              </p>
              <button onClick={onClose} className="btn-primary px-8 py-3 text-sm cursor-pointer">Done</button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
