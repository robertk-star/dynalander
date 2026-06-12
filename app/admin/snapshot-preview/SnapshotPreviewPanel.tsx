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

type SnapshotHistory = { ok: boolean; source: string; snapshots: SnapshotRow[]; error?: string };

export default function SnapshotPreviewPanel() {
  const { accountId, selectedAccount } = useActiveAccount();
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [history, setHistory] = useState<SnapshotHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  async function loadPreview() {
    setLoading(true);
    try {
      const [previewResponse, historyResponse] = await Promise.all([
        fetch('/api/google-ads/snapshot-preview', { cache: 'no-store' }),
        fetch(`/api/google-ads/snapshots?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' })
      ]);
      setData(await previewResponse.json());
      setHistory(await historyResponse.json());
    } finally {
      setLoading(false);
    }
  }

  async function saveMockSnapshot() {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/google-ads/snapshot-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId })
      });
      const result = await response.json();
      if (result.ok) {
        setMessage(`Saved ${result.saved} mock snapshot rows for ${selectedAccount.name}.`);
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

  useEffect(() => { loadPreview(); }, [accountId]);

  const cards = [
    { label: 'Preview mode', value: data?.mode || 'checking', note: data?.readOnly ? 'Read-only. No Google Ads changes.' : 'Checking mode.' },
    { label: 'Campaigns found', value: String(data?.counts.campaigns ?? 0), note: 'Would be reviewed before saving.' },
    { label: 'Ad groups found', value: String(data?.counts.adGroups ?? 0), note: 'Would map to seller intent themes.' },
    { label: 'Ads found', value: String(data?.counts.ads ?? 0), note: 'Responsive search ads to snapshot.' },
    { label: 'Assets found', value: String(data?.counts.assets ?? 0), note: 'Headlines, descriptions, extensions, and keywords.' },
    { label: 'Saved rows', value: String(history?.snapshots.length ?? 0), note: history?.ok ? 'Saved snapshot rows found.' : 'No saved rows or database unavailable.' }
  ];

  return (
    <>
      <section style={{ ...cardStyle, border: '2px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Preview before save</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          Phase 6.3 still does not pull live Google Ads data. It can save mock preview rows to Supabase so the snapshot pipeline can be tested before a real account is connected.
        </p>
        <button type="button" onClick={saveMockSnapshot} disabled={saving} style={blueButtonStyle}>{saving ? 'Saving...' : `Save Mock Snapshot for ${selectedAccount.name}`}</button>
        {message ? <p style={{ color: message.startsWith('Saved') ? '#166534' : '#9a3412', fontWeight: 800 }}>{message}</p> : null}
      </section>

      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 26 }}>{loading ? 'Checking...' : card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Campaigns that would be pulled</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Budget</th></tr></thead>
          <tbody>{(data?.preview.campaigns ?? []).map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>{row.budget}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Ads that would be snapshotted</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad ID</th><th style={thTdStyle}>Type</th><th style={thTdStyle}>Headlines</th><th style={thTdStyle}>Descriptions</th><th style={thTdStyle}>Final URL</th></tr></thead>
          <tbody>{(data?.preview.ads ?? []).map((row) => <tr key={row.id}><td style={thTdStyle}>{row.id}</td><td style={thTdStyle}>{row.type}</td><td style={thTdStyle}>{row.headlines}</td><td style={thTdStyle}>{row.descriptions}</td><td style={thTdStyle}>{row.finalUrl}</td></tr>)}</tbody>
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
        <h2 style={{ marginTop: 0 }}>Database writes that would happen later</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Table</th><th style={thTdStyle}>Future action</th></tr></thead>
          <tbody>{(data?.preview.databaseWrites ?? []).map((row) => <tr key={row.table}><td style={thTdStyle}>{row.table}</td><td style={thTdStyle}>{row.action}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
