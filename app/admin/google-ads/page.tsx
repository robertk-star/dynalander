import AdminShell from '../_components/AdminShell';
import GoogleAdsDashboard from './GoogleAdsDashboard';

export default function GoogleAdsDashboardPage() {
  return (
    <AdminShell
      title="Google Ads Intelligence"
      subtitle="Phase 2 dashboard with mock account filters, date range filters, campaign stats, ad message analysis, keyword review, search term waste, extensions, budget review, and AI-style recommendations. No live credentials are used yet."
    >
      <GoogleAdsDashboard />
    </AdminShell>
  );
}
