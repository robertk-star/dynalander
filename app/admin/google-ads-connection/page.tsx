import AdminShell from '../_components/AdminShell';
import ConnectionStatus from './ConnectionStatus';

export default function GoogleAdsConnectionPage() {
  return (
    <AdminShell
      title="Google Ads Connection"
      subtitle="Connection safety page before live account data is pulled. DynLander remains read-only in this phase."
    >
      <ConnectionStatus />
    </AdminShell>
  );
}
