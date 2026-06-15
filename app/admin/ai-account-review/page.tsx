import AdminShell from '../_components/AdminShell';
import AiAccountReviewPanel from './AiAccountReviewPanel';

export default function AiAccountReviewPage() {
  return (
    <AdminShell title="AI Account Review" subtitle="Read-only Meta account review.">
      <AiAccountReviewPanel />
    </AdminShell>
  );
}
