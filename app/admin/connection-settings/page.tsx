import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle } from '../_components/adminStyles';

const settingsLinks = [
  {
    title: 'Google Ads Connection',
    href: '/admin/google-ads-connection',
    description: 'Review Google Ads credential readiness and confirm read-only safety status.'
  },
  {
    title: 'Live Readiness',
    href: '/admin/live-readiness',
    description: 'Check whether the app is ready before pulling a real Google Ads account.'
  },
  {
    title: 'Live Query Preview',
    href: '/admin/live-query-preview',
    description: 'Test the read-only Google Ads query path without saving any live data.'
  },
  {
    title: 'Snapshot Preview',
    href: '/admin/snapshot-preview',
    description: 'Preview, save mock snapshots, and detect snapshot changes.'
  },
  {
    title: 'Change History',
    href: '/admin/change-history',
    description: 'Review detected headline, description, and final URL changes from saved snapshots.'
  },
  {
    title: 'Data Health',
    href: '/admin/data-health',
    description: 'Check Supabase ENV, database tables, seed records, and connected data status.'
  },
  {
    title: 'AI Directions',
    href: '/admin/ai-directions',
    description: 'Set account-specific AI guardrails such as budget, CPL, approval rules, and compliance notes.'
  }
];

export default function ConnectionSettingsPage() {
  return (
    <AdminShell
      title="Connection Settings"
      subtitle="Setup, safety, database, and AI guardrail settings before live account syncing."
    >
      <div style={gridStyle}>
        {settingsLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{ ...cardStyle, display: 'block', color: 'inherit', textDecoration: 'none' }}
          >
            <h2 style={{ marginTop: 0 }}>{item.title}</h2>
            <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{item.description}</p>
          </a>
        ))}
      </div>
    </AdminShell>
  );
}
