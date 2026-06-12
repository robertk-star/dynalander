import AdminShell from '../_components/AdminShell';
import MetaConnectionStatus from './MetaConnectionStatus';

export default function MetaAdsConnectionPage() {
  return (
    <AdminShell title="Meta Ads Connection" subtitle="Connection safety page for future Facebook / Meta Ads API access.">
      <MetaConnectionStatus />
    </AdminShell>
  );
}
