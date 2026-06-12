import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { metaAdSets, metaCampaigns, metaRecommendations, metaSummary } from '../_data/metaMockData';

export default function MetaAdsPage() {
  return (
    <AdminShell title="Meta Ads Intelligence" subtitle="Mock Facebook / Meta Ads analyzer foundation. Live Meta API connection is not enabled yet.">
      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 28 }}>Mock only</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Meta live data is not connected.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 28 }}>{metaSummary.spend}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Mock Meta spend.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Reach</div><strong style={{ fontSize: 28 }}>{metaSummary.reach}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Mock audience reach.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Impressions</div><strong style={{ fontSize: 28 }}>{metaSummary.impressions}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Mock impression count.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Frequency</div><strong style={{ fontSize: 28 }}>{metaSummary.frequency}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Watch for creative fatigue above 2.0.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Leads / CPL</div><strong style={{ fontSize: 28 }}>{metaSummary.leads} / {metaSummary.costPerLead}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Mock lead performance.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 28 }}>{metaSummary.ctr}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Mock click-through rate.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CPC / CPM</div><strong style={{ fontSize: 28 }}>{metaSummary.cpc} / {metaSummary.cpm}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Mock traffic cost.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta campaign review</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Objective</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Reach</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Frequency</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>AI note</th></tr></thead>
          <tbody>{metaCampaigns.map((row) => <tr key={row.campaign}><td style={thTdStyle}>{row.campaign}</td><td style={thTdStyle}>{row.objective}</td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.reach}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.frequency}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}>{row.aiNote}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Ad set review</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Audience</th><th style={thTdStyle}>Placements</th><th style={thTdStyle}>Budget</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>AI note</th></tr></thead>
          <tbody>{metaAdSets.map((row) => <tr key={row.adSet}><td style={thTdStyle}>{row.adSet}</td><td style={thTdStyle}>{row.campaign}</td><td style={thTdStyle}>{row.audience}</td><td style={thTdStyle}>{row.placements}</td><td style={thTdStyle}>{row.budget}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}>{row.aiNote}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Mock AI recommendations</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Priority</th><th style={thTdStyle}>Area</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Reason</th></tr></thead>
          <tbody>{metaRecommendations.map((row) => <tr key={row.recommendation}><td style={thTdStyle}>{row.priority}</td><td style={thTdStyle}>{row.area}</td><td style={thTdStyle}>{row.recommendation}</td><td style={thTdStyle}>{row.reason}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Not connected yet</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>This page is mock-only. It does not connect to Meta, save live Meta data, or change Facebook ads.</p>
      </section>
    </AdminShell>
  );
}
