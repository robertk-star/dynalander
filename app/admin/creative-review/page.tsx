import AdminShell from '../_components/AdminShell';
import MetaCreativeLiveReview from './MetaCreativeLiveReview';

export default function CreativeReviewPage() {
  return (
    <AdminShell title="Creative Review" subtitle="Read-only Meta ad review with mock fallback.">
      <MetaCreativeLiveReview />
    </AdminShell>
  );
}
