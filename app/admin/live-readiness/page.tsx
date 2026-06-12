import AdminShell from '../_components/AdminShell';
import LiveReadinessChecklist from './LiveReadinessChecklist';

export default function LiveReadinessPage() {
  return (
    <AdminShell
      title="Live Readiness"
      subtitle="Go/no-go checklist before connecting and pulling a real Google Ads account."
    >
      <LiveReadinessChecklist />
    </AdminShell>
  );
}
