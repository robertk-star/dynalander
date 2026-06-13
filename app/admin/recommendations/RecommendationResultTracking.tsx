'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import { googleRecommendationResults, metaRecommendationResults, resultStages } from './recommendationResultsData';

type ResultRow = typeof googleRecommendationResults[number];

const actionButtonStyle = { ...blueButtonStyle, padding: '8px 10px', fontSize: 12 };

function statusButtonStyle(background: string) {
  return { ...actionButtonStyle, background };
}

function keyFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function RecommendationResultTracking() {
  const { platform } = useActivePlatform();
  const { accountId } = useActiveAccount();
  const isMeta = platform === 'meta_ads';
  const defaultRows = isMeta ? metaRecommendationResults : googleRecommendationResults;
  const [rows, setRows] = useState<ResultRow[]>(defaultRows);
  const [source, setSource] = useState('loading');
  const [message, setMessage] = useState('');
  const activeWatching = rows.filter((row) => row.status === 'Watching').length;
  const openRows = rows.filter((row) => row.status === 'Open').length;
  const keepRows = rows.filter((row) => row.status === 'Keep').length;
  const closedRows = rows.filter((row) => row.status === 'Closed').length;
  const actionLabel = isMeta ? 'Rollback / Refresh' : 'Rollback';

  useEffect(() => {
    async function loadStatuses() {
      const baseRows = isMeta ? metaRecommendationResults : googleRecommendationResults;
      setRows(baseRows);
      setSource('loading');
      setMessage('');
      try {
        const response = await fetch(`/api/admin/recommendation-status?accountKey=${encodeURIComponent(accountId)}&adPlatform=${encodeURIComponent(platform)}`, { cache: 'no-store' });
        const result = await response.json();
        if (result.ok && result.statuses) {
          setRows(baseRows.map((row) => ({ ...row, status: result.statuses[keyFor(row.recommendation)] || row.status })));
          setSource(result.source || 'database');
          return;
        }
        setSource('local');
        setMessage(result.error ? `Database unavailable: ${result.error}` : 'Using mock defaults.');
      } catch {
        setSource('local');
        setMessage('Using mock defaults. Status load failed.');
      }
    }

    loadStatuses();
  }, [accountId, isMeta, platform]);

  async function updateStatus(recommendation: string, status: string) {
    const recommendationKey = keyFor(recommendation);
    setRows((current) => current.map((row) => row.recommendation === recommendation ? { ...row, status } : row));
    setMessage('Saving status...');

    try {
      const response = await fetch('/api/admin/recommendation-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId, adPlatform: platform, recommendationKey, recommendationTitle: recommendation, status })
      });
      const result = await response.json();
      if (result.ok) {
        setSource(result.source || 'database');
        setMessage(`Saved ${status} to ${result.source || 'database'}.`);
      } else {
        setSource('local');
        setMessage(`Saved on screen only. Database save unavailable: ${result.error || 'not configured'}`);
      }
    } catch {
      setSource('local');
      setMessage('Saved on screen only. Database save request failed.');
    }
  }

  return (
    <>
      <section style={{ ...cardStyle, border: isMeta ? '1px solid #fed7aa' : '1px solid #bfdbfe', background: isMeta ? '#fff7ed' : '#eff6ff' }}>
        <h2 style={{ marginTop: 0 }}>Recommendation result tracking</h2>
        <p style={{ color: isMeta ? '#9a3412' : '#475569', fontWeight: 800, lineHeight: 1.6 }}>
          This tracker connects an AI recommendation to a saved change, watches the result window, then decides whether to keep, watch, or {actionLabel.toLowerCase()}.
        </p>
        <p style={{ color: '#64748b', marginBottom: 0 }}><strong>Status source:</strong> {source}{message ? ` · ${message}` : ''}</p>
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
          <tbody>{resultStages.map((stage) => <tr key={stage}><td style={thTdStyle}><strong>{stage}</strong></td><td style={thTdStyle}>Workflow stage for recommendation review.</td></tr>)}</tbody>
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
