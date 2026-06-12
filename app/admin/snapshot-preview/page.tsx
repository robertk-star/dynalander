import AdminShell from '../_components/AdminShell';
import SnapshotPreviewPanel from './SnapshotPreviewPanel';

export default function SnapshotPreviewPage() {
  return (
    <AdminShell
      title="Snapshot Preview"
      subtitle="Preview what would be pulled from Google Ads before any setup snapshot is saved."
    >
      <SnapshotPreviewPanel />
    </AdminShell>
  );
}
