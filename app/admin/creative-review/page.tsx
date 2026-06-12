import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { metaCreatives } from '../_data/metaMockData';

export default function CreativeReviewPage() {
  const watchCount = metaCreatives.filter((creative) => creative.fatigue !== 'Good').length;
  const bestCreative = metaCreatives.find((creative) => creative.fatigue === 'Good');

  return (
    <AdminShell title="Creative Review" subtitle="Mock Meta creative and copy review. Live Meta creative data is not connected yet.">
      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Creatives reviewed</div><strong style={{ fontSize: 28 }}>{metaCreatives.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Mock creative rows.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Creative fatigue</div><strong style={{ fontSize: 28 }}>{watchCount} watch</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Creatives that need review or refresh.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Best mock creative</div><strong style={{ fontSize: 28 }}>{bestCreative?.ad || '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Best current mock CPL and CTR balance.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Write actions</div><strong style={{ fontSize: 28 }}>Disabled</strong><p style={{ color: '#64748b', marginBottom: 0 }}>No Meta ad changes allowed.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Creative copy review</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Type</th><th style={thTdStyle}>Primary text</th><th style={thTdStyle}>Headline</th><th style={thTdStyle}>Description</th><th style={thTdStyle}>CTA</th><th style={thTdStyle}>URL</th><th style={thTdStyle}>Frequency</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>Fatigue</th></tr></thead>
          <tbody>{metaCreatives.map((row) => <tr key={row.ad}><td style={thTdStyle}>{row.ad}</td><td style={thTdStyle}>{row.creativeType}</td><td style={thTdStyle}>{row.primaryText}</td><td style={thTdStyle}>{row.headline}</td><td style={thTdStyle}>{row.description}</td><td style={thTdStyle}>{row.cta}</td><td style={thTdStyle}>{row.destinationUrl}</td><td style={thTdStyle}>{row.frequency}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}>{row.fatigue}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>AI creative recommendations</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Recommendation</th></tr></thead>
          <tbody>{metaCreatives.map((row) => <tr key={row.ad}><td style={thTdStyle}>{row.ad}</td><td style={thTdStyle}>{row.recommendation}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta creative review placeholder</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>This page is mock-only. Later it will review live Meta primary text, headlines, CTAs, destination URLs, creative fatigue, and performance.</p>
      </section>
    </AdminShell>
  );
}
