import AdminShell from '../_components/AdminShell';
import MetaAdsLiveDashboard from './MetaAdsLiveDashboard';

export default function MetaAdsPage() {
  return (
    <AdminShell title="Meta Ads Intelligence" subtitle="Live read-only Meta Ads data preview with mock fallback. DynLander does not change Meta ads.">
      <MetaAdsLiveDashboard />
    </AdminShell>
  );
}
