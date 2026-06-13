'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActivePlatform } from '../_components/useActivePlatform';
import { googleRecommendationResults, metaRecommendationResults, resultStages } from './recommendationResultsData';

type ResultRow = typeof googleRecommendationResults[number];

const actionButtonStyle = { ...blueButtonStyle, padding: '8px 10px', fontSize: 12 };

function statusButtonStyle(background: string) {
  return { ...actionButtonStyle, background };
}

export default function RecommendationResultTracking() {
  const { platform } = useActivePlatform();
  const isMeta = platform === 'meta_ads';
  const defaultRows = isMeta ? metaRecommendationResults : googleRecommendationResults;
  const [rows, setRows] = useState<ResultRow[]>(defaultRows);
  const activeWatching = rows.filter((row) => row.status === 'Watching').length;
  const openRows = rows.filter((row) => row.status === 'Open').length;
  const keepRows = rows.filter((row) => row.status === 'Keep').length;
  const closedRows = rows.filter((row) => row.status === 'Closed').length;
  const actionLabel = isMeta ? 'Rollback / Refresh' : 'Rollback';

  useEffect(() => {
    setRows(isMeta ? metaRecommendationResults : googleRecommendationResults);
  }, [isMeta]);

  function updateStatus(recommendation: string, status: string) {
    setRows((current) => current.map((row) => row.recommendation === recommendation ? { ...row, status } : row));
  }

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
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Closed</div><strong style={{ fontSize: 30 }}>{closedRows}</strong></div>
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
          <thead><tr><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Linked change</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Before</th><th style={thTdStyle}>After</th><th style={thTdStyle}>Next action</th><th style={thTdStyle}>Actions</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.recommendation}><td style={thTdStyle}>{row.recommendation}</td><td style={thTdStyle}>{row.linkedChange}</td><td style={thTdStyle}><strong>{row.status}</strong></td><td style={thTdStyle}>{row.before}</td><td style={thTdStyle}>{row.after}</td><td style={thTdStyle}>{row.nextAction}</td><td style={thTdStyle}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><button type="button" style={statusButtonStyle('#2563eb')} onClick={() => updateStatus(row.recommendation, 'Accepted')}>Accept</button><button type="button" style={statusButtonStyle('#7c3aed')} onClick={() => updateStatus(row.recommendation, 'Watching')}>Watching</button><button type="button" style={statusButtonStyle('#15803d')} onClick={() => updateStatus(row.recommendation, 'Keep')}>Keep</button><button type="button" style={statusButtonStyle('#b45309')} onClick={() => updateStatus(row.recommendation, isMeta ? 'Refresh' : 'Rollback')}>{isMeta ? 'Refresh' : 'Rollback'}</button><button type="button" style={statusButtonStyle('#334155')} onClick={() => updateStatus(row.recommendation, 'Closed')}>Close</button></div></td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
