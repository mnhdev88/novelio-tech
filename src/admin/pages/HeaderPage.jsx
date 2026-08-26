import useContentFile from '../useContentFile';
import LinkList from '../LinkList';
import { Card, SaveState, ErrorNote, Spinner, PageHeader } from '../ui';

export default function HeaderPage() {
  const { data, update, state, error } = useContentFile('content/navigation.json');
  if (!data) return <Spinner />;

  return (
    <div className="max-w-3xl space-y-4">
      <PageHeader title="Header" subtitle="The menu across the top of every page.">
        <SaveState state={state} />
      </PageHeader>

      <ErrorNote>{error}</ErrorNote>

      <Card
        title="Main menu"
        description="The text on the left is what visitors see; on the right is the page it opens."
      >
        <LinkList
          items={data.header.links}
          onChange={(links) => update({ ...data, header: { ...data.header, links } })}
          addLabel="Add menu item"
        />
        <p className="text-[11px] text-[#94a3b8] mt-3">
          The Services item opens the services dropdown — removing it removes the dropdown too.
          Addresses starting with <code>/</code> are pages on your own site.
        </p>
      </Card>

      <Card title="Top bar" description="The thin dark strip above the menu.">
        <p className="text-sm text-[#64748b]">
          It shows your email, phone and office hours, which are edited under{' '}
          <strong>Contact details</strong> so they only have to be changed in one place.
        </p>
      </Card>
    </div>
  );
}
