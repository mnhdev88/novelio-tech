import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import useContentFile from '../useContentFile';
import { Card, Text, Field, inputCls, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

// Editing a menu is list manipulation, and doing it three times in this file
// would be three chances to get the index maths wrong.
function LinkList({ items, onChange, allowHref }) {
  const set = (i, patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i) => onChange(items.filter((_, j) => j !== i));

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

          <input
            value={item.label} onChange={(e) => set(i, { label: e.target.value })}
            placeholder="Menu text" className={`${inputCls} flex-1`}
          />
          <input
            value={item.href ?? item.to ?? ''}
            onChange={(e) => set(i, allowHref && item.href !== undefined
              ? { href: e.target.value }
              : { to: e.target.value })}
            placeholder="/page" className={`${inputCls} flex-1 font-mono text-xs`}
          />
          <button onClick={() => remove(i)}
            className="p-2 text-[#94a3b8] hover:text-red-600 cursor-pointer" aria-label="Remove link">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        onClick={() => onChange([...items, { label: 'New link', to: '/' }])}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-[#64748b] hover:border-[#1B3172] hover:text-[#1B3172] cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> Add link
      </button>
    </div>
  );
}

export default function SitePage() {
  const company = useContentFile('content/settings.json');
  const nav = useContentFile('content/navigation.json');

  if (!company.data || !nav.data) return <Spinner />;

  const c = company.data;
  const n = nav.data;
  const setC = (patch) => company.update({ ...c, ...patch });
  const setSocial = (patch) => company.update({ ...c, social: { ...c.social, ...patch } });

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader
        title="Header, footer & contact"
        subtitle="These appear on every page of the site."
      >
        <SaveState state={company.state === 'idle' ? nav.state : company.state} />
      </PageHeader>

      <ErrorNote>{company.error || nav.error}</ErrorNote>

      <Card title="Contact details" description="Used in the top bar, the footer, and the contact page.">
        <div className="grid sm:grid-cols-2 gap-4">
          <Text label="Email" value={c.email} onChange={(v) => setC({ email: v })} />
          <Text label="Phone" value={c.phone} onChange={(v) => setC({ phone: v })} />
          <Text label="WhatsApp number" hint="Digits only, with country code." value={c.whatsapp} onChange={(v) => setC({ whatsapp: v })} />
          <Text label="Office hours" value={c.hours} onChange={(v) => setC({ hours: v })} />
          <Text label="Address" value={c.address} onChange={(v) => setC({ address: v })} />
          <Text label="Tagline" value={c.tagline} onChange={(v) => setC({ tagline: v })} />
        </div>
      </Card>

      <Card title="Social profiles" description="Blank hides the icon. Full URLs, including https://">
        <div className="grid sm:grid-cols-2 gap-4">
          {['linkedin', 'facebook', 'instagram', 'twitter', 'youtube'].map((key) => (
            <Text
              key={key}
              label={key[0].toUpperCase() + key.slice(1)}
              value={c.social?.[key]}
              onChange={(v) => setSocial({ [key]: v })}
            />
          ))}
        </div>
      </Card>

      <Card title="Main menu" description="The links across the top of every page.">
        <LinkList items={n.header.links} onChange={(links) => nav.update({ ...n, header: { ...n.header, links } })} />
        <p className="text-[11px] text-[#94a3b8] mt-3">
          The Services link opens the services dropdown. Removing it removes the dropdown too.
        </p>
      </Card>

      <Card title="Footer" description="The small print row at the very bottom.">
        <Field label="Copyright line">
          <input value={n.footer.copyright} onChange={(e) => nav.update({ ...n, footer: { ...n.footer, copyright: e.target.value } })} className={inputCls} />
        </Field>
        <div className="mt-4">
          <span className="block text-xs font-semibold text-[#475569] mb-1.5">Legal links</span>
          <LinkList allowHref items={n.footer.legal} onChange={(legal) => nav.update({ ...n, footer: { ...n.footer, legal } })} />
        </div>
      </Card>
    </div>
  );
}
