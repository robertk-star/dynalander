'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';

type LiveChange = {
  id: string;
  entity_level: 'campaign' | 'ad_set' | 'ad';
  entity_id: string;
  entity_name: string;
  parent_campaign_name?: string;
  parent_ad_set_name?: string;
  field_name: string;
  old_value: string;
  new_value: string;
  change_importance: 'high' | 'medium' | 'low';
  detected_at: string;
};

type HistoryResponse = { ok: boolean; error?: string; changes: LiveChange[]; snapshotCount: number; lastSnapshotAt: string | null };
type SnapshotResponse = { ok: boolean; error?: string; snapshotsSaved?: number; changesDetected?: number; snapshotRunId?: string };

function cdt(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function label(level: string) {
  if (level === 'ad_set') return 'Ad set';
  if (level === 'campaign') return 'Campaign';
  return 'Ad';
}

function importanceStyle(value: string) {
  if (value === 'high') return { background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444' };
  if (value === 'medium') return { background: '#ffedd5', color: '#9a3412', border: '1px solid #f97316' };
  return { background: '#dcfce7', color: '#166534', border: '1px solid #22c55e' };
}

export default function MetaChangeHistoryPanel() {
  const { accountId, selectedAccount } = useActiveAccount();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [snapshotResult, setSnapshotResult] = useState<SnapshotResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadHistory() {
    setLoading(true);
    try {
      const response = await fetch(`/api/meta-ads/live-change-history?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' });
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }

  async function takeSnapshot() {
    setSaving(true);
    setSnapshotResult(null);
    try {
      const response = await fetch('/api/meta-ads/live-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId })
      });
      const result = await response.json();
      setSnapshotResult(result);
      await loadHistory();
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { loadHistory(); }, [accountId]);

  const changes = data?.changes || [];
  const highCount = changes.filter((row) => row.change_importance === 'high').length;
  const campaignCount = changes.filter((row) => row.entity_level === 'campaign').length;
  const adSetCount = changes.filter((row) => row.entity_level === 'ad_set').length;
  const adCount = changes.filter((row) => row.entity_level === 'ad').length;

  return (
    <>
      <section style={{ ...cardStyle, border: data?.ok ? '2px solid #0f766e' : '2px solid #f97316', background: data?.ok ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta change history — Phase 1</h2>
            <p style={{ color: data?.ok ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
              {data?.ok ? `Tracking live setup snapshots for ${selectedAccount.name}.` : data?.error || 'Change history is not ready yet.'}
            </p>
          </div>
          <button type="button" onClick={takeSnapshot} style={blueButtonStyle}>{saving ? 'Taking snapshot...' : 'Take Meta Snapshot Now'}</button>
        </div>
        {snapshotResult ? <p style={{ color: snapshotResult.ok ? '#0f766e' : '#9a3412', fontWeight: 800 }}>{snapshotResult.ok ? `Snapshot saved. ${snapshotResult.snapshotsSaved || 0} items checked. ${snapshotResult.changesDetected || 0} changes detected.` : snapshotResult.error}</p> : null}
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Snapshots saved</div><strong style={{ fontSize: 28 }}>{loading ? 'Loading...' : data?.snapshotCount || 0}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Campaign, ad set, and ad setup rows.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Last snapshot</div><strong style={{ fontSize: 22 }}>{loading ? 'Loading...' : cdt(data?.lastSnapshotAt)}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Displayed in Central time.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Changes detected</div><strong style={{ fontSize: 28 }}>{changes.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Compared latest snapshot to prior snapshot.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>High impact</div><strong style={{ fontSize: 28 }}>{highCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Budgets, status, objectives, targeting, URLs, CTA, optimization.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Campaign / Ad set / Ad</div><strong style={{ fontSize: 24 }}>{campaignCount} / {adSetCount} / {adCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Change count by level.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Detected live Meta changes</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Detected CDT</th>
              <th style={thTdStyle}>Importance</th>
              <th style={thTdStyle}>Level</th>
              <th style={thTdStyle}>Item</th>
              <th style={thTdStyle}>Campaign</th>
              <th style={thTdStyle}>Ad set</th>
              <th style={thTdStyle}>Field changed</th>
              <th style={thTdStyle}>From</th>
              <th style={thTdStyle}>To</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((row) => (
              <tr key={row.id}>
                <td style={thTdStyle}>{cdt(row.detected_at)}</td>
                <td style={thTdStyle}><span style={{ ...importanceStyle(row.change_importance), borderRadius: 999, padding: '6px 10px', fontWeight: 900 }}>{row.change_importance}</span></td>
                <td style={thTdStyle}>{label(row.entity_level)}</td>
                <td style={thTdStyle}>{row.entity_name || row.entity_id}<div style={{ color: '#64748b', fontSize: 12 }}>{row.entity_id}</div></td>
                <td style={thTdStyle}>{row.parent_campaign_name || '—'}</td>
                <td style={thTdStyle}>{row.parent_ad_set_name || '—'}</td>
                <td style={thTdStyle}>{row.field_name}</td>
                <td style={thTdStyle}><pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{row.old_value || '—'}</pre></td>
                <td style={thTdStyle}><pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{row.new_value || '—'}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && changes.length === 0 ? <p style={{ color: '#64748b' }}>No live changes detected yet. Take one snapshot now, wait until something changes in Meta, then take another snapshot to compare from → to.</p> : null}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>How Phase 1 works</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>Click “Take Meta Snapshot Now” to save the current setup for campaigns, ad sets, and ads. The next snapshot compares against the prior snapshot and creates from → to change rows.</p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>Phase 1 is read-only. It does not change Meta. Phase 2 can add an hourly scheduled snapshot so this runs automatically.</p>
      </section>
    </>
  );
}
