import AdminShell from '../_components/AdminShell';
import { cardStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { dynlanderDemoLeads } from '../_data/dynlanderAdminData';

export default function DynLanderLeadsPage() {
  return (
    <AdminShell
      title="Lead Dashboard"
      subtitle="Review seller leads by source, city, theme, status, and created date. This demo uses mock leads only."
    >
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Captured seller leads</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Name</th>
              <th style={thTdStyle}>Phone</th>
              <th style={thTdStyle}>City</th>
              <th style={thTdStyle}>Theme</th>
              <th style={thTdStyle}>Source</th>
              <th style={thTdStyle}>Status</th>
              <th style={thTdStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {dynlanderDemoLeads.map((lead) => (
              <tr key={lead.phone}>
                <td style={thTdStyle}>{lead.name}</td>
                <td style={thTdStyle}>{lead.phone}</td>
                <td style={thTdStyle}>{lead.city}</td>
                <td style={thTdStyle}>{lead.theme}</td>
                <td style={thTdStyle}>{lead.source}</td>
                <td style={thTdStyle}>{lead.status}</td>
                <td style={thTdStyle}>{lead.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
