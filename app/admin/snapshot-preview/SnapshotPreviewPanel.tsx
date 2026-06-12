'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

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

export default function SnapshotPreviewPanel() {
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPreview() {
    setLoading(true);
    try {
      const response = await fetch('/api/google-ads/snapshot-preview', { cache: 'no-store' });
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPreview(); }, []);

  const cards = [
    { label: 'Preview mode', value: data?.mode || 'checking', note: data?.readOnly ? 'Read-only. No Google Ads changes.' : 'Checking mode.' },
    { label: 'Campaigns found', value: String(data?.counts.campaigns ?? 0), note: 'Would be reviewed before saving.' },
    { label: 'Ad groups found', value: String(data?.counts.adGroups ?? 0), note: 'Would map to seller intent themes.' },
    { label: 'Ads found', value: String(data?.counts.ads ?? 0), note: 'Responsive search ads to snapshot.' },
    { label: 'Assets found', value: String(data?.counts.assets ?? 0), note: 'Headlines, descriptions, extensions, and keywords.' },
    { label: 'Save status', value: data?.saveEnabled ? 'Enabled' : 'Disabled', note: data?.saveReason || 'Preview is loading.' }
  ];

  return (
    <>
      <section style={{ ...cardStyle, border: '2px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Preview before save</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          Phase 6.2 does not save live Google Ads data. It only shows what would be pulled and where it would be saved later.
        </p>
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
        <h2 style={{ marginTop: 0 }}>Database writes that would happen later</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Table</th><th style={thTdStyle}>Future action</th></tr></thead>
          <tbody>{(data?.preview.databaseWrites ?? []).map((row) => <tr key={row.table}><td style={thTdStyle}>{row.table}</td><td style={thTdStyle}>{row.action}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
