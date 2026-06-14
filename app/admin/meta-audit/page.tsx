import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

const metaRouteRows = [
  { route: '/admin/meta-ads-connection', purpose: 'Connection readiness', liveRead: 'Yes', mock: 'No', save: 'Disabled', write: 'Disabled', note: 'Checks ENV and read-only Meta API access.' },
  { route: '/admin/meta-ads', purpose: 'Meta Ads Intelligence', liveRead: 'Yes in live mode', mock: 'Yes in demo/fallback', save: 'Disabled', write: 'Disabled', note: 'Reads account, campaigns, ad sets, ads, and insights.' },
  { route: '/admin/creative-review', purpose: 'Creative / ad review', liveRead: 'Yes in live mode', mock: 'Yes in demo/fallback', save: 'Disabled', write: 'Disabled', note: 'Reads ad copy, creative text, and ad-level insights.' },
  { route: '/admin/recommendations', purpose: 'Recommendations', liveRead: 'Yes in live mode', mock: 'Yes in demo/fallback', save: 'Recommendation status only', write: 'Disabled', note: 'Recommendations can save internal status/notes, not Meta changes.' },
  { route: '/admin/snapshot-preview', purpose: 'Snapshot preview', liveRead: 'Mock / planned', mock: 'Yes', save: 'Mock snapshot only', write: 'Disabled', note: 'Meta live snapshot save is not enabled.' },
  { route: '/admin/change-history', purpose: 'Change history', liveRead: 'Mock / internal', mock: 'Yes', save: 'Disabled', write: 'Disabled', note: 'Shows internal/mock change detection, not Meta mutations.' },
  { route: '/admin/ad-review', purpose: 'Ad review', liveRead: 'Platform-aware', mock: 'Yes', save: 'Disabled', write: 'Disabled', note: 'No Meta write actions exist.' },
  { route: '/api/meta-ads/status', purpose: 'Readiness API', liveRead: 'Yes', mock: 'Fallback only', save: 'Disabled', write: 'Disabled', note: 'Read-only connection checks.' },
  { route: '/api/meta-ads/read-only-preview', purpose: 'Live preview API', liveRead: 'Yes', mock: 'Fallback only', save: 'Disabled', write: 'Disabled', note: 'Read-only campaign/ad/insight preview.' },
  { route: '/api/meta-ads/ad-review-data', purpose: 'Ad review API', liveRead: 'Yes', mock: 'Fallback only', save: 'Disabled', write: 'Disabled', note: 'Read-only ad copy and ad-level performance preview.' },
  { route: '/api/meta-ads/snapshot-save', purpose: 'Meta mock snapshot save', liveRead: 'No', mock: 'Yes', save: 'Mock/internal only', write: 'Disabled', note: 'Does not write to Meta.' },
  { route: '/api/meta-ads/change-detect', purpose: 'Meta mock change detection', liveRead: 'No', mock: 'Yes', save: 'Internal only', write: 'Disabled', note: 'Does not write to Meta.' }
];

const summaryRows = [
  { label: 'Live Meta reads', value: 'Enabled for selected pages' },
  { label: 'Live Meta saves', value: 'Disabled' },
  { label: 'Meta write actions', value: 'Disabled' },
  { label: 'Budget changes', value: 'Disabled' },
  { label: 'Campaign/ad/ad set edits', value: 'Disabled' },
  { label: 'Internal recommendation notes', value: 'Enabled' }
];

export default function MetaAuditPage() {
  return (
    <AdminShell title="Meta Safety Audit" subtitle="Audit every Meta route and confirm what is live read-only, mock-only, save-disabled, or write-disabled.">
      <section style={{ ...cardStyle, border: '2px solid #0f766e', background: '#f0fdfa' }}>
        <h2 style={{ marginTop: 0 }}>Meta safety lock</h2>
        <p style={{ color: '#0f766e', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
          DynLander can read selected Meta data in live mode, but it still cannot create, edit, publish, pause, delete, or change anything inside Meta.
        </p>
      </section>

      <div style={gridStyle}>
        {summaryRows.map((row) => <div key={row.label} style={cardStyle}><div style={{ color: '#64748b' }}>{row.label}</div><strong style={{ fontSize: 26 }}>{row.value}</strong></div>)}
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta route audit</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Route</th><th style={thTdStyle}>Purpose</th><th style={thTdStyle}>Live read</th><th style={thTdStyle}>Mock/demo</th><th style={thTdStyle}>Save</th><th style={thTdStyle}>Meta write</th><th style={thTdStyle}>Note</th></tr></thead>
          <tbody>{metaRouteRows.map((row) => <tr key={row.route}><td style={thTdStyle}>{row.route}</td><td style={thTdStyle}>{row.purpose}</td><td style={thTdStyle}>{row.liveRead}</td><td style={thTdStyle}>{row.mock}</td><td style={thTdStyle}>{row.save}</td><td style={thTdStyle}>{row.write}</td><td style={thTdStyle}>{row.note}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Before enabling any future Meta write action</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
          Add a separate approval flow, role permissions, preview screen, audit log, and emergency off switch before any Meta write route is created.
        </p>
      </section>
    </AdminShell>
  );
}
