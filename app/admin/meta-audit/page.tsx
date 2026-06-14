import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

const metaRouteRows = [
  { route: '/admin/meta-ads-connection', status: 'Live', purpose: 'Connection readiness', liveRead: 'Yes', mock: 'No', save: 'Disabled', write: 'Disabled', note: 'Checks ENV and read-only Meta API access.' },
  { route: '/admin/meta-ads', status: 'Live', purpose: 'Meta Ads Intelligence', liveRead: 'Yes in live mode', mock: 'Yes in demo/fallback', save: 'Disabled', write: 'Disabled', note: 'Reads account, campaigns, ad sets, ads, and insights.' },
  { route: '/admin/creative-review', status: 'Live', purpose: 'Creative / ad review', liveRead: 'Yes in live mode', mock: 'Yes in demo/fallback', save: 'Disabled', write: 'Disabled', note: 'Reads ad copy, creative text, and ad-level insights.' },
  { route: '/admin/ad-review', status: 'Live', purpose: 'Ad review', liveRead: 'Yes in live mode', mock: 'Yes in demo/fallback', save: 'Disabled', write: 'Disabled', note: 'Uses the read-only Meta ad review API.' },
  { route: '/admin/recommendations', status: 'Live + internal workflow', purpose: 'Recommendations', liveRead: 'Yes in live mode', mock: 'Yes in demo/fallback', save: 'Internal status/notes only', write: 'Disabled', note: 'Recommendation action tracking is internal only.' },
  { route: '/admin/snapshot-preview', status: 'Live preview + internal snapshot', purpose: 'Snapshot preview', liveRead: 'Yes in live mode', mock: 'Yes in demo/fallback', save: 'Internal snapshot only', write: 'Disabled', note: 'Live Meta data is previewed only; saved rows are internal.' },
  { route: '/admin/change-history', status: 'Partial', purpose: 'Change history', liveRead: 'Live preview status only', mock: 'Internal changes', save: 'Disabled', write: 'Disabled', note: 'Detected changes still come from internal snapshot/change tables.' },
  { route: '/admin/leads', status: 'Partial', purpose: 'Lead dashboard', liveRead: 'Campaign/ad status only', mock: 'Lead rows are internal/mock', save: 'Disabled', write: 'Disabled', note: 'Live Meta lead form submissions are not connected yet.' },
  { route: '/api/meta-ads/status', status: 'Live', purpose: 'Readiness API', liveRead: 'Yes', mock: 'Fallback only', save: 'Disabled', write: 'Disabled', note: 'Read-only connection checks.' },
  { route: '/api/meta-ads/read-only-preview', status: 'Live', purpose: 'Live preview API', liveRead: 'Yes', mock: 'Fallback only', save: 'Disabled', write: 'Disabled', note: 'Read-only campaign/ad/insight preview.' },
  { route: '/api/meta-ads/ad-review-data', status: 'Live', purpose: 'Ad review API', liveRead: 'Yes', mock: 'Fallback only', save: 'Disabled', write: 'Disabled', note: 'Read-only ad copy and ad-level performance preview.' },
  { route: '/api/meta-ads/snapshot-save', status: 'Internal only', purpose: 'Internal snapshot save', liveRead: 'No', mock: 'Yes', save: 'Internal only', write: 'Disabled', note: 'Does not write to Meta.' },
  { route: '/api/meta-ads/change-detect', status: 'Internal only', purpose: 'Internal change detection', liveRead: 'No', mock: 'Yes', save: 'Internal only', write: 'Disabled', note: 'Does not write to Meta.' }
];

const summaryRows = [
  { label: 'Live Meta performance reads', value: 'Connected' },
  { label: 'Live Meta ad review', value: 'Connected' },
  { label: 'Live Meta lead forms', value: 'Not connected' },
  { label: 'Internal workflow saves', value: 'Enabled' },
  { label: 'Meta write actions', value: 'Disabled' },
  { label: 'Remaining partial pages', value: 'Leads + detected changes' }
];

export default function MetaAuditPage() {
  return (
    <AdminShell title="Meta Live Data Audit" subtitle="Verify which Meta pages are live, partial, mock/internal, save-disabled, or write-disabled.">
      <section style={{ ...cardStyle, border: '2px solid #0f766e', background: '#f0fdfa' }}>
        <h2 style={{ marginTop: 0 }}>Meta live data coverage</h2>
        <p style={{ color: '#0f766e', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
          DynLander is reading live Meta campaign, ad set, ad, creative, and insight data. Lead form submissions and detected change history are still internal/partial.
        </p>
      </section>

      <div style={gridStyle}>
        {summaryRows.map((row) => <div key={row.label} style={cardStyle}><div style={{ color: '#64748b' }}>{row.label}</div><strong style={{ fontSize: 26 }}>{row.value}</strong></div>)}
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta route audit</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Route</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Purpose</th><th style={thTdStyle}>Live read</th><th style={thTdStyle}>Mock/demo</th><th style={thTdStyle}>Save</th><th style={thTdStyle}>Meta write</th><th style={thTdStyle}>Note</th></tr></thead>
          <tbody>{metaRouteRows.map((row) => <tr key={row.route}><td style={thTdStyle}>{row.route}</td><td style={thTdStyle}><strong>{row.status}</strong></td><td style={thTdStyle}>{row.purpose}</td><td style={thTdStyle}>{row.liveRead}</td><td style={thTdStyle}>{row.mock}</td><td style={thTdStyle}>{row.save}</td><td style={thTdStyle}>{row.write}</td><td style={thTdStyle}>{row.note}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Remaining live-data gaps</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          The remaining live-data gaps are Meta lead form submissions and saved live change history. Those require separate build decisions and possibly additional Meta permissions.
        </p>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
          Meta write actions remain disabled across the app.
        </p>
      </section>
    </AdminShell>
  );
}
