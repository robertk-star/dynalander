'use client';

import { blueButtonStyle, cardStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type DetailRow = {
  recommendation: string;
  linkedChange: string;
  status: string;
  before: string;
  after: string;
  nextAction: string;
};

type ActivityRow = {
  id: string;
  recommendationTitle: string;
  oldStatus: string;
  newStatus: string;
  note: string;
  assignedTo?: string;
  changedAt: string;
};

export default function RecommendationDetailDrawer({ row, note, assignedTo, activity, onClose }: { row: DetailRow; note: string; assignedTo: string; activity: ActivityRow[]; onClose: () => void }) {
  const matchingActivity = activity.filter((item) => item.recommendationTitle === row.recommendation);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <aside style={{ width: 'min(720px, 100%)', height: '100%', overflowY: 'auto', background: '#f8fafc', padding: 24, boxShadow: '-20px 0 40px rgba(15, 23, 42, 0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start', marginBottom: 16 }}>
          <div>
            <p style={{ color: '#64748b', fontWeight: 800, margin: '0 0 6px' }}>Recommendation detail</p>
            <h2 style={{ margin: 0 }}>{row.recommendation}</h2>
          </div>
          <button type="button" style={{ ...blueButtonStyle, background: '#334155' }} onClick={onClose}>Close</button>
        </div>

        <section style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Current decision</h3>
          <table style={tableStyle}>
            <tbody>
              <tr><td style={thTdStyle}><strong>Status</strong></td><td style={thTdStyle}>{row.status}</td></tr>
              <tr><td style={thTdStyle}><strong>Assigned to</strong></td><td style={thTdStyle}>{assignedTo || 'Needs review'}</td></tr>
              <tr><td style={thTdStyle}><strong>Linked change</strong></td><td style={thTdStyle}>{row.linkedChange}</td></tr>
              <tr><td style={thTdStyle}><strong>Suggested next action</strong></td><td style={thTdStyle}>{row.nextAction}</td></tr>
            </tbody>
          </table>
        </section>

        <section style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Before / after result</h3>
          <table style={tableStyle}>
            <tbody>
              <tr><td style={thTdStyle}><strong>Before</strong></td><td style={thTdStyle}>{row.before}</td></tr>
              <tr><td style={thTdStyle}><strong>After</strong></td><td style={thTdStyle}>{row.after}</td></tr>
            </tbody>
          </table>
        </section>

        <section style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Saved note</h3>
          <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>{note || 'No note saved yet.'}</p>
        </section>

        <section style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>Activity history</h3>
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Changed</th><th style={thTdStyle}>Old</th><th style={thTdStyle}>New</th><th style={thTdStyle}>Assigned</th><th style={thTdStyle}>Note</th></tr></thead>
            <tbody>{matchingActivity.length ? matchingActivity.map((item) => <tr key={item.id}><td style={thTdStyle}>{new Date(item.changedAt).toLocaleString()}</td><td style={thTdStyle}>{item.oldStatus}</td><td style={thTdStyle}>{item.newStatus}</td><td style={thTdStyle}>{item.assignedTo || '—'}</td><td style={thTdStyle}>{item.note || '—'}</td></tr>) : <tr><td style={thTdStyle} colSpan={5}>No activity yet for this recommendation.</td></tr>}</tbody>
          </table>
        </section>
      </aside>
    </div>
  );
}
