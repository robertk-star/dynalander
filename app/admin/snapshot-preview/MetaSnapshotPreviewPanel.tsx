'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useMetaDataMode } from '../_components/useMetaDataMode';
import { metaAdSets, metaCampaigns, metaCreatives } from '../_data/metaMockData';

type MetaSnapshotRow = { id: string; campaign_name: string; ad_set_name: string; ad_id: string; ad_name: string; creative_type: string; destination_url: string; snapshot_hash: string; snapshot_at: string };
type MetaChangeRow = { id: string; campaign_id: string; ad_set_id: string; ad_id: string; asset_type: string; asset_position: number; old_value: string; new_value: string; change_source: string; detected_at: string; review_after_date: string };
type MetaSnapshotHistory = { ok: boolean; source: string; snapshots: MetaSnapshotRow[]; error?: string };
type MetaChangeHistory = { ok: boolean; source: string; changes: MetaChangeRow[]; error?: string };
type LivePreview = { ok: boolean; source: string; summary: null | { spend: string; impressions: string; clicks: string; ctr: string; cpc: string; cpm: string; campaignCount: number; adSetCount: number; adCount: number }; campaigns: any[]; adSets: any[]; ads: any[]; insights: any[]; checkedAt?: string };

export default function MetaSnapshotPreviewPanel() {
  const { accountId, selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [history, setHistory] = useState<MetaSnapshotHistory | null>(null);
  const [changes, setChanges] = useState<MetaChangeHistory | null>(null);
  const [livePreview, setLivePreview] = useState<LivePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadMetaHistory() {
    setLoading(true);
    try {
      const [historyResponse, changesResponse, liveResponse] = await Promise.all([
        fetch(`/api/meta-ads/snapshots?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' }),
        fetch(`/api/meta-ads/changes?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' }),
        isDemoMode ? Promise.resolve(null) : fetch(`/api/meta-ads/read-only-preview?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' })
      ]);
      setHistory(await historyResponse.json());
      setChanges(await changesResponse.json());
      if (liveResponse) {
        setLivePreview(await liveResponse.json());
      } else {
        setLivePreview(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveMetaMockSnapshot(variant: 'base' | 'changed') {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/meta-ads/snapshot-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId, variant })
      });
      const result = await response.json();
      if (result.ok) {
        setMessage(`Saved ${result.saved} ${variant} internal Meta snapshot rows for ${selectedAccount.name}.`);
        await loadMetaHistory();
      } else {
        setMessage(`Internal Meta snapshot was not saved: ${result.error || 'database unavailable'}`);
      }
    } catch {
      setMessage('Internal Meta snapshot save failed. Check the database connection.');
    } finally {
      setSaving(false);
    }
  }

  async function detectMetaChanges() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/meta-ads/change-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId })
      });
      const result = await response.json();
      if (result.ok) {
        setMessage(`Detected ${result.detected} internal Meta changes and inserted ${result.inserted} change log rows.`);
        await loadMetaHistory();
      } else {
        setMessage(`Internal Meta change detection failed: ${result.error || 'database unavailable'}`);
      }
    } catch {
      setMessage('Internal Meta change detection failed. Check the database connection.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { loadMetaHistory(); }, [accountId, selectedAccount.customerId, isDemoMode]);

  const isLive = Boolean(!isDemoMode && livePreview?.ok && livePreview.summary);
  const cards = [
    { label: 'Active account', value: selectedAccount.name, note: selectedAccount.customerId },
    { label: 'Preview mode', value: isLive ? 'Meta live read-only' : isDemoMode ? 'Meta demo / mock' : 'Meta unavailable for active account', note: isLive ? 'Live Meta data is previewed only.' : 'No live Meta data is pulled.' },
    { label: 'Internal snapshot only', value: 'Yes', note: 'Snapshot buttons create DynLander internal rows only.' },
    { label: 'Campaigns', value: String(isLive ? livePreview?.summary?.campaignCount ?? 0 : metaCampaigns.length), note: 'Campaigns that would be reviewed.' },
    { label: 'Ad sets', value: String(isLive ? livePreview?.summary?.adSetCount ?? 0 : metaAdSets.length), note: 'Ad sets that include targeting and placement summary.' },
    { label: 'Ads / creatives', value: String(isLive ? livePreview?.summary?.adCount ?? 0 : metaCreatives.length), note: 'Creative copy and destination data to snapshot.' },
    { label: 'Spend', value: isLive ? livePreview?.summary?.spend || '$0.00' : 'Demo only', note: 'Last 7 days when live.' },
    { label: 'Saved rows', value: String(history?.snapshots.length ?? 0), note: history?.ok ? 'Saved internal Meta snapshot rows found.' : 'No saved rows or database unavailable.' },
    { label: 'Detected changes', value: String(changes?.changes.length ?? 0), note: changes?.ok ? 'Internal Meta change log rows found.' : 'No changes or database unavailable.' }
  ];

  return (
    <>
      <section style={{ ...cardStyle, border: isLive ? '2px solid #0f766e' : '2px solid #f97316', background: isLive ? '#f0fdfa' : '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta read-only preview and internal snapshot lock</h2>
        <p style={{ color: isLive ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          {isLive ? `This page previews live Meta data for ${selectedAccount.name}. The snapshot buttons below create DynLander internal rows only.` : 'This Meta flow is not using live data for the active account.'}
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={loadMetaHistory} disabled={loading || saving} style={blueButtonStyle}>{loading ? 'Checking...' : 'Refresh Active Account Preview'}</button>
          <button type="button" onClick={() => saveMetaMockSnapshot('base')} disabled={saving} style={{ ...blueButtonStyle, background: '#334155' }}>{saving ? 'Working...' : 'Save Internal Snapshot Only'}</button>
          <button type="button" onClick={() => saveMetaMockSnapshot('changed')} disabled={saving} style={{ ...blueButtonStyle, background: '#334155' }}>{saving ? 'Working...' : 'Save Changed Internal Snapshot Only'}</button>
          <button type="button" onClick={detectMetaChanges} disabled={saving} style={{ ...blueButtonStyle, background: '#0f766e' }}>{saving ? 'Working...' : 'Detect Internal Changes'}</button>
        </div>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>Read-only preview · Internal snapshot rows only · No Meta account changes</p>
        {message ? <p style={{ color: message.startsWith('Saved') || message.startsWith('Detected') ? '#166534' : '#9a3412', fontWeight: 800 }}>{message}</p> : null}
      </section>

      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 26 }}>{loading ? 'Checking...' : card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

      {isLive ? <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live active-account campaigns that would be snapshotted</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Objective</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>ID</th></tr></thead>
          <tbody>{(livePreview?.campaigns ?? []).map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.objective || '—'}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.id}</td></tr>)}</tbody>
        </table>
      </section> : null}

      {isLive ? <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live active-account ads that would be snapshotted</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>Campaign ID</th><th style={thTdStyle}>Ad set ID</th></tr></thead>
          <tbody>{(livePreview?.ads ?? []).map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.campaign_id || '—'}</td><td style={thTdStyle}>{row.adset_id || '—'}</td></tr>)}</tbody>
        </table>
      </section> : null}
    </>
  );
}
