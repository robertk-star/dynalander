'use client';

import AdminShell from '../_components/AdminShell';
import { cardStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { getAccountLeads } from '../_data/accountScopedData';

export default function DynLanderLeadsPage() {
  const { accountId, selectedAccount } = useActiveAccount();
  const rows = getAccountLeads(accountId);

  return (
    <AdminShell
      title="Lead Dashboard"
      subtitle="Review seller inquiry records by source, city, theme, status, and created date. This demo now filters mock records by the active account."
    >
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Seller inquiries</h2>
        <p style={{ color: '#64748b' }}>Showing account-scoped mock records for {selectedAccount.name}.</p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Name</th>
              <th style={thTdStyle}>Contact</th>
              <th style={thTdStyle}>City</th>
              <th style={thTdStyle}>Theme</th>
              <th style={thTdStyle}>Source</th>
              <th style={thTdStyle}>Status</th>
              <th style={thTdStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.phone}>
                <td style={thTdStyle}>{row.name}</td>
                <td style={thTdStyle}>{row.phone}</td>
                <td style={thTdStyle}>{row.city}</td>
                <td style={thTdStyle}>{row.theme}</td>
                <td style={thTdStyle}>{row.source}</td>
                <td style={thTdStyle}>{row.status}</td>
                <td style={thTdStyle}>{row.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
