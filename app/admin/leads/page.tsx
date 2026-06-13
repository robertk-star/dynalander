'use client';

import AdminShell from '../_components/AdminShell';
import { cardStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import { getAccountLeads } from '../_data/accountScopedData';
import MetaLeadsDashboard from './MetaLeadsDashboard';

export default function DynLanderLeadsPage() {
  const { platform } = useActivePlatform();
  const { accountId, selectedAccount } = useActiveAccount();
  const rows = getAccountLeads(accountId);

  return (
    <AdminShell title="Lead Dashboard" subtitle="Review lead records for the selected platform and active account.">
      {platform === 'meta_ads' ? <MetaLeadsDashboard /> : (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Google / landing page seller inquiries</h2>
          <p style={{ color: '#64748b' }}>Showing account-scoped mock records for {selectedAccount.name}.</p>
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Name</th><th style={thTdStyle}>Contact</th><th style={thTdStyle}>City</th><th style={thTdStyle}>Theme</th><th style={thTdStyle}>Source</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Created</th></tr></thead>
            <tbody>{rows.map((row) => <tr key={row.phone}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.phone}</td><td style={thTdStyle}>{row.city}</td><td style={thTdStyle}>{row.theme}</td><td style={thTdStyle}>{row.source}</td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>{row.created}</td></tr>)}</tbody>
          </table>
        </section>
      )}
    </AdminShell>
  );
}
