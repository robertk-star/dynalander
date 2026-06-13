'use client';

import { useMemo, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActivePlatform } from '../_components/useActivePlatform';
import { googleRecommendationResults, metaRecommendationResults } from './recommendationResultsData';

type ResultRow = typeof googleRecommendationResults[number];

const buttonStyle = { ...blueButtonStyle, padding: '8px 10px', fontSize: 12 };

export default function RecommendationResultTracking() {
  const { platform } = useActivePlatform();
  const isMeta = platform === 'meta_ads';
  const starterRows = isMeta ? metaRecommendationResults : googleRecommendationResults;
  const [rows, setRows] = useState<ResultRow[]>(starterRows);
  const [statusFilter, setStatusFilter] = useState('all');
  const [noteFilter, setNoteFilter] = useState('all');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const visibleRows = useMemo(() => rows.filter((row) => {
    const note = notes[row.recommendation] || '';
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    if (noteFilter === 'has_note' && !note.trim()) return false;
    if (noteFilter === 'no_note' && note.trim()) return false;
    return true;
  }), [rows, notes, statusFilter, noteFilter]);

  function updateStatus(recommendation: string, status: string) {
    setRows((current) => current.map((row) => row.recommendation === recommendation ? { ...row, status } : row));
  }

  function updateNote(recommendation: string, note: string) {
    setNotes((current) => ({ ...current, [recommendation]: note }));
  }

  return (
    <>
      <section style={{ ...cardStyle, border: isMeta ? '1px solid #fed7aa' : '1px solid #bfdbfe', background: isMeta ? '#fff7ed' : '#eff6ff' }}>
        <h2 style={{ marginTop: 0 }}>Recommendation result tracking</h2>
        <p style={{ color: isMeta ? '#9a3412' : '#475569', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
          Filter recommendations by status or note. This Phase 26 version keeps filter changes on screen.
        </p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Tracked</div><strong style={{ fontSize: 30 }}>{rows.length}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Showing</div><strong style={{ fontSize: 30 }}>{visibleRows.length}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Platform</div><strong style={{ fontSize: 30 }}>{isMeta ? 'Meta' : 'Google'}</strong></div>
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
          <thead><tr><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Note</th><th style={thTdStyle}>Actions</th></tr></thead>
          <tbody>{visibleRows.map((row) => <tr key={row.recommendation}><td style={thTdStyle}><strong>{row.recommendation}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{row.nextAction}</p></td><td style={thTdStyle}><strong>{row.status}</strong></td><td style={thTdStyle}><textarea style={{ ...inputStyle, minWidth: 240, minHeight: 80 }} value={notes[row.recommendation] || ''} onChange={(event) => updateNote(row.recommendation, event.target.value)} placeholder="Add note..." /></td><td style={thTdStyle}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><button type="button" style={buttonStyle} onClick={() => updateStatus(row.recommendation, 'Accepted')}>Accept</button><button type="button" style={buttonStyle} onClick={() => updateStatus(row.recommendation, 'Watching')}>Watching</button><button type="button" style={buttonStyle} onClick={() => updateStatus(row.recommendation, 'Keep')}>Keep</button><button type="button" style={buttonStyle} onClick={() => updateStatus(row.recommendation, isMeta ? 'Refresh' : 'Rollback')}>{isMeta ? 'Refresh' : 'Rollback'}</button><button type="button" style={buttonStyle} onClick={() => updateStatus(row.recommendation, 'Closed')}>Close</button></div></td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
