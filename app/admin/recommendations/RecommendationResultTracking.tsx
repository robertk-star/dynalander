'use client';

import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActivePlatform } from '../_components/useActivePlatform';
import { googleRecommendationResults, metaRecommendationResults, resultStages } from './recommendationResultsData';

export default function RecommendationResultTracking() {
  const { platform } = useActivePlatform();
  const isMeta = platform === 'meta_ads';
  const rows = isMeta ? metaRecommendationResults : googleRecommendationResults;
  const activeWatching = rows.filter((row) => row.status === 'Watching').length;
  const openRows = rows.filter((row) => row.status === 'Open').length;
  const keepRows = rows.filter((row) => row.status === 'Keep').length;
  const actionLabel = isMeta ? 'Rollback / Refresh' : 'Rollback';

  return (
    <>
      <section style={{ ...cardStyle, border: isMeta ? '1px solid #fed7aa' : '1px solid #bfdbfe', background: isMeta ? '#fff7ed' : '#eff6ff' }}>
        <h2 style={{ marginTop: 0 }}>Recommendation result tracking</h2>
        <p style={{ color: isMeta ? '#9a3412' : '#475569', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
          This mock tracker shows how DynLander will connect an AI recommendation to a saved change, watch the result window, then decide whether to keep, watch, or {actionLabel.toLowerCase()}.
        </p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Tracked recommendations</div><strong style={{ fontSize: 30 }}>{rows.length}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Open</div><strong style={{ fontSize: 30 }}>{openRows}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Watching</div><strong style={{ fontSize: 30 }}>{activeWatching}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Keep decisions</div><strong style={{ fontSize: 30 }}>{keepRows}</strong></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Result stages</h2>
        <table style={tableStyle}>
          <tbody>{resultStages.map((stage) => <tr key={stage}><td style={thTdStyle}><strong>{stage}</strong></td><td style={thTdStyle}>Mock workflow stage for recommendation review.</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Tracked results</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Linked change</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Before</th><th style={thTdStyle}>After</th><th style={thTdStyle}>Next action</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.recommendation}><td style={thTdStyle}>{row.recommendation}</td><td style={thTdStyle}>{row.linkedChange}</td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>{row.before}</td><td style={thTdStyle}>{row.after}</td><td style={thTdStyle}>{row.nextAction}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
