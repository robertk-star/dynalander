import AdminShell, { cardStyle, gridStyle, tableStyle, thTdStyle } from '../../components/dynlander-admin/AdminShell';
import { dynlanderDemoLeads, dynlanderThemePerformance } from '../../lib/dynlanderAdminData';

export default function DynLanderAdminPage() {
  const totalClicks = dynlanderThemePerformance.reduce((sum, row) => sum + row.clicks, 0);
  const totalLeads = dynlanderThemePerformance.reduce((sum, row) => sum + row.leads, 0);
  const conversionRate = ((totalLeads / totalClicks) * 100).toFixed(1);

  return (
    <AdminShell
      title="DynLander Admin"
      subtitle="Manage dynamic landing pages, seller-intent themes, Google Ads URLs, and home-buyer lead reporting. This patch uses mock data and does not change the public landing page."
      action={<a href="/admin/url-builder" style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700 }}>Build Ad URL</a>}
    >
      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Total clicks</div><strong style={{ fontSize: 34 }}>{totalClicks}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Total leads</div><strong style={{ fontSize: 34 }}>{totalLeads}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Conversion rate</div><strong style={{ fontSize: 34 }}>{conversionRate}%</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Best theme</div><strong style={{ fontSize: 34 }}>Repairs</strong></div>
      </div>

      <section style={{ ...cardStyle, marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>Theme performance</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Theme</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>Conversion</th><th style={thTdStyle}>Demo CPL</th></tr></thead>
          <tbody>{dynlanderThemePerformance.map((row) => <tr key={row.theme}><td style={thTdStyle}>{row.theme}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.conversion}</td><td style={thTdStyle}>{row.cpl}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>AI-style recommendations</h2>
        <div style={gridStyle}>
          <div><strong>Scale repairs theme</strong><p style={{ color: '#64748b' }}>Repairs / as-is has the highest lead count and should get more budget or more ad variants.</p></div>
          <div><strong>Review foreclosure copy</strong><p style={{ color: '#64748b' }}>Foreclosure clicks are strong, but conversion is weaker. Test softer language and more trust-building content.</p></div>
          <div><strong>Create city variants</strong><p style={{ color: '#64748b' }}>Dallas and Plano are driving the most mock leads. Build local proof sections next.</p></div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recent leads</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Name</th><th style={thTdStyle}>Phone</th><th style={thTdStyle}>City</th><th style={thTdStyle}>Theme</th><th style={thTdStyle}>Status</th></tr></thead>
          <tbody>{dynlanderDemoLeads.slice(0, 4).map((lead) => <tr key={lead.phone}><td style={thTdStyle}>{lead.name}</td><td style={thTdStyle}>{lead.phone}</td><td style={thTdStyle}>{lead.city}</td><td style={thTdStyle}>{lead.theme}</td><td style={thTdStyle}>{lead.status}</td></tr>)}</tbody>
        </table>
      </section>
    </AdminShell>
  );
}
