import { useState } from 'react';
import { Send, Check, Lock } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';
import { captureLead } from '../../utils/leadCapture';

const FORMSPREE_URL = 'https://formspree.io/f/xwpbqpbq';

// Short lead form for service-page heroes. Delivery works like the contact
// page: Formspree is what reaches the team, captureLead mirrors it into the
// admin panel's Leads inbox.
//
// The visitor's URL is sent as `site_url`, never `website`: capture.php treats
// a filled `website` field as its bot honeypot and silently drops the lead.
export default function ServiceLeadForm({
  source,
  service,
  title,
  subtitle,
  goals = [],
  submitLabel = 'Send My Request',
}) {
  const [form, setForm] = useState({ name: '', email: '', site_url: '', phone: '', goal: '' });
  const [hp, setHp] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.site_url.trim()) e.site_url = 'Website is required';
    else if (!/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(form.site_url.trim())) e.site_url = 'Enter a valid website, e.g. yourbusiness.com';
    // SMS consent is only asked for when a phone number is given, and never
    // made a condition of submitting the form without one.
    if (form.phone.trim() && !smsConsent) e.consent = 'Please agree to be contacted by phone, or leave the phone field empty.';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hp) { setSuccess(true); return; }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);

    const siteUrl = /^https?:\/\//i.test(form.site_url.trim()) ? form.site_url.trim() : `https://${form.site_url.trim()}`;
    const message = [
      `Service: ${service}`,
      `Website: ${siteUrl}`,
      form.goal && `Main goal: ${form.goal}`,
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `New ${service} lead: ${form.name}`,
          name: form.name,
          email: form.email,
          phone: form.phone,
          site_url: siteUrl,
          goal: form.goal,
          service,
          source,
          sms_consent: form.phone.trim() ? smsConsent : false,
        }),
      });
      if (!res.ok) throw new Error('submission failed');
      captureLead('lead', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message,
        source,
        meta: { service, site_url: siteUrl, goal: form.goal, sms_consent: smsConsent },
      });
      trackEvent('generate_lead', { form: source });
      setSuccess(true);
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again or email us directly at info@noveliotech.com.' });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full bg-white border rounded-xl px-4 py-3 text-[#1B3172] placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-[15px] ${
      errors[field] ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200/80 focus:border-brand-purple/60 focus:ring-brand-purple/20'
    }`;
  const labelClass = 'block text-xs font-medium text-[#475569] uppercase tracking-widest mb-1.5';

  if (success) {
    return (
      <div className="glass-card gradient-border rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-glow">
          <Check className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-heading font-700 text-[#1B3172] mb-2">Request received</h2>
        <p className="text-[#475569] text-sm leading-relaxed">
          Thanks, {form.name.split(' ')[0] || 'there'}. We'll review your website and get back to you
          by email with the biggest opportunities we find.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card gradient-border rounded-3xl p-6 sm:p-8">
      <h2 className="text-2xl font-heading font-700 text-[#1B3172] mb-1">{title}</h2>
      {subtitle && <p className="text-[#475569] text-sm leading-relaxed mb-5">{subtitle}</p>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Honeypot: hidden from people, filled by bots. */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label>Leave this empty<input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${source}-name`} className={labelClass}>Name *</label>
            <input id={`${source}-name`} type="text" autoComplete="name" value={form.name} onChange={handleChange('name')} placeholder="John Smith" className={inputClass('name')} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor={`${source}-email`} className={labelClass}>Email *</label>
            <input id={`${source}-email`} type="email" autoComplete="email" value={form.email} onChange={handleChange('email')} placeholder="john@company.com" className={inputClass('email')} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor={`${source}-site`} className={labelClass}>Website URL *</label>
          <input id={`${source}-site`} type="text" inputMode="url" autoComplete="url" value={form.site_url} onChange={handleChange('site_url')} placeholder="yourbusiness.com" className={inputClass('site_url')} />
          {errors.site_url && <p className="text-red-400 text-xs mt-1">{errors.site_url}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {goals.length > 0 && (
            <div>
              <label htmlFor={`${source}-goal`} className={labelClass}>Main Goal</label>
              <select id={`${source}-goal`} value={form.goal} onChange={handleChange('goal')} className={inputClass('goal')}>
                <option value="">Select one</option>
                {goals.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}
          <div className={goals.length > 0 ? '' : 'sm:col-span-2'}>
            <label htmlFor={`${source}-phone`} className={labelClass}>Phone (optional)</label>
            <input id={`${source}-phone`} type="tel" autoComplete="tel" value={form.phone} onChange={handleChange('phone')} placeholder="+1 (555) 000-0000" className={inputClass('phone')} />
          </div>
        </div>

        {form.phone.trim() && (
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => { setSmsConsent(e.target.checked); if (errors.consent) setErrors((er) => ({ ...er, consent: '' })); }}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-purple focus:ring-brand-purple cursor-pointer shrink-0"
            />
            <span className="text-xs text-[#64748b] leading-relaxed">
              I agree to receive phone calls and text messages (SMS) from Novelio Technologies about my
              inquiry. Message frequency varies; message and data rates may apply. Reply STOP to opt out,
              HELP for help.
            </span>
          </label>
        )}
        {errors.consent && <p className="text-red-400 text-xs">{errors.consent}</p>}
        {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-4 disabled:opacity-60 disabled:cursor-not-allowed">
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {submitLabel}
            </>
          )}
        </button>

        <p className="flex items-start justify-center gap-1.5 text-center text-xs text-[#64748b] leading-relaxed">
          <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            No obligation. We never sell or share your details. See our{' '}
            <a href="/privacy" className="text-brand-purple hover:underline">Privacy Policy</a>.
          </span>
        </p>
      </form>
    </div>
  );
}
