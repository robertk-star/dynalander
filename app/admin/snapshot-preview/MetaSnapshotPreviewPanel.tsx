'use client';

import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { metaAdSets, metaCampaigns, metaCreatives, metaSummary } from '../_data/metaMockData';

const metaSnapshotWrites = [
  { table: 'future_meta_ad_snapshots', action: 'save campaign, ad set, ad, creative, copy, URL, targeting, and placement snapshot rows' },
  { table: 'future_meta_change_log', action: 'compare newest Meta snapshot to the previous saved Meta snapshot' },
  { table: 'future_meta_performance_snapshots', action: 'save daily Meta spend, impressions, reach, frequency, clicks, leads, CTR, CPC, CPM, and CPL' }
];

export default function MetaSnapshotPreviewPanel() {
  const cards = [
    { label: 'Preview mode', value: 'Meta mock only', note: 'No live Meta data is pulled.' },
    { label: 'Campaigns', value: String(metaCampaigns.length), note: 'Campaigns that would be reviewed.' },
    { label: 'Ad sets', value: String(metaAdSets.length), note: 'Ad sets that would include targeting and placement summary.' },
    { label: 'Ads / creatives', value: String(metaCreatives.length), note: 'Creative copy and destination data to snapshot.' },
    { label: 'Frequency', value: metaSummary.frequency, note: 'Used later for fatigue detection.' },
    { label: 'Save status', value: 'Disabled', note: 'Meta snapshot save is not enabled yet.' }
  ];

  return (
    <>
      <section style={{ ...cardStyle, border: '2px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta snapshot preview</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          This is a Meta mock snapshot preview. It shows what DynLander would eventually pull from Facebook / Meta Ads before saving any live Meta data.
        </p>
      </section>

      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 26 }}>{card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta campaigns that would be pulled</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Objective</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Reach</th><th style={thTdStyle}>Frequency</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>CPL</th></tr></thead>
          <tbody>{metaCampaigns.map((row) => <tr key={row.campaign}><td style={thTdStyle}>{row.campaign}</td><td style={thTdStyle}>{row.objective}</td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.reach}</td><td style={thTdStyle}>{row.frequency}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta ad sets that would be snapshotted</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Audience</th><th style={thTdStyle}>Placements</th><th style={thTdStyle}>Budget</th><th style={thTdStyle}>CPL</th></tr></thead>
          <tbody>{metaAdSets.map((row) => <tr key={row.adSet}><td style={thTdStyle}>{row.adSet}</td><td style={thTdStyle}>{row.campaign}</td><td style={thTdStyle}>{row.audience}</td><td style={thTdStyle}>{row.placements}</td><td style={thTdStyle}>{row.budget}</td><td style={thTdStyle}>{row.cpl}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta creatives that would be snapshotted</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Type</th><th style={thTdStyle}>Primary text</th><th style={thTdStyle}>Headline</th><th style={thTdStyle}>CTA</th><th style={thTdStyle}>URL</th><th style={thTdStyle}>Frequency</th><th style={thTdStyle}>Fatigue</th></tr></thead>
          <tbody>{metaCreatives.map((row) => <tr key={row.ad}><td style={thTdStyle}>{row.ad}</td><td style={thTdStyle}>{row.creativeType}</td><td style={thTdStyle}>{row.primaryText}</td><td style={thTdStyle}>{row.headline}</td><td style={thTdStyle}>{row.cta}</td><td style={thTdStyle}>{row.destinationUrl}</td><td style={thTdStyle}>{row.frequency}</td><td style={thTdStyle}>{row.fatigue}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Future database writes</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Future table</th><th style={thTdStyle}>Future action</th></tr></thead>
          <tbody>{metaSnapshotWrites.map((row) => <tr key={row.table}><td style={thTdStyle}>{row.table}</td><td style={thTdStyle}>{row.action}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
