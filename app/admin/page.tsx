'use client';

import AdminShell from './_components/AdminShell';
import { blueButtonStyle } from './_components/adminStyles';
import AdminHomeDashboard from './AdminHomeDashboard';

export default function DynLanderAdminPage() {
  return (
    <AdminShell
      title="DynLander Admin"
      subtitle="Platform-aware dashboard for Google Ads, Facebook / Meta Ads, snapshots, changes, health, and recommended next actions."
      action={<a href="/admin/snapshot-preview" style={blueButtonStyle}>Open Snapshot Preview</a>}
    >
      <AdminHomeDashboard />
    </AdminShell>
  );
}
