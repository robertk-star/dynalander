'use client';

import { useEffect, useState } from 'react';
import { cardStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type Readiness = {
  ok: boolean;
  mode: string;
  checks: Array<{ key: string; label: string; ok: boolean }>;
  counts: { clients: number; aiDirections: number };
  checkedAt: string;
};

export default function LiveReadinessChecklist() {
  const [readiness, setReadiness] = useState<Readiness | null>(null);

  useEffect(() => {
    fetch('/api/google-ads/live-readiness', { cache: 'no-store' })
      .then((response) => response.json())
      .then(setReadiness)
      .catch(() => setReadiness(null));
  }, []);

  return (
    <>
      <section style={{ ...cardStyle, border: readiness?.ok ? '2px solid #16a34a' : '2px solid #f97316', background: readiness?.ok ? '#f0fdf4' : '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>{readiness?.ok ? 'Ready for first read-only live pull' : 'Not ready for live pull yet'}</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          This checklist must be green before DynLander should pull real Google Ads setup data. Even when ready, the next step should be preview-only before saving snapshots.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Checklist</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Requirement</th><th style={thTdStyle}>Status</th></tr></thead>
          <tbody>{(readiness?.checks ?? []).map((check) => <tr key={check.key}><td style={thTdStyle}>{check.label}</td><td style={thTdStyle}>{check.ok ? 'Ready' : 'Needs attention'}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Counts</h2>
        <p style={{ color: '#475569' }}>Clients loaded: <strong>{readiness?.counts.clients ?? 0}</strong></p>
        <p style={{ color: '#475569' }}>AI Directions loaded: <strong>{readiness?.counts.aiDirections ?? 0}</strong></p>
        <p style={{ color: '#475569' }}>Mode: <strong>{readiness?.mode || 'checking'}</strong></p>
        <p style={{ color: '#475569', marginBottom: 0 }}>Last checked: <strong>{readiness?.checkedAt ? new Date(readiness.checkedAt).toLocaleString() : 'checking'}</strong></p>
      </section>
    </>
  );
}
