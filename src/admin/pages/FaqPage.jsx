import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, HelpCircle } from 'lucide-react';
import useContentFile from '../useContentFile';
import { inputCls, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

// The site has two separate FAQ sets in two different files. Presenting them as
// tabs keeps that a detail of storage rather than something the client has to
// know about — they just pick which page they are editing.
const TABS = [
  { id: 'home',    label: 'Home page',    file: 'content/homepage.json' },
  { id: 'pricing', label: 'Pricing page', file: 'content/pricing.json' },
];

function FaqList({ items, onChange, note }) {
  const set = (i, patch) => onChange(items.map((f, j) => (j === i ? { ...f, ...patch } : f)));

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i) => {
    if (!window.confirm('Delete this question?')) return;
    onChange(items.filter((_, j) => j !== i));
  };

  return (
    <div>
      <div className="space-y-3">
        {items.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] border-b border-slate-100">
              <HelpCircle className="w-3.5 h-3.5 text-[#64748b] shrink-0" />
              <span className="text-xs font-semibold text-[#475569] truncate">
                {f.q || `Question ${i + 1}`}
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
                className="p-1 text-[#cbd5e1] hover:text-red-600 cursor-pointer" aria-label="Delete question">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-3">
              <label className="block">
                <span className="block text-xs font-semibold text-[#475569] mb-1.5">Question</span>
                <input
                  value={f.q || ''} onChange={(e) => set(i, { q: e.target.value })}
                  placeholder="Phrase it the way a customer would ask it"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-[#475569] mb-1.5">Answer</span>
                <textarea
                  value={f.a || ''} rows={4}
                  onChange={(e) => set(i, { a: e.target.value })}
                  placeholder="Answer it directly in the first sentence, then add detail."
                  className={inputCls}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onChange([...items, { q: '', a: '' }])}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-semibold text-[#64748b] hover:border-[#1B3172] hover:text-[#1B3172] cursor-pointer"
      >
        <Plus className="w-4 h-4" /> Add a question
      </button>

      {note && <p className="text-xs text-[#94a3b8] mt-3">{note}</p>}
    </div>
  );
}

export default function FaqPage() {
  const [tab, setTab] = useState('home');
  const home = useContentFile('content/homepage.json');
  const pricing = useContentFile('content/pricing.json');

  const active = tab === 'home' ? home : pricing;
  if (!active.data) return <Spinner />;

  const items = tab === 'home'
    ? (home.data.faq?.items || [])
    : (pricing.data.faq || []);

  const setItems = (next) => {
    if (tab === 'home') {
      home.update({ ...home.data, faq: { ...home.data.faq, items: next } });
    } else {
      pricing.update({ ...pricing.data, faq: next });
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Questions & answers"
        subtitle="The FAQ sections on your site. Good answers here also win FAQ results in Google."
      >
        <SaveState state={active.state} />
      </PageHeader>

      <ErrorNote>{home.error || pricing.error}</ErrorNote>

      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold cursor-pointer ${
              tab === t.id ? 'bg-[#1B3172] text-white' : 'bg-white border border-slate-200 text-[#475569]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <FaqList
        items={items}
        onChange={setItems}
        note={tab === 'home'
          ? 'These questions are also published as FAQ markup for Google, so keep them genuine questions with real answers.'
          : 'Shown on the pricing page, under the plans.'}
      />
    </div>
  );
}
