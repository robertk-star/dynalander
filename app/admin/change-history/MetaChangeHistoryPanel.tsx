'use client';

import { useEffect, useMemo, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';

type PerformanceWindow = { since: string; until: string; spend: string; results: string; costPerResult: string; impressions: string; clicks: string; ctr: string; cpc: string; cpm: string };
type ChangeVerdict = { verdict: 'Helped' | 'Hurt' | 'Keep watching' | 'Not enough data'; reason: string };
type LiveChange = { id: string; entity_level: 'campaign' | 'ad_set' | 'ad'; entity_id: string; entity_name: string; parent_campaign_name?: string; parent_ad_set_name?: string; field_name: string; old_value: string; new_value: string; change_importance: 'high' | 'medium' | 'low'; detected_at: string; performance?: { before: PerformanceWindow; after: PerformanceWindow; warning?: string | null } | null; performanceWarning?: string; verdict?: ChangeVerdict };
type HistoryResponse = { ok: boolean; error?: string; changes: LiveChange[]; snapshotCount: number; lastSnapshotAt: string | null };
type SnapshotResponse = { ok: boolean; error?: string; snapshotsSaved?: number; changesDetected?: number; snapshotRunId?: string };

function cdt(value?: string | null) { if (!value) return '—'; return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)); }
function label(level: string) { if (level === 'ad_set') return 'Ad set'; if (level === 'campaign') return 'Campaign'; return 'Ad'; }
function importanceStyle(value: string) { if (value === 'high') return { background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444' }; if (value === 'medium') return { background: '#ffedd5', color: '#9a3412', border: '1px solid #f97316' }; return { background: '#dcfce7', color: '#166534', border: '1px solid #22c55e' }; }
function verdictStyle(value?: string) { if (value === 'Helped') return { background: '#dcfce7', color: '#166534', border: '1px solid #22c55e' }; if (value === 'Hurt') return { background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444' }; if (value === 'Keep watching') return { background: '#ffedd5', color: '#9a3412', border: '1px solid #f97316' }; return { background: '#e2e8f0', color: '#334155', border: '1px solid #94a3b8' }; }
function unique(values: string[]) { return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b)); }

function VerdictCell({ row }: { row: LiveChange }) {
  const verdict = row.verdict || { verdict: 'Not enough data', reason: 'No verdict returned yet.' };
  return <div style={{ minWidth: 180 }}><span style={{ ...verdictStyle(verdict.verdict), borderRadius: 999, padding: '6px 10px', fontWeight: 900, display: 'inline-block' }}>{verdict.verdict}</span><p style={{ color: '#64748b', marginBottom: 0 }}>{verdict.reason}</p></div>;
}

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
  const [verdictFilter, setVerdictFilter] = useState('all');
  const [importanceFilter, setImportanceFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [highOnly, setHighOnly] = useState(false);

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

  function clearFilters() {
    setVerdictFilter('all');
    setImportanceFilter('all');
    setLevelFilter('all');
    setFieldFilter('all');
    setSearch('');
    setHighOnly(false);
  }

  useEffect(() => { loadHistory(); }, [accountId]);

  const changes = data?.changes || [];
  const fieldOptions = useMemo(() => unique(changes.map((row) => row.field_name)), [changes]);
  const filteredChanges = useMemo(() => {
    const term = search.trim().toLowerCase();
    return changes.filter((row) => {
      const verdict = row.verdict?.verdict || 'Not enough data';
      if (verdictFilter !== 'all' && verdict !== verdictFilter) return false;
      if (importanceFilter !== 'all' && row.change_importance !== importanceFilter) return false;
      if (highOnly && row.change_importance !== 'high') return false;
      if (levelFilter !== 'all' && row.entity_level !== levelFilter) return false;
      if (fieldFilter !== 'all' && row.field_name !== fieldFilter) return false;
      if (!term) return true;
      const haystack = [row.entity_name, row.entity_id, row.parent_campaign_name, row.parent_ad_set_name, row.field_name, row.old_value, row.new_value, verdict].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [changes, verdictFilter, importanceFilter, levelFilter, fieldFilter, search, highOnly]);

  const highCount = changes.filter((row) => row.change_importance === 'high').length;
  const helpedCount = changes.filter((row) => row.verdict?.verdict === 'Helped').length;
  const hurtCount = changes.filter((row) => row.verdict?.verdict === 'Hurt').length;
  const watchCount = changes.filter((row) => row.verdict?.verdict === 'Keep watching').length;
  const notEnoughCount = changes.filter((row) => !row.verdict || row.verdict.verdict === 'Not enough data').length;

  return (
    <>
      <section style={{ ...cardStyle, border: data?.ok ? '2px solid #0f766e' : '2px solid #f97316', background: data?.ok ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta change history — Phase 5</h2>
            <p style={{ color: data?.ok ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{data?.ok ? `Tracking live setup snapshots for ${selectedAccount.name}.` : data?.error || 'Change history is not ready yet.'}</p>
          </div>
          <button type="button" onClick={takeSnapshot} style={blueButtonStyle}>{saving ? 'Taking snapshot...' : 'Take Meta Snapshot Now'}</button>
        </div>
        {snapshotResult ? <p style={{ color: snapshotResult.ok ? '#0f766e' : '#9a3412', fontWeight: 800 }}>{snapshotResult.ok ? `Snapshot saved. ${snapshotResult.snapshotsSaved || 0} items checked. ${snapshotResult.changesDetected || 0} changes detected.` : snapshotResult.error}</p> : null}
      </section>

      <section style={{ ...cardStyle, border: '2px solid #2563eb', background: '#eff6ff' }}>
        <h2 style={{ marginTop: 0 }}>Change filters</h2>
        <p style={{ color: '#1d4ed8', fontWeight: 800, lineHeight: 1.6 }}>Filter by verdict, importance, level, field changed, or search campaign/ad set/ad names.</p>
        <div style={gridStyle}>
          <label style={labelStyle}>Search<input style={inputStyle} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search campaign, ad set, ad, field, from/to..." /></label>
          <label style={labelStyle}>Verdict<select style={inputStyle} value={verdictFilter} onChange={(event) => setVerdictFilter(event.target.value)}><option value="all">All verdicts</option><option value="Helped">Helped</option><option value="Hurt">Hurt</option><option value="Keep watching">Keep watching</option><option value="Not enough data">Not enough data</option></select></label>
          <label style={labelStyle}>Importance<select style={inputStyle} value={importanceFilter} onChange={(event) => setImportanceFilter(event.target.value)}><option value="all">All importance</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
          <label style={labelStyle}>Level<select style={inputStyle} value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}><option value="all">All levels</option><option value="campaign">Campaign</option><option value="ad_set">Ad set</option><option value="ad">Ad</option></select></label>
          <label style={labelStyle}>Field changed<select style={inputStyle} value={fieldFilter} onChange={(event) => setFieldFilter(event.target.value)}><option value="all">All fields</option>{fieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}</select></label>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800, color: '#334155' }}><input type="checkbox" checked={highOnly} onChange={(event) => setHighOnly(event.target.checked)} /> High-impact only</label>
          <button type="button" onClick={clearFilters} style={{ ...blueButtonStyle, background: '#334155' }}>Clear filters</button>
          <strong>{filteredChanges.length} of {changes.length} changes shown</strong>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Changes detected</div><strong style={{ fontSize: 28 }}>{changes.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Compared latest snapshot to prior snapshot.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Filtered shown</div><strong style={{ fontSize: 28 }}>{filteredChanges.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Current rows after filters.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Helped / Hurt</div><strong style={{ fontSize: 28 }}>{helpedCount} / {hurtCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Verdict based on before/after performance.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Keep watching</div><strong style={{ fontSize: 28 }}>{watchCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Not enough time or mixed signal.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Not enough data</div><strong style={{ fontSize: 28 }}>{notEnoughCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Meta did not return enough data.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>High impact</div><strong style={{ fontSize: 28 }}>{highCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Budgets, status, targeting, URLs, CTA, optimization.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Last snapshot</div><strong style={{ fontSize: 22 }}>{loading ? 'Loading...' : cdt(data?.lastSnapshotAt)}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Displayed in Central time.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Detected live Meta changes</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Detected CDT</th><th style={thTdStyle}>Verdict</th><th style={thTdStyle}>Importance</th><th style={thTdStyle}>Level</th><th style={thTdStyle}>Item</th><th style={thTdStyle}>Field changed</th><th style={thTdStyle}>From</th><th style={thTdStyle}>To</th><th style={thTdStyle}>Before / after performance</th></tr></thead>
          <tbody>
            {filteredChanges.map((row) => (
              <tr key={row.id}>
                <td style={thTdStyle}>{cdt(row.detected_at)}</td>
                <td style={thTdStyle}><VerdictCell row={row} /></td>
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
        {!loading && changes.length > 0 && filteredChanges.length === 0 ? <p style={{ color: '#64748b' }}>No changes match the current filters.</p> : null}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>How Phase 5 works</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>Use filters to quickly find high-impact changes, only helped or hurt verdicts, changes to a specific field, or a specific campaign/ad set/ad.</p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>Phase 6 can add saved notes and manual review decisions for each change.</p>
      </section>
    </>
  );
}
