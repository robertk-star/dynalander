'use client';

import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import { getAccountBudgetReview, getAccountPriorityItems } from '../_data/accountScopedData';
import { metaRecommendations } from '../_data/metaMockData';
import RecommendationResultTracking from './RecommendationResultTracking';

const googleActionRows = [
  { action: 'Keep', rule: 'Keep changes that improve qualified lead cost and maintain page match.' },
  { action: 'Watch', rule: 'Watch changes with early lead volume but not enough time or clicks.' },
  { action: 'Rollback', rule: 'Rollback changes that raise CPL, reduce lead quality, or weaken seller intent.' }
];

const metaActionRows = [
  { action: 'Keep', rule: 'Keep creatives that hold lead quality while frequency stays controlled.' },
  { action: 'Watch', rule: 'Watch creatives with rising frequency, lower CTR, or mixed lead quality.' },
  { action: 'Refresh', rule: 'Refresh creatives that show fatigue or softer CTA mismatch.' }
];

function GoogleRecommendations() {
  const { accountId, selectedAccount } = useActiveAccount();
  const priorities = getAccountPriorityItems(accountId);
  const budgetRows = getAccountBudgetReview(accountId);

  return (
    <>
      <section style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
        <h2 style={{ marginTop: 0 }}>Google recommendations</h2>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>Recommendations for {selectedAccount.name} focus on search intent, landing page match, budget control, and before/after performance review.</p>
      </section>
      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Open priorities</div><strong style={{ fontSize: 32 }}>{priorities.length}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Budget rules</div><strong style={{ fontSize: 32 }}>{budgetRows.length}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Review logic</div><strong style={{ fontSize: 32 }}>Keep / Watch / Rollback</strong></div>
      </div>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Priority recommendations</h2>
        <table style={tableStyle}><thead><tr><th style={thTdStyle}>Level</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Why it matters</th></tr></thead><tbody>{priorities.map((row) => <tr key={row.title}><td style={thTdStyle}>{row.level}</td><td style={thTdStyle}>{row.title}</td><td style={thTdStyle}>{row.detail}</td></tr>)}</tbody></table>
      </section>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Budget and guardrail recommendations</h2>
        <table style={tableStyle}><thead><tr><th style={thTdStyle}>Area</th><th style={thTdStyle}>Guidance</th></tr></thead><tbody>{budgetRows.map((row) => <tr key={row.area}><td style={thTdStyle}>{row.area}</td><td style={thTdStyle}>{row.note}</td></tr>)}</tbody></table>
      </section>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Keep / watch / rollback logic</h2>
        <table style={tableStyle}><tbody>{googleActionRows.map((row) => <tr key={row.action}><td style={thTdStyle}><strong>{row.action}</strong></td><td style={thTdStyle}>{row.rule}</td></tr>)}</tbody></table>
      </section>
    </>
  );
}

function MetaRecommendations() {
  const { selectedAccount } = useActiveAccount();

  return (
    <>
      <section style={{ ...cardStyle, border: '1px solid #fed7aa', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta recommendations</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>Mock-only recommendations for {selectedAccount.name}. Meta remains read-only/planning only and no live Meta changes are made.</p>
      </section>
      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Open priorities</div><strong style={{ fontSize: 32 }}>{metaRecommendations.length}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Top focus</div><strong style={{ fontSize: 32 }}>Creative fatigue</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Review logic</div><strong style={{ fontSize: 32 }}>Keep / Watch / Refresh</strong></div>
      </div>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Priority recommendations</h2>
        <table style={tableStyle}><thead><tr><th style={thTdStyle}>Priority</th><th style={thTdStyle}>Area</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Reason</th></tr></thead><tbody>{metaRecommendations.map((row) => <tr key={row.area}><td style={thTdStyle}>{row.priority}</td><td style={thTdStyle}>{row.area}</td><td style={thTdStyle}>{row.recommendation}</td><td style={thTdStyle}>{row.reason}</td></tr>)}</tbody></table>
      </section>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Keep / watch / refresh logic</h2>
        <table style={tableStyle}><tbody>{metaActionRows.map((row) => <tr key={row.action}><td style={thTdStyle}><strong>{row.action}</strong></td><td style={thTdStyle}>{row.rule}</td></tr>)}</tbody></table>
      </section>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recommended next action</h2>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>Open Meta Snapshot Preview, save a normal mock snapshot, save a changed mock snapshot, then detect changes before deciding whether to keep, watch, or refresh creative.</p>
      </section>
    </>
  );
}

export default function RecommendationsPage() {
  const { platform } = useActivePlatform();

  return (
    <AdminShell title="Recommendations" subtitle="Platform-aware recommendation hub for Google Ads and Facebook / Meta Ads.">
      {platform === 'meta_ads' ? <MetaRecommendations /> : <GoogleRecommendations />}
      <RecommendationResultTracking />
    </AdminShell>
  );
}
