import AdminShell from '../_components/AdminShell';
import AdReviewDashboard from './AdReviewDashboard';

export default function AdReviewPage() {
  return (
    <AdminShell
      title="Ad Review"
      subtitle="Review the current ad setup for the active client account and compare it against AI recommendations for headlines, descriptions, sitelinks, callouts, and landing page match."
    >
      <AdReviewDashboard />
    </AdminShell>
  );
}
