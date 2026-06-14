import AdminShell from '../_components/AdminShell';
import AdReviewerPanel from './AdReviewerPanel';

export default function AdReviewerPage() {
  return (
    <AdminShell title="Ad Reviewer" subtitle="Select a live Meta ad and compare current details against recommended improvements.">
      <AdReviewerPanel />
    </AdminShell>
  );
}
