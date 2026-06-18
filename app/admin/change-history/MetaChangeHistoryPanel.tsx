'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';

type PerformanceWindow = { since: string; until: string; spend: string; results: string; costPerResult: string; impressions: string; clicks: string; ctr: string; cpc: string; cpm: string };
type LiveChange = { id: string; entity_level: 'campaign' | 'ad_set' | 'ad'; entity_id: string; entity_name: string; parent_campaign_name?: string; parent_ad_set_name?: string; field_name: string; old_value: string; new_value: string; change_importance: 'high' | 'medium' | 'low'; detected_at: string; performance?: { before: PerformanceWindow; after: PerformanceWindow; warning?: string | null } | null; performanceWarning?: string };
type HistoryResponse = { ok: boolean; error?: string; changes: LiveChange[]; snapshotCount: number; lastSnapshotAt: string | null };
type SnapshotResponse = { ok: boolean; error?: string; snapshotsSaved?: number; changesDetected?: number; snapshotRunId?: string };

function cdt(value?: string | null) { if (!value) return '—'; return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }
function label(level: string) { if (level === 'ad_set') return 'Ad set'; if (level === 'campaign') return 'Campaign'; return 'Ad'; }
function importanceStyle(value: string) { if (value === 'high') return { background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444' }; if (value === 'medium') return { background: '#ffedd5', color: '#9a3412', border: '1px solid #f97316' }; return { background: '#dcfce7', color: '#166534', border: '1px solid #22c55e' }; }

function PerformanceCell({ row }: { row: LiveChange }) {
  const perf = row.performance;
  if (!perf) return <span style={{ color: '#64748b' }}>{row.performanceWarning || 'Not loaded'}</span>;
  return (
    <div style={{ display: 'grid', gap: 8, minWidth: 320 }}>
      <div><strong>Before</strong> <span style={{ color: '#64748b' }}>{perf.before.since} to {perf.before.until}</span><br />{perf.before.results} leads · {perf.before.spend} spend · {perf.before.costPerResult} CPL · {perf.before.ctr} CTR</div>
      <div><strong>After</strong> <span style={{ color: '#64748b' }}>{perf.after.since} to {perf.after.until}</span><br />{perf.after.results} leads · {perf.after.spend} spend · {perf.after.costPerResult} CPL · {perf.after.ctr} CTR</div>
      {perf.warning ? <div style={{ color: '#9a3412', fontWeight: 800 }}>{perf.warning}</div> : null}
    </div>
  );
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
      const response = await fetch('/api/meta-ads/live-snapshot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accountKey: accountId }) });
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
            <h2 style={{ marginTop: 0 }}>Meta change history — Phase 3</h2>
            <p style={{ color: data?.ok ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{data?.ok ? `Tracking live setup snapshots for ${selectedAccount.name}.` : data?.error || 'Change history is not ready yet.'}</p>
          </div>
          <button type="button" onClick={takeSnapshot} style={blueButtonStyle}>{saving ? 'Taking snapshot...' : 'Take Meta Snapshot Now'}</button>
        </div>
        {snapshotResult ? <p style={{ color: snapshotResult.ok ? '#0f766e' : '#9a3412', fontWeight: 800 }}>{snapshotResult.ok ? `Snapshot saved. ${snapshotResult.snapshotsSaved || 0} items checked. ${snapshotResult.changesDetected || 0} changes detected.` : snapshotResult.error}</p> : null}
      </section>

      <section style={{ ...cardStyle, border: '2px solid #2563eb', background: '#eff6ff' }}>
        <h2 style={{ marginTop: 0 }}>Before / after performance</h2>
        <p style={{ color: '#1d4ed8', fontWeight: 800, lineHeight: 1.6 }}>Each recent change now includes a 7-day before and 7-day after performance window when Meta returns the data.</p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>For changes detected today, the after window may be empty until enough days pass.</p>
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
          <thead><tr><th style={thTdStyle}>Detected CDT</th><th style={thTdStyle}>Importance</th><th style={thTdStyle}>Level</th><th style={thTdStyle}>Item</th><th style={thTdStyle}>Field changed</th><th style={thTdStyle}>From</th><th style={thTdStyle}>To</th><th style={thTdStyle}>Before / after performance</th></tr></thead>
          <tbody>
            {changes.map((row) => (
              <tr key={row.id}>
                <td style={thTdStyle}>{cdt(row.detected_at)}</td>
                <td style={thTdStyle}><span style={{ ...importanceStyle(row.change_importance), borderRadius: 999, padding: '6px 10px', fontWeight: 900 }}>{row.change_importance}</span></td>
                <td style={thTdStyle}>{label(row.entity_level)}</td>
                <td style={thTdStyle}>{row.entity_name || row.entity_id}<div style={{ color: '#64748b', fontSize: 12 }}>{row.parent_campaign_name || '—'} / {row.parent_ad_set_name || '—'}</div></td>
                <td style={thTdStyle}>{row.field_name}</td>
                <td style={thTdStyle}><pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{row.old_value || '—'}</pre></td>
                <td style={thTdStyle}><pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{row.new_value || '—'}</pre></td>
                <td style={thTdStyle}><PerformanceCell row={row} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && changes.length === 0 ? <p style={{ color: '#64748b' }}>No live changes detected yet. Take one snapshot now, wait until something changes in Meta, then take another snapshot to compare from → to.</p> : null}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>How Phase 3 works</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>DynLander saves live setup snapshots, detects from → to changes, then asks Meta for performance 7 days before and 7 days after the detected change.</p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>This is read-only. Phase 4 can add an AI verdict like helped, hurt, or keep watching.</p>
      </section>
    </>
  );
}
