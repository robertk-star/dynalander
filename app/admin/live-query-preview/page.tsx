import AdminShell from '../_components/AdminShell';
import LiveQueryPreviewPanel from './LiveQueryPreviewPanel';

export default function LiveQueryPreviewPage() {
  return (
    <AdminShell
      title="Live Query Preview"
      subtitle="Test the read-only Google Ads query path before saving any live setup snapshot."
    >
      <LiveQueryPreviewPanel />
    </AdminShell>
  );
}
