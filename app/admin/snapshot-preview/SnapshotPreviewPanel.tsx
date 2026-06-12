'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';

type PreviewResponse = {
  ok: boolean;
  mode: string;
  configured: boolean;
  readOnly: boolean;
  saveEnabled: boolean;
  saveReason: string;
  counts: { campaigns: number; adGroups: number; ads: number; assets: number };
  preview: {
    campaigns: Array<{ id: string; name: string; status: string; budget: string }>;
    adGroups: Array<{ id: string; campaignId: string; name: string; theme: string }>;
    ads: Array<{ id: string; adGroupId: string; type: string; headlines: number; descriptions: number; finalUrl: string }>;
    assets: Array<{ type: string; count: number }>;
    databaseWrites: Array<{ table: string; action: string }>;
  };
  checkedAt: string;
};

type SnapshotRow = { id: string; campaign_name: string; ad_group_name: string; ad_id: string; ad_status: string; final_url: string; snapshot_hash: string; snapshot_at: string };
type ChangeRow = { id: string; campaign_id: string; ad_group_id: string; ad_id: string; asset_type: string; asset_position: number; old_value: string; new_value: string; change_source: string; detected_at: string; review_after_date: string };
type SnapshotHistory = { ok: boolean; source: string; snapshots: SnapshotRow[]; error?: string };
type ChangeHistory = { ok: boolean; source: string; changes: ChangeRow[]; error?: string };

export default function SnapshotPreviewPanel() {
  const { accountId, selectedAccount } = useActiveAccount();
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [history, setHistory] = useState<SnapshotHistory | null>(null);
  const [changes, setChanges] = useState<ChangeHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadPreview() {
    setLoading(true);
    try {
      const [previewResponse, historyResponse, changesResponse] = await Promise.all([
        fetch('/api/google-ads/snapshot-preview', { cache: 'no-store' }),
        fetch(`/api/google-ads/snapshots?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' }),
        fetch(`/api/google-ads/changes?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' })
      ]);
      setData(await previewResponse.json());
      setHistory(await historyResponse.json());
      setChanges(await changesResponse.json());
    } finally {
      setLoading(false);
    }
  }

  async function saveMockSnapshot(variant: 'base' | 'changed') {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/google-ads/snapshot-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId, variant })
      });
      const result = await response.json();
      if (result.ok) {
        setMessage(`Saved ${result.saved} ${variant} mock snapshot rows for ${selectedAccount.name}.`);
        await loadPreview();
      } else {
        setMessage(`Snapshot was not saved: ${result.error || 'database unavailable'}`);
      }
    } catch {
      setMessage('Snapshot save failed. Check the database connection.');
    } finally {
      setSaving(false);
    }
  }

  async function detectChanges() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/google-ads/change-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId })
      });
      const result = await response.json();
      if (result.ok) {
        setMessage(`Detected ${result.detected} changes and inserted ${result.inserted} change log rows.`);
        await loadPreview();
      } else {
        setMessage(`Change detection failed: ${result.error || 'database unavailable'}`);
      }
    } catch {
      setMessage('Change detection failed. Check the database connection.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { loadPreview(); }, [accountId]);

  const cards = [
    { label: 'Preview mode', value: data?.mode || 'checking', note: data?.readOnly ? 'Read-only. No Google Ads changes.' : 'Checking mode.' },
    { label: 'Campaigns found', value: String(data?.counts.campaigns ?? 0), note: 'Would be reviewed before saving.' },
    { label: 'Ad groups found', value: String(data?.counts.adGroups ?? 0), note: 'Would map to seller intent themes.' },
    { label: 'Ads found', value: String(data?.counts.ads ?? 0), note: 'Responsive search ads to snapshot.' },
    { label: 'Saved rows', value: String(history?.snapshots.length ?? 0), note: history?.ok ? 'Saved snapshot rows found.' : 'No saved rows or database unavailable.' },
    { label: 'Detected changes', value: String(changes?.changes.length ?? 0), note: changes?.ok ? 'Change log rows found.' : 'No changes or database unavailable.' }
  ];

  return (
    <>
      <section style={{ ...cardStyle, border: '2px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Preview, save, and detect changes</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          Phase 7.1 still does not pull live Google Ads data. Use the buttons below to save a normal mock snapshot, save a changed mock snapshot, then detect what changed between the newest two snapshots.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => saveMockSnapshot('base')} disabled={saving} style={blueButtonStyle}>{saving ? 'Working...' : `Save Normal Mock Snapshot`}</button>
          <button type="button" onClick={() => saveMockSnapshot('changed')} disabled={saving} style={{ ...blueButtonStyle, background: '#334155' }}>{saving ? 'Working...' : `Save Changed Mock Snapshot`}</button>
          <button type="button" onClick={detectChanges} disabled={saving} style={{ ...blueButtonStyle, background: '#0f766e' }}>{saving ? 'Working...' : 'Detect Changes'}</button>
        </div>
        {message ? <p style={{ color: message.startsWith('Saved') || message.startsWith('Detected') ? '#166534' : '#9a3412', fontWeight: 800 }}>{message}</p> : null}
      </section>

      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 26 }}>{loading ? 'Checking...' : card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Detected change log</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Detected</th><th style={thTdStyle}>Ad ID</th><th style={thTdStyle}>Asset</th><th style={thTdStyle}>Old value</th><th style={thTdStyle}>New value</th></tr></thead>
          <tbody>{(changes?.changes ?? []).map((row) => <tr key={row.id}><td style={thTdStyle}>{new Date(row.detected_at).toLocaleString()}</td><td style={thTdStyle}>{row.ad_id}</td><td style={thTdStyle}>{row.asset_type} {row.asset_position}</td><td style={thTdStyle}>{row.old_value}</td><td style={thTdStyle}>{row.new_value}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Saved snapshot history</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Saved at</th><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Ad group</th><th style={thTdStyle}>Ad ID</th><th style={thTdStyle}>Final URL</th></tr></thead>
          <tbody>{(history?.snapshots ?? []).map((row) => <tr key={row.id}><td style={thTdStyle}>{new Date(row.snapshot_at).toLocaleString()}</td><td style={thTdStyle}>{row.campaign_name}</td><td style={thTdStyle}>{row.ad_group_name}</td><td style={thTdStyle}>{row.ad_id}</td><td style={thTdStyle}>{row.final_url}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Ads that would be snapshotted</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad ID</th><th style={thTdStyle}>Type</th><th style={thTdStyle}>Headlines</th><th style={thTdStyle}>Descriptions</th><th style={thTdStyle}>Final URL</th></tr></thead>
          <tbody>{(data?.preview.ads ?? []).map((row) => <tr key={row.id}><td style={thTdStyle}>{row.id}</td><td style={thTdStyle}>{row.type}</td><td style={thTdStyle}>{row.headlines}</td><td style={thTdStyle}>{row.descriptions}</td><td style={thTdStyle}>{row.finalUrl}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
