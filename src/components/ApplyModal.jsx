import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

// Applications are stored in the CRM (crm.noveliotech.com → Careers), which
// also emails the hiring inbox. Same key the newsletter form uses.
const ENDPOINT = 'https://crm.noveliotech.com/api/public/careers/apply';
const API_KEY = import.meta.env.VITE_CRM_API_KEY || '059a24cc5a5913069b5a13149f149e62fd48d56edb668d2a35cf29306a442025d5d74d12eefdd36d069f42aa4db6c858';

function Label({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-[#1B3172] mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-[rgba(29,78,216,0.15)] bg-[#f8faff] text-[#334155] text-sm placeholder-[#94a3b8] focus:outline-none focus:border-[#1B3172] focus:ring-2 focus:ring-[rgba(27,49,114,0.08)] transition-all';

function Field({ label, required, type = 'text', placeholder, value, onChange }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} className={inputCls} />
    </div>
  );
}

function Textarea({ label, required, rows = 3, placeholder, value, onChange }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange} required={required} className={`${inputCls} resize-none`} />
    </div>
  );
}

export default function ApplyModal({ job, onClose }) {
  const isSEO = /seo/i.test(job?.title || '');

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    linkedin: '', cover: '',
    responsibilities: '', seoTasks: '', liveUrls: '', results: '', tools: '',
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');

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

    setStatus('submitting');
    try {
      const data = new FormData();

      data.append('job_id', job.id || '');
      data.append('job_title', job.title);
      data.append('name', form.name);
      data.append('email', form.email);
      data.append('phone', form.phone);

      if (isSEO) {
        data.append('responsibilities', form.responsibilities);
        data.append('seo_tasks', form.seoTasks);
        data.append('live_urls', form.liveUrls);
        data.append('results', form.results);
        data.append('tools', form.tools);
      } else {
        if (form.linkedin) data.append('linkedin', form.linkedin);
        data.append('cover', form.cover);
      }
      if (file) data.append('resume', file, file.name);

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { 'x-api-key': API_KEY },
      });

      if (res.ok) {
        trackEvent('submit_application', { job_title: job.title, job_id: job.id || '' });
      }
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
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
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[rgba(29,78,216,0.08)] shrink-0">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#64748b] mb-0.5">
                {isSEO ? 'Send Work Profile' : 'Apply Now'}
              </p>
              <h2 className="font-heading font-bold text-[#1B3172] text-lg leading-tight">{job.title}</h2>
              <p className="text-xs text-[#64748b] mt-0.5">Novelio Technologies · {isSEO ? 'Gurgaon, India' : 'US / India'}</p>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-lg border border-slate-200 flex items-center justify-center text-[#64748b] hover:text-[#1B3172] hover:border-[#1B3172] transition-all shrink-0 ml-4 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            {status === 'success' ? (
              <div className="px-6 py-14 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-heading font-bold text-[#1B3172] text-xl mb-2">
                  {isSEO ? 'Work Profile Sent!' : 'Application Submitted!'}
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed max-w-xs mx-auto mb-7">
                  Your {isSEO ? 'work profile' : 'application'} for <strong>{job.title}</strong> has been sent to the Novelio team. We'll get back to you within 48 hours.
                </p>
                <button onClick={onClose} className="btn-primary px-8 py-3 text-sm cursor-pointer">
                  Done
                </button>
              </div>
            ) : (
              <form id="apply-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

                {/* Always visible */}
                <Field label="Full Name" required placeholder="Your full name" value={form.name} onChange={set('name')} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email Address" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} />
                  <Field label="Phone Number" type="tel" required placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} />
                </div>

                {/* ── SEO variant ── */}
                {isSEO ? (
                  <>
                    <Textarea
                      label="Your Responsibilities in Current / Last Role"
                      required rows={3}
                      placeholder="Describe what you were responsible for — team size, client types, deliverables..."
                      value={form.responsibilities}
                      onChange={set('responsibilities')}
                    />
                    <Textarea
                      label="Exact SEO Tasks You Personally Executed"
                      required rows={3}
                      placeholder="On-page optimisation, keyword research, link building, GMB management, technical audits..."
                      value={form.seoTasks}
                      onChange={set('seoTasks')}
                    />
                    <Textarea
                      label="Live URLs You Have Worked On (Last 12 Months)"
                      required rows={4}
                      placeholder={"https://example.com — role: on-page + GMB\nhttps://another-site.com — role: full SEO audit + link building\n\nDescribe your specific involvement for each URL."}
                      value={form.liveUrls}
                      onChange={set('liveUrls')}
                    />
                    <Textarea
                      label="Results Achieved"
                      required rows={3}
                      placeholder="Keyword rankings improved, organic traffic % increase, GMB impressions/calls, leads generated..."
                      value={form.results}
                      onChange={set('results')}
                    />
                    <Textarea
                      label="SEO Tools You Have Used"
                      required rows={2}
                      placeholder="Ahrefs, SEMrush, Google Search Console, Screaming Frog, Moz, BrightLocal..."
                      value={form.tools}
                      onChange={set('tools')}
                    />
                    {isSEO && (
                      <div>
                        <Label>Resume / CV <span className="font-normal text-[#64748b] text-xs">(Optional · PDF or Word · max 5 MB)</span></Label>
                        <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed border-[rgba(29,78,216,0.18)] bg-[#f8faff] cursor-pointer hover:border-[#1B3172] hover:bg-blue-50/30 transition-all group">
                          <Upload className="w-4 h-4 text-[#64748b] group-hover:text-[#1B3172] transition-colors shrink-0" />
                          <span className="text-sm text-[#64748b] group-hover:text-[#1B3172] transition-colors truncate">
                            {file ? file.name : 'Attach your CV if you have one'}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    )}
                  </>
                ) : (
                  /* ── Standard variant ── */
                  <>
                    <Field
                      label="LinkedIn / Portfolio URL"
                      type="url"
                      placeholder="https://linkedin.com/in/yourname"
                      value={form.linkedin}
                      onChange={set('linkedin')}
                    />
                    <Textarea
                      label="Why This Role?"
                      required rows={4}
                      placeholder="Tell us why you're applying and what makes you a strong fit for this position..."
                      value={form.cover}
                      onChange={set('cover')}
                    />

                    {/* File upload */}
                    <div>
                      <Label>Resume / CV <span className="font-normal text-[#64748b] text-xs">(PDF or Word · max 5 MB)</span></Label>
                      <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed border-[rgba(29,78,216,0.18)] bg-[#f8faff] cursor-pointer hover:border-[#1B3172] hover:bg-blue-50/30 transition-all group">
                        <Upload className="w-4 h-4 text-[#64748b] group-hover:text-[#1B3172] transition-colors shrink-0" />
                        <span className="text-sm text-[#64748b] group-hover:text-[#1B3172] transition-colors truncate">
                          {file ? file.name : 'Click to upload your resume'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </>
                )}

                {status === 'error' && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Something went wrong. Please try again or email <a href="mailto:ajay@noveliotech.com" className="underline font-semibold">ajay@noveliotech.com</a> directly.</span>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* Footer actions */}
          {status !== 'success' && (
            <div className="shrink-0 px-6 py-4 border-t border-[rgba(29,78,216,0.08)] flex items-center justify-between gap-3 bg-white rounded-b-3xl">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[rgba(29,78,216,0.15)] text-sm font-semibold text-[#64748b] hover:text-[#1B3172] hover:border-[#1B3172] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="apply-form"
                disabled={status === 'submitting'}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1B3172] hover:bg-[#0d1f5c] text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                ) : (
                  <><Send className="w-4 h-4" />{isSEO ? 'Send Work Profile' : 'Submit Application'}</>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
