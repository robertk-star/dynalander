import AdminShell from '../_components/AdminShell';
import { cardStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import DataHealthStatus from './DataHealthStatus';

const schemaItems = [
  ['clients', 'Stores agency/client accounts.'],
  ['google_ads_accounts', 'Maps clients to demo account IDs and future Google Ads customer IDs.'],
  ['ai_directions', 'Stores platform-aware budget, CPL, approval, and recommendation guardrails.'],
  ['ad_snapshots', 'Stores Google ad setup snapshots.'],
  ['ad_change_log', 'Stores detected Google headline, description, and URL changes.'],
  ['ad_performance_snapshots', 'Stores Google daily ad performance for before/after analysis.'],
  ['meta_ad_snapshots', 'Stores Meta mock creative, copy, URL, audience, placement, and fatigue snapshots.'],
  ['meta_change_log', 'Stores detected Meta primary text, headline, CTA, URL, frequency, and fatigue changes.'],
  ['meta_performance_snapshots', 'Stores future Meta spend, reach, impressions, frequency, clicks, leads, CTR, CPC, CPM, and CPL.'],
  ['ai_recommendations', 'Stores AI recommendations and status.'],
  ['recommendation_results', 'Stores keep/test/rollback outcome analysis.'],
  ['lead_events', 'Stores form/chat/call lead attribution records.']
];

const syncChecklist = [
  ['Google setup sync', 'Pull current campaigns, ads, headlines, descriptions, sitelinks, callouts, snippets, and final URLs.'],
  ['Google change detector', 'Compare newest Google ad snapshot to previous snapshot and log differences.'],
  ['Meta setup sync', 'Future read-only pull for campaigns, ad sets, ads, creatives, copy, URLs, audiences, placements, and frequency.'],
  ['Meta change detector', 'Compare newest Meta snapshot to previous snapshot and log creative/copy/fatigue differences.'],
  ['Performance sync', 'Pull performance by platform after live read-only connections are enabled.'],
  ['Before/after evaluator', 'Compare old vs new performance after enough time or clicks.']
];

export default function DataHealthPage() {
  return (
    <AdminShell
      title="Data Health"
      subtitle="Platform-aware readiness page for Supabase, Google Ads, Meta Ads, snapshot tables, AI directions, and future sync checks."
    >
      <DataHealthStatus />

      <section style={twoColumnStyle}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Production schema readiness</h2>
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Table</th><th style={thTdStyle}>Purpose</th></tr></thead>
            <tbody>{schemaItems.map(([table, purpose]) => <tr key={table}><td style={thTdStyle}><strong>{table}</strong></td><td style={thTdStyle}>{purpose}</td></tr>)}</tbody>
          </table>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Sync checklist</h2>
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Job</th><th style={thTdStyle}>What it will do</th></tr></thead>
            <tbody>{syncChecklist.map(([job, purpose]) => <tr key={job}><td style={thTdStyle}><strong>{job}</strong></td><td style={thTdStyle}>{purpose}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
        <h2 style={{ marginTop: 0 }}>What Phase 16 verifies</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          Phase 16 shows database status, client records, Google readiness, Meta readiness, platform-specific snapshot readiness, and platform-aware AI direction readiness.
        </p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
          Meta remains mock-only. The page is designed to show whether the foundations are ready before any live Meta connection is added.
        </p>
      </section>
    </AdminShell>
  );
}
