import AdminShell from '../_components/AdminShell';
import DashboardSummaryPanel from './DashboardSummaryPanel';

export default function DashboardSummaryPage() {
  return (
    <AdminShell title="Dashboard Summary" subtitle="Active-account Meta summary by selected date range.">
      <DashboardSummaryPanel />
    </AdminShell>
  );
}
