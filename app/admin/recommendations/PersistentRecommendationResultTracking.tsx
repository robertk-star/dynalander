'use client';

import { useEffect, useMemo, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import { googleRecommendationResults, metaRecommendationResults } from './recommendationResultsData';
import RecommendationDetailDrawer from './RecommendationDetailDrawer';

type ResultRow = typeof googleRecommendationResults[number];
type ActivityRow = { id: string; recommendationTitle: string; oldStatus: string; newStatus: string; note: string; assignedTo?: string; changedBy: string; changeSource: string; changedAt: string };

const assignmentOptions = ['Owner', 'Media buyer', 'Client', 'Needs review', 'Done'];

function keyFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const smallButton = { ...blueButtonStyle, padding: '8px 10px', fontSize: 12 };

export default function PersistentRecommendationResultTracking() {
  const { platform } = useActivePlatform();
  const { accountId } = useActiveAccount();
  const isMeta = platform === 'meta_ads';
  const defaultRows = isMeta ? metaRecommendationResults : googleRecommendationResults;
  const [rows, setRows] = useState<ResultRow[]>(defaultRows);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [noteFilter, setNoteFilter] = useState('all');
  const [selectedRow, setSelectedRow] = useState<ResultRow | null>(null);
  const [message, setMessage] = useState('Loading saved recommendation actions...');
  const [source, setSource] = useState('loading');

  useEffect(() => {
    async function loadSavedActions() {
      const baseRows = isMeta ? metaRecommendationResults : googleRecommendationResults;
      setRows(baseRows);
      setNotes({});
      setAssignments({});
      setActivity([]);
      setStatusFilter('all');
      setNoteFilter('all');
      setSelectedRow(null);
      setSource('loading');
      setMessage('Loading saved recommendation actions...');

      try {
        const response = await fetch(`/api/admin/recommendation-status?accountKey=${encodeURIComponent(accountId)}&adPlatform=${encodeURIComponent(platform)}`, { cache: 'no-store' });
        const result = await response.json();
        if (result.ok) {
          setRows(baseRows.map((row) => ({ ...row, status: result.statuses?.[keyFor(row.recommendation)] || row.status })));
          setNotes(result.notes || {});
          setAssignments(result.assignments || {});
          setActivity(result.activity || []);
          setSource(result.source || 'database');
          setMessage(`Loaded saved actions from ${result.source || 'database'}.`);
          return;
        }
        setSource('local');
        setMessage(result.error ? `Using screen-only mode: ${result.error}` : 'Using screen-only mode.');
      } catch {
        setSource('local');
        setMessage('Using screen-only mode. Saved actions could not load.');
      }
    }

    loadSavedActions();
  }, [accountId, isMeta, platform]);

  const visibleRows = useMemo(() => rows.filter((row) => {
    const note = notes[keyFor(row.recommendation)] || '';
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    if (noteFilter === 'has_note' && !note.trim()) return false;
    if (noteFilter === 'no_note' && note.trim()) return false;
    return true;
  }), [rows, notes, statusFilter, noteFilter]);

  async function saveAction(recommendation: string, status: string) {
    const recommendationKey = keyFor(recommendation);
    const note = notes[recommendationKey] || '';
    const assignedTo = assignments[recommendationKey] || 'Needs review';
    setRows((current) => current.map((row) => row.recommendation === recommendation ? { ...row, status } : row));
    setSelectedRow((current) => current?.recommendation === recommendation ? { ...current, status } : current);
    setMessage('Saving action...');

    try {
      const response = await fetch('/api/admin/recommendation-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId, adPlatform: platform, recommendationKey, recommendationTitle: recommendation, status, note, assignedTo, changedBy: 'DynLander Admin' })
      });
      const result = await response.json();
      if (result.ok) {
        setSource(result.source || 'database');
        setActivity(result.activity || []);
        setMessage(`Saved ${status} to ${result.source || 'database'}.`);
      } else {
        setSource('local');
        setMessage(`Saved on screen only: ${result.error || 'database unavailable'}`);
      }
    } catch {
      setSource('local');
      setMessage('Saved on screen only. Save request failed.');
    }
  }

  function updateNote(recommendation: string, note: string) {
    setNotes((current) => ({ ...current, [keyFor(recommendation)]: note }));
  }

  function updateAssignment(recommendation: string, assignedTo: string) {
    setAssignments((current) => ({ ...current, [keyFor(recommendation)]: assignedTo }));
  }

  return (
    <>
      <section style={{ ...cardStyle, border: isMeta ? '1px solid #fed7aa' : '1px solid #bfdbfe', background: isMeta ? '#fff7ed' : '#eff6ff' }}>
        <h2 style={{ marginTop: 0 }}>Recommendation result tracking</h2>
        <p style={{ color: isMeta ? '#9a3412' : '#475569', fontWeight: 800, lineHeight: 1.6 }}>Filtered tracker with saved statuses, notes, assignments, activity log, and detail drawer.</p>
        <p style={{ color: '#64748b', marginBottom: 0 }}><strong>Source:</strong> {source} · {message}</p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Tracked</div><strong style={{ fontSize: 30 }}>{rows.length}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Showing</div><strong style={{ fontSize: 30 }}>{visibleRows.length}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Open</div><strong style={{ fontSize: 30 }}>{rows.filter((row) => row.status === 'Open').length}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Watching</div><strong style={{ fontSize: 30 }}>{rows.filter((row) => row.status === 'Watching').length}</strong></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recommendation filters</h2>
        <div style={gridStyle}>
          <select style={inputStyle} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="Open">Open</option>
            <option value="Accepted">Accepted</option>
            <option value="Watching">Watching</option>
            <option value="Keep">Keep</option>
            <option value="Rollback">Rollback</option>
            <option value="Refresh">Refresh</option>
            <option value="Closed">Closed</option>
          </select>
          <select style={inputStyle} value={noteFilter} onChange={(event) => setNoteFilter(event.target.value)}>
            <option value="all">All notes</option>
            <option value="has_note">Has note</option>
            <option value="no_note">No note</option>
          </select>
          <button type="button" style={{ ...blueButtonStyle, background: '#334155' }} onClick={() => { setStatusFilter('all'); setNoteFilter('all'); }}>Clear filters</button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Tracked results</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Assigned to</th><th style={thTdStyle}>Note</th><th style={thTdStyle}>Actions</th></tr></thead>
          <tbody>{visibleRows.map((row) => { const rowKey = keyFor(row.recommendation); return <tr key={row.recommendation}><td style={thTdStyle}><strong>{row.recommendation}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{row.nextAction}</p></td><td style={thTdStyle}><strong>{row.status}</strong></td><td style={thTdStyle}><select style={inputStyle} value={assignments[rowKey] || 'Needs review'} onChange={(event) => updateAssignment(row.recommendation, event.target.value)}>{assignmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></td><td style={thTdStyle}><textarea style={{ ...inputStyle, minWidth: 240, minHeight: 80 }} value={notes[rowKey] || ''} onChange={(event) => updateNote(row.recommendation, event.target.value)} placeholder="Add note..." /></td><td style={thTdStyle}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><button type="button" style={{ ...smallButton, background: '#0f766e' }} onClick={() => setSelectedRow(row)}>Details</button><button type="button" style={smallButton} onClick={() => saveAction(row.recommendation, 'Accepted')}>Accept</button><button type="button" style={smallButton} onClick={() => saveAction(row.recommendation, 'Watching')}>Watching</button><button type="button" style={smallButton} onClick={() => saveAction(row.recommendation, 'Keep')}>Keep</button><button type="button" style={smallButton} onClick={() => saveAction(row.recommendation, isMeta ? 'Refresh' : 'Rollback')}>{isMeta ? 'Refresh' : 'Rollback'}</button><button type="button" style={smallButton} onClick={() => saveAction(row.recommendation, 'Closed')}>Close</button></div></td></tr>; })}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recommendation activity log</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Changed</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Old</th><th style={thTdStyle}>New</th><th style={thTdStyle}>Assigned</th><th style={thTdStyle}>Note</th></tr></thead>
          <tbody>{activity.length ? activity.map((row) => <tr key={row.id}><td style={thTdStyle}>{new Date(row.changedAt).toLocaleString()}</td><td style={thTdStyle}>{row.recommendationTitle}</td><td style={thTdStyle}>{row.oldStatus}</td><td style={thTdStyle}>{row.newStatus}</td><td style={thTdStyle}>{row.assignedTo || '—'}</td><td style={thTdStyle}>{row.note || '—'}</td></tr>) : <tr><td style={thTdStyle} colSpan={6}>No activity logged yet.</td></tr>}</tbody>
        </table>
      </section>

      {selectedRow ? <RecommendationDetailDrawer row={selectedRow} note={notes[keyFor(selectedRow.recommendation)] || ''} assignedTo={assignments[keyFor(selectedRow.recommendation)] || 'Needs review'} activity={activity} onClose={() => setSelectedRow(null)} /> : null}
    </>
  );
}
