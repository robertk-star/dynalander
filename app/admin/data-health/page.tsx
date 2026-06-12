import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';

const healthCards = [
  { label: 'Database connection', value: 'Not connected', note: 'Supabase ENV not added yet.' },
  { label: 'Google Ads API', value: 'Not connected', note: 'Credentials intentionally not added yet.' },
  { label: 'AI analysis key', value: 'Not connected', note: 'AI provider key not added yet.' },
  { label: 'Sync mode', value: 'Mock only', note: 'Demo is using local mock data.' }
];

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
      subtitle="Phase 4 sync-readiness page. This shows the production data foundation before live Supabase, Google Ads, and AI credentials are connected."
    >
      <div style={gridStyle}>
        {healthCards.map((card) => (
          <div key={card.label} style={cardStyle}>
            <div style={{ color: '#64748b' }}>{card.label}</div>
            <strong style={{ fontSize: 28 }}>{card.value}</strong>
            <p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p>
          </div>
        ))}
      </div>

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
        <h2 style={{ marginTop: 0 }}>What Phase 4 prepares</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          The important product feature is historical memory. Once Google Ads is connected, DynLander needs to remember what an ad looked like before, what changed, when it changed, how it performed before, and how it performed after. This page confirms the system is ready for that future data flow.
        </p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
          No credentials are required for this phase. When you are ready, the next production build should connect Supabase first, then Google Ads server-side API routes.
        </p>
      </section>
    </AdminShell>
  );
}
