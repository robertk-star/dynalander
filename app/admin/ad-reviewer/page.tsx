import AdminShell from '../_components/AdminShell';
import Panel2 from './Panel2';

export default function AdReviewerPage() {
  return (
    <AdminShell title="Ad Reviewer" subtitle="Select a live Meta ad and compare the current setup against the suggested setup.">
      <Panel2 />
    </AdminShell>
  );
}
