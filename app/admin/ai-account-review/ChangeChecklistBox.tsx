'use client';

import { useEffect, useMemo, useState } from 'react';
import { blueButtonStyle, cardStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type ChecklistStatus = 'todo' | 'doing' | 'done';
type ChecklistItem = { id: string; title: string; detail: string; priority: string; status: ChecklistStatus };
const KEY = 'dynalander.aiReview.changeChecklist';

function text(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join('; ');
  try { return JSON.stringify(value); } catch { return ''; }
}

function read(): Record<string, ChecklistStatus> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

function write(value: Record<string, ChecklistStatus>) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

function makeId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || `${Date.now()}`;
}

function recommendationRows(review: any): ChecklistItem[] {
  const rows = Array.isArray(review?.evidenceBasedRecommendations) ? review.evidenceBasedRecommendations : [];
  const fallback = Array.isArray(review?.topRecommendedChanges) ? review.topRecommendedChanges.map((item: unknown) => ({ recommendation: item })) : [];
  const source = rows.length ? rows : fallback;

  return source.map((item: any, index: number) => {
    const title = text(item.suggestedNextStep || item.recommendation || item.issue || item);
    const detail = text(item.evidence || item.whyItMatters || item.issue || item.recommendation);
    const priority = text(item.priorityScore || item.priority || 'Medium');
    return { id: makeId(`${index}-${title}-${detail}`), title: title || 'Review recommendation', detail: detail || 'No evidence returned.', priority, status: 'todo' as ChecklistStatus };
  }).slice(0, 15);
}

export default function ChangeChecklistBox({ review, accountKey }: { review: any; accountKey: string }) {
  const [saved, setSaved] = useState<Record<string, ChecklistStatus>>({});
  const items = useMemo(() => recommendationRows(review).map((item) => ({ ...item, status: saved[`${accountKey}:${item.id}`] || item.status })), [review, saved, accountKey]);

  function setStatus(item: ChecklistItem, status: ChecklistStatus) {
    const next = { ...saved, [`${accountKey}:${item.id}`]: status };
    setSaved(next);
    write(next);
  }

  function clearChecklist() {
    const next = { ...saved };
    items.forEach((item) => delete next[`${accountKey}:${item.id}`]);
    setSaved(next);
    write(next);
  }

  useEffect(() => { setSaved(read()); }, []);

  const doneCount = items.filter((item) => item.status === 'done').length;

  return (
    <section style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
        <div>
          <h2 style={{ marginTop: 0 }}>AI Change Checklist</h2>
          <p style={{ color: '#64748b', fontWeight: 800 }}>{doneCount} of {items.length} completed.</p>
        </div>
        <button type="button" onClick={clearChecklist} style={{ ...blueButtonStyle, background: '#334155' }}>Clear checklist progress</button>
      </div>
      <table style={tableStyle}>
        <thead><tr><th style={thTdStyle}>Status</th><th style={thTdStyle}>Change to review</th><th style={thTdStyle}>Evidence / why</th><th style={thTdStyle}>Priority</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={thTdStyle}>
                <select value={item.status} onChange={(event) => setStatus(item, event.target.value as ChecklistStatus)} style={{ padding: 8, borderRadius: 8 }}>
                  <option value="todo">To Review</option>
                  <option value="doing">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </td>
              <td style={thTdStyle}><strong>{item.title}</strong></td>
              <td style={thTdStyle}>{item.detail}</td>
              <td style={thTdStyle}>{item.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length ? <p style={{ color: '#64748b' }}>Run the AI review to create checklist items.</p> : null}
    </section>
  );
}
