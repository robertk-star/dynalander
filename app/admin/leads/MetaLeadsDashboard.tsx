'use client';

import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { getMetaLeadSummary, metaLeadRows } from '../_data/metaLeadMockData';

export default function MetaLeadsDashboard() {
  const { selectedAccount } = useActiveAccount();
  const summary = getMetaLeadSummary();

  return (
    <>
      <section style={{ ...cardStyle, border: '1px solid #fed7aa', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta lead attribution</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
          Showing mock Meta lead records for {selectedAccount.name}. Meta is still mock-only and no live Meta lead data is pulled.
        </p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mock Meta leads</div><strong style={{ fontSize: 32 }}>{summary.total}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Total mock Meta lead rows.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>High quality</div><strong style={{ fontSize: 32 }}>{summary.highQuality}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Marked high quality in mock data.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Lead forms</div><strong style={{ fontSize: 32 }}>{summary.leadForms}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>From mock Meta lead forms.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>New</div><strong style={{ fontSize: 32 }}>{summary.newRows}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Need first follow-up.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta seller inquiries</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Name</th>
              <th style={thTdStyle}>Contact</th>
              <th style={thTdStyle}>City</th>
              <th style={thTdStyle}>Campaign</th>
              <th style={thTdStyle}>Ad set</th>
              <th style={thTdStyle}>Ad</th>
              <th style={thTdStyle}>Source</th>
              <th style={thTdStyle}>Quality</th>
              <th style={thTdStyle}>Status</th>
              <th style={thTdStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {metaLeadRows.map((row) => (
              <tr key={row.phone}>
                <td style={thTdStyle}>{row.name}</td>
                <td style={thTdStyle}>{row.phone}</td>
                <td style={thTdStyle}>{row.city}</td>
                <td style={thTdStyle}>{row.campaign}</td>
                <td style={thTdStyle}>{row.adSet}</td>
                <td style={thTdStyle}>{row.ad}</td>
                <td style={thTdStyle}>{row.source}</td>
                <td style={thTdStyle}>{row.quality}</td>
                <td style={thTdStyle}>{row.status}</td>
                <td style={thTdStyle}>{row.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
