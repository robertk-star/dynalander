import AdminShell from '../_components/AdminShell';
import ChangeHistoryPanel from './ChangeHistoryPanel';

export default function Page() {
  return (
    <AdminShell title="Changes" subtitle="Review saved snapshot changes.">
      <ChangeHistoryPanel />
    </AdminShell>
  );
}
