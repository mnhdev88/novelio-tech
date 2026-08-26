import useContentFile from '../useContentFile';
import LinkList from '../LinkList';
import { Card, Field, inputCls, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

export default function FooterPage() {
  const { data, update, state, error } = useContentFile('content/navigation.json');
  if (!data) return <Spinner />;

  const setFooter = (patch) => update({ ...data, footer: { ...data.footer, ...patch } });

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader title="Footer" subtitle="The bottom of every page.">
        <SaveState state={state} />
      </PageHeader>

      <ErrorNote>{error}</ErrorNote>

      <Card title="Copyright line" description="The small print on the very last row.">
        <Field label="Text">
          <input
            value={data.footer.copyright}
            onChange={(e) => setFooter({ copyright: e.target.value })}
            className={inputCls}
          />
        </Field>
      </Card>

      <Card title="Legal links" description="Privacy, terms and the rest of the bottom row.">
        <LinkList
          allowHref
          items={data.footer.legal}
          onChange={(legal) => setFooter({ legal })}
          addLabel="Add legal link"
        />
        <p className="text-[11px] text-[#94a3b8] mt-3">
          Removing Privacy Policy or Terms of Service is usually a bad idea — payment providers and
          Google both expect them to exist.
        </p>
      </Card>

      <Card title="Contact block and services list" description="The upper part of the footer.">
        <p className="text-sm text-[#64748b]">
          Your address, phone and social icons come from <strong>Contact details</strong>, and the
          services column is generated from your services, so both stay correct on their own.
        </p>
      </Card>
    </div>
  );
}
