import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Plus, Trash2, ChevronUp, GripVertical, ArrowRight } from 'lucide-react';
import useContentFile from '../useContentFile';
import { Text, Field, inputCls, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

// This editor exposes text only. Icons, gradient classes, hex accents and glow
// values stay untouched on every save: they are visual design rather than copy,
// and putting them in a text box is how a homepage ends up with a broken colour
// or a missing icon. Each card spreads the original object, so those fields
// survive an edit even though nothing here shows them.

function Section({ title, description, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#F8FAFC] cursor-pointer"
      >
        <div className="min-w-0">
          <h2 className="font-heading font-800 text-[#1B3172]">{title}</h2>
          {description && <p className="text-xs text-[#64748b]">{description}</p>}
        </div>
        <div className="flex-1" />
        {count !== undefined && (
          <span className="text-xs font-semibold text-[#94a3b8]">{count} item{count === 1 ? '' : 's'}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-[#94a3b8] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 border-t border-slate-100 pt-4">{children}</div>}
    </section>
  );
}

/** Reorderable list of plain strings (cycle steps, benefits, bullet points). */
function StringList({ items, onChange, placeholder, addLabel }) {
  const set = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col">
            <button onClick={() => move(i, -1)} disabled={i === 0}
              className="p-0.5 text-[#cbd5e1] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move up">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
              className="p-0.5 text-[#cbd5e1] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move down">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <input value={item} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} className={`${inputCls} flex-1`} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-2 text-[#94a3b8] hover:text-red-600 cursor-pointer" aria-label="Remove">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => onChange([...items, ''])}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-[#64748b] hover:border-[#1B3172] hover:text-[#1B3172] cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel || 'Add'}
      </button>
    </div>
  );
}

/** A card in a list of objects — renders only the text fields it is told to. */
function CardList({ items, onChange, fields, titleKey, allowAdd, blank }) {
  const set = (i, patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] border-b border-slate-100">
            <GripVertical className="w-3.5 h-3.5 text-[#cbd5e1] shrink-0" />
            <span className="text-xs font-semibold text-[#475569] truncate">
              {item[titleKey] || `Item ${i + 1}`}
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
            {allowAdd && (
              <button onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="p-1 text-[#cbd5e1] hover:text-red-600 cursor-pointer" aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-3 space-y-3">
            {fields.map((f) => {
              if (f.type === 'list') {
                return (
                  <div key={f.key}>
                    <span className="block text-xs font-semibold text-[#475569] mb-1.5">{f.label}</span>
                    <StringList
                      items={item[f.key] || []}
                      onChange={(v) => set(i, { [f.key]: v })}
                      placeholder={f.placeholder}
                      addLabel={f.addLabel}
                    />
                  </div>
                );
              }
              if (f.type === 'textarea') {
                return (
                  <Field key={f.key} label={f.label} hint={f.hint}>
                    <textarea
                      value={item[f.key] || ''} rows={f.rows || 3}
                      onChange={(e) => set(i, { [f.key]: e.target.value })}
                      className={inputCls}
                    />
                  </Field>
                );
              }
              return (
                <Text key={f.key} label={f.label} hint={f.hint}
                  value={item[f.key]} onChange={(v) => set(i, { [f.key]: v })} />
              );
            })}
          </div>
        </div>
      ))}

      {allowAdd && (
        <button
          onClick={() => onChange([...items, { ...blank }])}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-[#64748b] hover:border-[#1B3172] hover:text-[#1B3172] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      )}
    </div>
  );
}

export default function HomePageEditor() {
  const { data, update, state, error } = useContentFile('content/homepage.json');
  if (!data) return <Spinner />;

  const h = data;
  const setHero = (patch) => update({ ...h, hero: { ...h.hero, ...patch } });
  const setPart = (section, patch) => update({ ...h, [section]: { ...h[section], ...patch } });

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader title="Home page" subtitle="The words on your front page, section by section.">
        <SaveState state={state} />
      </PageHeader>

      <ErrorNote>{error}</ErrorNote>

      <Section title="Hero" description="The first thing visitors read." defaultOpen>
        <div className="space-y-4">
          <Text label="Badge above the headline" value={h.hero.badge} onChange={(v) => setHero({ badge: v })} />

          <div>
            <span className="block text-xs font-semibold text-[#475569] mb-1.5">Headline</span>
            <div className="grid sm:grid-cols-3 gap-2">
              <input value={h.hero.headlineBefore} onChange={(e) => setHero({ headlineBefore: e.target.value })}
                className={inputCls} placeholder="Start" />
              <input value={h.hero.headlineHighlight} onChange={(e) => setHero({ headlineHighlight: e.target.value })}
                className={`${inputCls} border-[#6B3FA0]`} placeholder="Highlighted" />
              <input value={h.hero.headlineAfter} onChange={(e) => setHero({ headlineAfter: e.target.value })}
                className={inputCls} placeholder="End" />
            </div>
            <p className="text-[11px] text-[#94a3b8] mt-1.5">
              The middle part is the coloured, clickable phrase that opens the offer popup.
            </p>
            <p className="mt-2 text-sm text-[#1B3172] font-heading font-800">
              {h.hero.headlineBefore}{' '}
              <span className="bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                {h.hero.headlineHighlight}
              </span>{' '}
              {h.hero.headlineAfter}
            </p>
          </div>

          <Text label="Tagline" value={h.hero.tagline} onChange={(v) => setHero({ tagline: v })} />

          <Field label="Supporting paragraph">
            <textarea value={h.hero.subheadline} rows={3}
              onChange={(e) => setHero({ subheadline: e.target.value })} className={inputCls} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Text label="Button text" value={h.hero.ctaLabel} onChange={(v) => setHero({ ctaLabel: v })} />
            <Text label="Text before the phone number" hint="The number itself comes from your contact details."
              value={h.hero.callPrompt} onChange={(v) => setHero({ callPrompt: v })} />
          </div>
        </div>
      </Section>

      <Section title="Growth areas" description="The four problem areas you diagnose."
        count={h.growthSystem.areas.length}>
        <CardList
          items={h.growthSystem.areas}
          onChange={(areas) => setPart('growthSystem', { areas })}
          titleKey="title"
          fields={[
            { key: 'title', label: 'Area name' },
            { key: 'mainPain', label: 'The problem', type: 'textarea', rows: 4 },
            { key: 'problems', label: 'Symptoms', type: 'list', placeholder: 'A problem the customer recognises', addLabel: 'Add symptom' },
            { key: 'result', label: 'The result you deliver', type: 'textarea', rows: 2 },
          ]}
        />
      </Section>

      <Section title="Growth cycle" description="The twelve stages around the circle."
        count={h.growthCycle.steps.length}>
        <StringList
          items={h.growthCycle.steps}
          onChange={(steps) => setPart('growthCycle', { steps })}
          placeholder="Stage name" addLabel="Add stage"
        />
        <p className="text-[11px] text-[#94a3b8] mt-2">
          Short words work best — these sit around a circle and long labels will wrap awkwardly.
        </p>
      </Section>

      <Section title="Three pillars" description="Visibility, trust and conversion."
        count={h.growthFramework.pillars.length}>
        <CardList
          items={h.growthFramework.pillars}
          onChange={(pillars) => setPart('growthFramework', { pillars })}
          titleKey="title"
          fields={[
            { key: 'title', label: 'Pillar' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ]}
        />
      </Section>

      <Section title="What a growth website covers" description="The ten-point checklist."
        count={h.growthFramework.covers.length}>
        <CardList
          items={h.growthFramework.covers}
          onChange={(covers) => setPart('growthFramework', { covers })}
          titleKey="title"
          allowAdd
          blank={{ title: '', desc: '', icon: 'Star' }}
          fields={[
            { key: 'title', label: 'Item' },
            { key: 'desc', label: 'Description', type: 'textarea', rows: 2 },
          ]}
        />
      </Section>

      <Section title="Website offer benefits" description="Bullet points in the free-website section."
        count={h.freeWebsiteCTA.benefits.length}>
        <StringList
          items={h.freeWebsiteCTA.benefits}
          onChange={(benefits) => setPart('freeWebsiteCTA', { benefits })}
          placeholder="A benefit" addLabel="Add benefit"
        />
      </Section>

      <Section title="Why choose us" description="Four reasons plus the results bars."
        count={h.whyChooseUs.pillars.length + h.whyChooseUs.metrics.length}>
        <CardList
          items={h.whyChooseUs.pillars}
          onChange={(pillars) => setPart('whyChooseUs', { pillars })}
          titleKey="title"
          fields={[
            { key: 'title', label: 'Reason' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ]}
        />

        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="block text-xs font-semibold text-[#475569] mb-2">Result bars</span>
          {h.whyChooseUs.metrics.map((m, i) => (
            <div key={i} className="grid sm:grid-cols-[1fr_100px_90px] gap-2 mb-2">
              <input
                value={m.label}
                onChange={(e) => setPart('whyChooseUs', {
                  metrics: h.whyChooseUs.metrics.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                })}
                className={inputCls} placeholder="Label"
              />
              <input
                value={m.val}
                onChange={(e) => setPart('whyChooseUs', {
                  metrics: h.whyChooseUs.metrics.map((x, j) => (j === i ? { ...x, val: e.target.value } : x)),
                })}
                className={inputCls} placeholder="+85%"
              />
              <input
                type="number" min="0" max="100" value={m.pct}
                onChange={(e) => setPart('whyChooseUs', {
                  metrics: h.whyChooseUs.metrics.map((x, j) => (j === i ? { ...x, pct: Number(e.target.value) } : x)),
                })}
                className={inputCls}
              />
            </div>
          ))}
          <p className="text-[11px] text-[#94a3b8]">
            The last column is how full the bar is drawn (0–100). It does not have to match the number shown.
          </p>
        </div>
      </Section>

      {/* The home page FAQ is edited under "Questions & answers", alongside the
          pricing FAQ. Two editors writing the same data would let one overwrite
          the other, so this only points at it. */}
      <section className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h2 className="font-heading font-800 text-[#1B3172]">Frequently asked questions</h2>
          <p className="text-xs text-[#64748b]">
            {h.faq.items.length} question{h.faq.items.length === 1 ? '' : 's'} on the home page.
          </p>
        </div>
        <div className="flex-1" />
        <Link
          to="/admin/faq"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-[#475569] hover:border-[#1B3172] hover:text-[#1B3172]"
        >
          Edit questions <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      <p className="text-xs text-[#94a3b8]">
        Icons and colours are set in the design and are not editable here, so changing wording can
        never break the layout.
      </p>
    </div>
  );
}
