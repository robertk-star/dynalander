import AdminShell from '../_components/AdminShell';
import AudiencesPanel from './AudiencesPanel';

export default function AudiencesPage() {
  return (
    <AdminShell title="Audiences" subtitle="View Meta audiences, status, size, and where they are used when available from the connected account.">
      <AudiencesPanel />
    </AdminShell>
  );
}
