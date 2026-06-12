import AdminShell from '../_components/AdminShell';
import { cardStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import DataHealthStatus from './DataHealthStatus';

const schemaItems = [
  ['clients', 'Stores agency/client accounts.'],
  ['google_ads_accounts', 'Maps clients to Google Ads customer IDs.'],
  ['ai_directions', 'Stores budget, CPL, approval, and recommendation guardrails.'],
  ['ad_snapshots', 'Stores each pulled ad setup snapshot.'],
  ['ad_change_log', 'Stores detected headline, description, sitelink, callout, and URL changes.'],
  ['ad_performance_snapshots', 'Stores daily ad performance for before/after analysis.'],
  ['ai_recommendations', 'Stores AI recommendations and status.'],
  ['recommendation_results', 'Stores keep/test/rollback outcome analysis.'],
  ['lead_events', 'Stores form/chat/call lead attribution records.']
];

const syncChecklist = [
  ['Hourly setup sync', 'Pull current campaigns, ads, headlines, descriptions, sitelinks, callouts, snippets, and final URLs.'],
  ['Change detector', 'Compare newest ad snapshot to previous snapshot and log differences.'],
  ['Daily performance sync', 'Pull clicks, cost, conversions, leads, and qualified leads by ad.'],
  ['Recommendation matcher', 'Match detected Google Ads changes to prior AI recommendations.'],
  ['Before/after evaluator', 'Compare old vs new performance after enough time or clicks.'],
  ['Rollback recommender', 'Recommend previous best assets when the newer version underperforms.']
];

export default function DataHealthPage() {
  return (
    <AdminShell
      title="Data Health"
      subtitle="Phase 5 database-readiness page. This checks Supabase environment status and reads client records when the database is connected."
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
        <h2 style={{ marginTop: 0 }}>What Phase 5 verifies</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          Phase 5 confirms whether the app can see database environment variables and read client records from the database. If no database is connected, the app falls back to mock client records so the demo still works.
        </p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
          The next production build can add table-level checks, seed records, and server-side saves for AI directions.
        </p>
      </section>
    </AdminShell>
  );
}
