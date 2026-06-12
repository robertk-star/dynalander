import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

const mockCreatives = [
  { ad: 'As-Is Seller Image Ad', primaryText: 'Sell your house as-is without repairs or showings.', headline: 'Get an As-Is Offer', cta: 'Learn More', status: 'Watch frequency' },
  { ad: 'Inherited House Lead Ad', primaryText: 'Have an inherited property and need options?', headline: 'Inherited Property Help', cta: 'Get Quote', status: 'Needs softer copy' },
  { ad: 'Fast Sale Video Ad', primaryText: 'Need to sell quickly? Review your options.', headline: 'Sell On Your Timeline', cta: 'Contact Us', status: 'Good mock fit' }
];

export default function CreativeReviewPage() {
  return (
    <AdminShell title="Creative Review" subtitle="Mock Meta creative and copy review. Live Meta creative data is not connected yet.">
      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Creatives reviewed</div><strong style={{ fontSize: 28 }}>3</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Mock creative rows.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Creative fatigue</div><strong style={{ fontSize: 28 }}>Watch</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Frequency checks will come later.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Write actions</div><strong style={{ fontSize: 28 }}>Disabled</strong><p style={{ color: '#64748b', marginBottom: 0 }}>No Meta ad changes allowed.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Creative copy review</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Primary text</th><th style={thTdStyle}>Headline</th><th style={thTdStyle}>CTA</th><th style={thTdStyle}>AI note</th></tr></thead>
          <tbody>{mockCreatives.map((row) => <tr key={row.ad}><td style={thTdStyle}>{row.ad}</td><td style={thTdStyle}>{row.primaryText}</td><td style={thTdStyle}>{row.headline}</td><td style={thTdStyle}>{row.cta}</td><td style={thTdStyle}>{row.status}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta creative review placeholder</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>This page is mock-only. Later it will review Meta primary text, headlines, CTAs, destination URLs, creative fatigue, and performance.</p>
      </section>
    </AdminShell>
  );
}
