import AdminShell from '../_components/AdminShell';
import MetaSetupDetailsPanel from './MetaSetupDetailsPanel';

export default function MetaSetupDetailsPage() {
  return (
    <AdminShell title="Meta Setup Details" subtitle="Review the exact live setup Meta returns for campaigns, ad sets, and ads.">
      <MetaSetupDetailsPanel />
    </AdminShell>
  );
}
