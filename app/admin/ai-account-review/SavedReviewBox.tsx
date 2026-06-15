'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, inputStyle } from '../_components/adminStyles';

type Saved = { id: string; at: string; accountKey: string; range: string; grade: string; problems: number; fixes: number; summary: string };
const KEY = 'dynalander.aiReview.saved';

function text(value: unknown) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(text).join('; ');
  return JSON.stringify(value);
}

function count(value: unknown) {
  if (!value) return 0;
  return Array.isArray(value) ? value.length : 1;
}

function read(): Saved[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

function write(rows: Saved[]) {
  localStorage.setItem(KEY, JSON.stringify(rows.slice(0, 20)));
}

export default function SavedReviewBox({ data, accountKey, range }: { data: any; accountKey: string; range: string }) {
  const [rows, setRows] = useState<Saved[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');

  function refresh() {
    const next = read().filter((row) => row.accountKey === accountKey);
    setRows(next);
    setSelectedId((current) => current || next[0]?.id || '');
  }

  function saveNow() {
    if (!data?.review) { setMessage('Run a review before saving.'); return; }
    const row = { id: `${Date.now()}`, at: new Date().toISOString(), accountKey, range, grade: text(data.review.overallGrade), problems: count(data.review.topProblems), fixes: count(data.review.topRecommendedChanges), summary: text(data.review.summary) };
    const next = [row, ...read()];
    write(next);
    setRows(next.filter((item) => item.accountKey === accountKey));
    setSelectedId(row.id);
    setMessage('Review saved.');
  }

  useEffect(() => { refresh(); }, [accountKey]);
  const picked = rows.find((row) => row.id === selectedId) || rows[0];
  const currentProblems = count(data?.review?.topProblems);
  const currentFixes = count(data?.review?.topRecommendedChanges);

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Saved AI Reviews</h2>
      <button type="button" onClick={saveNow} style={blueButtonStyle}>Save current review</button>
      <select style={{ ...inputStyle, marginTop: 12 }} value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
        <option value="">Select saved review</option>
        {rows.map((row) => <option key={row.id} value={row.id}>{new Date(row.at).toLocaleString()} · Grade {row.grade} · {row.range}</option>)}
      </select>
      <p style={{ color: '#64748b', fontWeight: 800 }}>{message || `${rows.length} saved review(s).`}</p>
      {picked ? <p><strong>Compared to saved:</strong> Grade {picked.grade} → {text(data?.review?.overallGrade)}. Problems {picked.problems} → {currentProblems}. Recommended changes {picked.fixes} → {currentFixes}.</p> : null}
      {picked ? <p style={{ color: '#64748b' }}><strong>Saved summary:</strong> {picked.summary}</p> : null}
    </section>
  );
}
