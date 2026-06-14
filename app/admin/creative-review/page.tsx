import AdminShell from '../_components/AdminShell';
import MetaLiveAdRows from './MetaLiveAdRows';

export default function CreativeReviewPage() {
  return (
    <AdminShell title="Creative Review" subtitle="Read-only live Meta ad rows for the active account.">
      <MetaLiveAdRows />
    </AdminShell>
  );
}
