import { Plus, Trash2, ChevronUp, ChevronDown, Star, Quote } from 'lucide-react';
import useContentFile from '../useContentFile';
import { Text, Field, inputCls, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

/** Initials shown in the avatar circle, derived from the name. */
function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function TestimonialsPage() {
  const { data, update, state, error } = useContentFile('content/testimonials.json');
  if (!data) return <Spinner />;

  const items = Array.isArray(data) ? data : [];

  const set = (i, patch) => update(items.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };

  const remove = (i) => {
    if (!window.confirm(`Remove the review from ${items[i].name || 'this customer'}?`)) return;
    update(items.filter((_, j) => j !== i));
  };

  const add = () => {
    // ids are numeric in this file; keep that going rather than mixing types.
    const nextId = items.reduce((m, t) => Math.max(m, Number(t.id) || 0), 0) + 1;
    update([...items, {
      id: nextId, quote: '', name: '', role: '', company: '',
      rating: 5, avatar: '', service: '', result: '',
    }]);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Testimonials"
        subtitle="Customer reviews shown on the home page and elsewhere on the site."
      >
        <SaveState state={state} />
      </PageHeader>

      <ErrorNote>{error}</ErrorNote>

      <div className="space-y-4">
        {items.map((t, i) => (
          <div key={t.id ?? i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#F8FAFC] border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue grid place-items-center text-white text-[11px] font-bold shrink-0">
                {t.avatar || initials(t.name) || '?'}
              </div>
              <span className="text-xs font-semibold text-[#475569] truncate">
                {t.name || 'New review'}{t.company ? ` — ${t.company}` : ''}
              </span>
              <div className="flex-1" />
              <button onClick={() => move(i, -1)} disabled={i === 0}
                className="p-1 text-[#cbd5e1] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move up">
                <ChevronUp className="w-4 h-4" />
              </button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
                className="p-1 text-[#cbd5e1] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move down">
                <ChevronDown className="w-4 h-4" />
              </button>
              <button onClick={() => remove(i)}
                className="p-1 text-[#cbd5e1] hover:text-red-600 cursor-pointer" aria-label="Remove review">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <Field label="What they said">
                <textarea
                  value={t.quote || ''} rows={3}
                  onChange={(e) => set(i, { quote: e.target.value })}
                  placeholder="Their words, in full sentences."
                  className={inputCls}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Text label="Name" value={t.name} onChange={(v) => set(i, { name: v })} />
                <Text label="Job title" value={t.role} onChange={(v) => set(i, { role: v })} />
                <Text label="Business" value={t.company} onChange={(v) => set(i, { company: v })} />
                <Text
                  label="Service they bought"
                  hint="Shown as a small tag on the review."
                  value={t.service}
                  onChange={(v) => set(i, { service: v })}
                />
              </div>

              <Text
                label="Result"
                hint="The concrete outcome, e.g. “+42% local calls in 60 days”. This is what makes a review persuasive."
                value={t.result}
                onChange={(v) => set(i, { result: v })}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Star rating">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n} type="button" onClick={() => set(i, { rating: n })}
                        className="p-0.5 cursor-pointer" aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      >
                        <Star className={`w-5 h-5 ${
                          n <= (t.rating ?? 5) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`} />
                      </button>
                    ))}
                  </div>
                </Field>

                <Text
                  label="Avatar initials"
                  hint={`Leave blank to use ${initials(t.name) || 'their initials'}.`}
                  value={t.avatar}
                  maxLength={3}
                  onChange={(v) => set(i, { avatar: v.toUpperCase() })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-[#64748b] hover:border-[#1B3172] hover:text-[#1B3172] cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add a review
      </button>

      {items.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <Quote className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-[#64748b]">No reviews yet.</p>
        </div>
      )}

      <p className="text-xs text-[#94a3b8] mt-4">
        Only publish reviews the customer actually gave you and agreed to have shown.
      </p>
    </div>
  );
}
