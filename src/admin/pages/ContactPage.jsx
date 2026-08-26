import useContentFile from '../useContentFile';
import { Card, Text, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

const SOCIALS = [
  ['linkedin',  'LinkedIn'],
  ['facebook',  'Facebook'],
  ['instagram', 'Instagram'],
  ['twitter',   'X / Twitter'],
  ['youtube',   'YouTube'],
];

export default function ContactPage() {
  const { data, update, state, error } = useContentFile('content/settings.json');
  if (!data) return <Spinner />;

  const set = (patch) => update({ ...data, ...patch });
  const setSocial = (patch) => update({ ...data, social: { ...data.social, ...patch } });

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader
        title="Contact details"
        subtitle="Used in the top bar, the footer, the contact page and your Google listing."
      >
        <SaveState state={state} />
      </PageHeader>

      <ErrorNote>{error}</ErrorNote>

      <Card
        title="How customers reach you"
        description="Changing these updates every place they appear across the site at once."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Text label="Email" value={data.email} onChange={(v) => set({ email: v })} />
          <Text
            label="Phone"
            hint="Shown exactly as typed, e.g. +1 (888) 738-4655"
            value={data.phone}
            onChange={(v) => set({ phone: v })}
          />
          <Text
            label="WhatsApp number"
            hint="Digits and country code only, no spaces or brackets — it becomes a link."
            value={data.whatsapp}
            onChange={(v) => set({ whatsapp: v })}
          />
          <Text label="Office hours" value={data.hours} onChange={(v) => set({ hours: v })} />
          <Text label="Address" value={data.address} onChange={(v) => set({ address: v })} />
          <Text label="Tagline" value={data.tagline} onChange={(v) => set({ tagline: v })} />
        </div>
      </Card>

      <Card title="Social profiles" description="Leave one blank to hide its icon. Full addresses, including https://">
        <div className="grid sm:grid-cols-2 gap-4">
          {SOCIALS.map(([key, label]) => (
            <Text
              key={key}
              label={label}
              value={data.social?.[key]}
              onChange={(v) => setSocial({ [key]: v })}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
