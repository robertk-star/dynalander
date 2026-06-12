import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

const mockCampaigns = [
  { campaign: 'DFW Seller Leads - Meta', status: 'Mock', spend: '$1,240', leads: 38, cpl: '$33', note: 'Mock Meta campaign data.' },
  { campaign: 'As-Is Home Sellers', status: 'Mock', spend: '$860', leads: 21, cpl: '$41', note: 'Creative fatigue should be watched.' },
  { campaign: 'Inherited Property Leads', status: 'Mock', spend: '$640', leads: 14, cpl: '$46', note: 'Audience and copy review needed.' }
];

export default function MetaAdsPage() {
  return (
    <AdminShell title="Meta Ads Intelligence" subtitle="Mock Facebook / Meta Ads analyzer foundation. Live Meta API connection is not enabled yet.">
      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 28 }}>Mock only</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Meta live data is not connected.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mock spend</div><strong style={{ fontSize: 28 }}>$2,740</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Demo campaign spend.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mock leads</div><strong style={{ fontSize: 28 }}>73</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Demo Meta lead count.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta campaign review</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>Note</th></tr></thead>
          <tbody>{mockCampaigns.map((row) => <tr key={row.campaign}><td style={thTdStyle}>{row.campaign}</td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}>{row.note}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Not connected yet</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>This page is a placeholder for the future Meta Ads analyzer. It does not connect to Meta, save live Meta data, or change Facebook ads.</p>
      </section>
    </AdminShell>
  );
}
