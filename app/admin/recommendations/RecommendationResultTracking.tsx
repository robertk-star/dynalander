'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import { googleRecommendationResults, metaRecommendationResults, resultStages } from './recommendationResultsData';

type ResultRow = typeof googleRecommendationResults[number];
type ActivityRow = { id: string; recommendationTitle: string; oldStatus: string; newStatus: string; note: string; changedBy: string; changeSource: string; changedAt: string };

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
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activity, setActivity] = useState<ActivityRow[]>([]);
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
      setNotes({});
      setActivity([]);
      setSource('loading');
      setMessage('');
      try {
        const response = await fetch(`/api/admin/recommendation-status?accountKey=${encodeURIComponent(accountId)}&adPlatform=${encodeURIComponent(platform)}`, { cache: 'no-store' });
        const result = await response.json();
        if (result.ok && result.statuses) {
          setRows(baseRows.map((row) => ({ ...row, status: result.statuses[keyFor(row.recommendation)] || row.status })));
          setNotes(result.notes || {});
          setActivity(result.activity || []);
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

  function updateNote(recommendation: string, note: string) {
    const recommendationKey = keyFor(recommendation);
    setNotes((current) => ({ ...current, [recommendationKey]: note }));
  }

  async function updateStatus(recommendation: string, status: string) {
    const recommendationKey = keyFor(recommendation);
    const note = notes[recommendationKey] || '';
    setRows((current) => current.map((row) => row.recommendation === recommendation ? { ...row, status } : row));
    setMessage('Saving status and note...');

    try {
      const response = await fetch('/api/admin/recommendation-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId, adPlatform: platform, recommendationKey, recommendationTitle: recommendation, status, note, changedBy: 'DynLander Admin' })
      });
      const result = await response.json();
      if (result.ok) {
        setSource(result.source || 'database');
        setActivity(result.activity || []);
        setMessage(`Saved ${status} and note to ${result.source || 'database'}.`);
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
          <thead><tr><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Note</th><th style={thTdStyle}>Actions</th></tr></thead>
          <tbody>{rows.map((row) => { const recommendationKey = keyFor(row.recommendation); return <tr key={row.recommendation}><td style={thTdStyle}><strong>{row.recommendation}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{row.nextAction}</p></td><td style={thTdStyle}><strong>{row.status}</strong></td><td style={thTdStyle}><textarea style={{ ...inputStyle, minWidth: 240, minHeight: 80 }} placeholder="Add why this action was taken..." value={notes[recommendationKey] || ''} onChange={(event) => updateNote(row.recommendation, event.target.value)} /></td><td style={thTdStyle}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><button type="button" style={statusButtonStyle('#2563eb')} onClick={() => updateStatus(row.recommendation, 'Accepted')}>Accept</button><button type="button" style={statusButtonStyle('#7c3aed')} onClick={() => updateStatus(row.recommendation, 'Watching')}>Watching</button><button type="button" style={statusButtonStyle('#15803d')} onClick={() => updateStatus(row.recommendation, 'Keep')}>Keep</button><button type="button" style={statusButtonStyle('#b45309')} onClick={() => updateStatus(row.recommendation, isMeta ? 'Refresh' : 'Rollback')}>{isMeta ? 'Refresh' : 'Rollback'}</button><button type="button" style={statusButtonStyle('#334155')} onClick={() => updateStatus(row.recommendation, 'Closed')}>Close</button></div></td></tr>; })}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recommendation activity log</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Changed</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Old status</th><th style={thTdStyle}>New status</th><th style={thTdStyle}>Note</th><th style={thTdStyle}>Changed by</th><th style={thTdStyle}>Source</th></tr></thead>
          <tbody>{activity.length ? activity.map((row) => <tr key={row.id}><td style={thTdStyle}>{new Date(row.changedAt).toLocaleString()}</td><td style={thTdStyle}>{row.recommendationTitle}</td><td style={thTdStyle}>{row.oldStatus}</td><td style={thTdStyle}>{row.newStatus}</td><td style={thTdStyle}>{row.note || '—'}</td><td style={thTdStyle}>{row.changedBy}</td><td style={thTdStyle}>{row.changeSource}</td></tr>) : <tr><td style={thTdStyle} colSpan={7}>No activity logged yet. Click a status button after running the Phase 24 and Phase 25 SQL migrations.</td></tr>}</tbody>
        </table>
      </section>
    </>
  );
}
