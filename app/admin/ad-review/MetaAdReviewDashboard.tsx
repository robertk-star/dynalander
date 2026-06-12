'use client';

import { useMemo, useState } from 'react';
import { cardStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { metaCreatives } from '../_data/metaMockData';

export default function MetaAdReviewDashboard() {
  const { selectedAccount } = useActiveAccount();
  const [adName, setAdName] = useState(metaCreatives[0]?.ad || '');
  const [accepted, setAccepted] = useState<string[]>([]);
  const creative = useMemo(() => metaCreatives.find((item) => item.ad === adName) || metaCreatives[0], [adName]);
  const score = creative.fatigue === 'Good' ? '88' : creative.fatigue === 'Watch' ? '78' : '68';
  const rows = [
    ['Primary text', creative.primaryText, creative.recommendation],
    ['Headline', creative.headline, creative.fatigue === 'Good' ? 'Keep current headline' : 'Test a clearer benefit-driven headline'],
    ['CTA', creative.cta, creative.cta === 'Get Quote' ? 'Test Learn More' : 'Keep current CTA'],
    ['Destination URL', creative.destinationUrl, 'Confirm landing page matches the ad promise']
  ];

  function markAccepted(label: string) {
    setAccepted((current) => current.includes(label) ? current : [...current, label]);
  }

  return (
    <>
      <section style={cardStyle}>
        <div style={twoColumnStyle}>
          <label style={labelStyle}>Select Meta ad / creative<select style={inputStyle} value={adName} onChange={(event) => setAdName(event.target.value)}>{metaCreatives.map((item) => <option key={item.ad} value={item.ad}>{item.ad}</option>)}</select></label>
          <div><div style={{ color: '#64748b', fontWeight: 800, fontSize: 13 }}>Meta creative score</div><strong style={{ fontSize: 36 }}>{score} / 100</strong><p style={{ color: '#64748b', margin: 0 }}>Mock score based on copy clarity, CTA match, URL match, CTR, CPL, frequency, and fatigue.</p></div>
        </div>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #fed7aa', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta ad review workflow</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>This is mock-only. DynLander is reviewing Meta creative data, but it does not pull live Meta data or change Facebook / Meta ads.</p>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Current Meta setup</h2><p><strong>Campaign:</strong> {creative.campaign}</p><p><strong>Ad set:</strong> {creative.adSet}</p><p><strong>Creative type:</strong> {creative.creativeType}</p><p><strong>Destination:</strong> {creative.destinationUrl}</p><p><strong>Active account:</strong> {selectedAccount.name}</p></div>
        <div style={{ ...cardStyle, border: '1px solid #fed7aa', background: '#fff7ed' }}><h2 style={{ marginTop: 0 }}>Top fixes</h2><ol style={{ lineHeight: 1.7 }}><li><strong>Watch frequency</strong> before scaling creative spend.</li><li><strong>Keep the CTA soft</strong> for inherited and as-is seller intent.</li><li><strong>Match the landing page</strong> to the ad promise before copying into Meta.</li></ol></div>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Current creative copy</h2><table style={tableStyle}><tbody><tr><td style={thTdStyle}>Primary text</td><td style={thTdStyle}>{creative.primaryText}</td></tr><tr><td style={thTdStyle}>Headline</td><td style={thTdStyle}>{creative.headline}</td></tr><tr><td style={thTdStyle}>Description</td><td style={thTdStyle}>{creative.description}</td></tr><tr><td style={thTdStyle}>CTA</td><td style={thTdStyle}>{creative.cta}</td></tr><tr><td style={thTdStyle}>Destination URL</td><td style={thTdStyle}>{creative.destinationUrl}</td></tr></tbody></table></div>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Meta performance signals</h2><table style={tableStyle}><tbody><tr><td style={thTdStyle}>Fatigue</td><td style={thTdStyle}>{creative.fatigue}</td></tr><tr><td style={thTdStyle}>Frequency</td><td style={thTdStyle}>{creative.frequency}</td></tr><tr><td style={thTdStyle}>CTR</td><td style={thTdStyle}>{creative.ctr}</td></tr><tr><td style={thTdStyle}>CPL</td><td style={thTdStyle}>{creative.cpl}</td></tr></tbody></table></div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recommended Meta changes to track</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Item</th><th style={thTdStyle}>Current</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Track</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row[0]}><td style={thTdStyle}>{row[0]}</td><td style={thTdStyle}>{row[1]}</td><td style={thTdStyle}>{row[2]}</td><td style={thTdStyle}><button type="button" onClick={() => markAccepted(row[0])}>{accepted.includes(row[0]) ? 'Accepted' : 'Use change'}</button></td></tr>)}</tbody>
        </table>
        {accepted.length > 0 ? <p style={{ color: '#166534', fontWeight: 800 }}>Accepted in this demo: {accepted.join(', ')}. In production this creates a Meta change log record tied to the active account and ad ID.</p> : null}
      </section>
    </>
  );
}
