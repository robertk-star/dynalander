'use client';

import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

const credentialRows = [
  ['App ID', 'Future ENV: META_APP_ID'],
  ['App Secret', 'Future ENV: META_APP_SECRET'],
  ['Access Token', 'Future ENV: META_ACCESS_TOKEN'],
  ['Ad Account ID', 'Future ENV: META_AD_ACCOUNT_ID'],
  ['API Version', 'Future ENV: META_API_VERSION'],
  ['Business ID', 'Optional future ENV: META_BUSINESS_ID']
];

const readinessRows = [
  ['Meta API connection', 'Not connected yet'],
  ['Access mode', 'Read only planned'],
  ['Live data saving', 'Disabled'],
  ['Meta write actions', 'Disabled'],
  ['Snapshot preview', 'Required before save'],
  ['Campaign changes', 'Disabled'],
  ['Ad set changes', 'Disabled'],
  ['Creative changes', 'Disabled'],
  ['Budget changes', 'Disabled']
];

export default function MetaConnectionStatus() {
  return (
    <>
      <section style={{ ...cardStyle, border: '2px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta connection safety notice</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          Facebook / Meta Ads is mock-only right now. DynLander will not change campaigns, ad sets, ads, budgets, audiences, placements, or creatives.
        </p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Meta connection</div><strong style={{ fontSize: 28 }}>Not connected</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Meta API credentials are not needed yet.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Access mode</div><strong style={{ fontSize: 28 }}>Read only</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Future live access should start read-only.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Live save</div><strong style={{ fontSize: 28 }}>Disabled</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Preview required before save.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Write actions</div><strong style={{ fontSize: 28 }}>Disabled</strong><p style={{ color: '#64748b', marginBottom: 0 }}>No Meta mutation routes exist.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Future Meta credential checklist</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Credential piece</th><th style={thTdStyle}>Status</th></tr></thead>
          <tbody>{credentialRows.map(([name, note]) => <tr key={name}><td style={thTdStyle}>{name}</td><td style={thTdStyle}>{note}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta safety checklist</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Item</th><th style={thTdStyle}>Status</th></tr></thead>
          <tbody>{readinessRows.map(([name, status]) => <tr key={name}><td style={thTdStyle}>{name}</td><td style={thTdStyle}>{status}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
