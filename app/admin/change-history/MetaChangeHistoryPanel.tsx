'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useMetaDataMode } from '../_components/useMetaDataMode';

type MetaChangeRow = {
  id: string;
  campaign_id: string;
  ad_set_id: string;
  ad_id: string;
  asset_type: string;
  asset_position: number;
  old_value: string;
  new_value: string;
  change_source: string;
  detected_at: string;
  review_after_date: string;
};

type MetaChangeResponse = {
  ok: boolean;
  source: string;
  changes: MetaChangeRow[];
  error?: string;
};

type LivePreview = {
  ok: boolean;
  source: string;
  summary: null | {
    spend: string;
    impressions: string;
    clicks: string;
    ctr: string;
    cpc: string;
    cpm: string;
    campaignCount: number;
    adSetCount: number;
    adCount: number;
  };
  error?: string;
};

function getReviewStatus(row: MetaChangeRow) {
  if (!row.review_after_date) return 'Watching';
  const reviewDate = new Date(row.review_after_date).getTime();
  return Date.now() >= reviewDate ? 'Ready for review' : 'Watching';
}

export default function MetaChangeHistoryPanel() {
  const { accountId, selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [data, setData] = useState<MetaChangeResponse | null>(null);
  const [livePreview, setLivePreview] = useState<LivePreview | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadChanges() {
    setLoading(true);
    try {
      const [changesResponse, liveResponse] = await Promise.all([
        fetch(`/api/meta-ads/changes?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' }),
        isDemoMode ? Promise.resolve(null) : fetch('/api/meta-ads/read-only-preview', { cache: 'no-store' })
      ]);
      setData(await changesResponse.json());
      if (liveResponse) {
        setLivePreview(await liveResponse.json());
      } else {
        setLivePreview(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadChanges(); }, [accountId, isDemoMode]);

  const changes = data?.changes ?? [];
  const liveReady = Boolean(!isDemoMode && livePreview?.ok && livePreview.summary);
  const readyCount = changes.filter((row) => getReviewStatus(row) === 'Ready for review').length;
  const watchingCount = changes.length - readyCount;
  const primaryTextCount = changes.filter((row) => row.asset_type === 'primary_text').length;
  const headlineCount = changes.filter((row) => row.asset_type === 'headline').length;
  const urlCount = changes.filter((row) => row.asset_type === 'destination_url').length;
  const fatigueCount = changes.filter((row) => row.asset_type === 'fatigue_status' || row.asset_type === 'frequency').length;

  const cards = [
    { label: 'Data mode', value: liveReady ? 'Live read-only' : isDemoMode ? 'Demo / mock' : 'Live fallback', note: liveReady ? 'Live Meta data can be previewed.' : 'Internal/mock change history is shown.' },
    { label: 'Active account', value: selectedAccount.name, note: 'Change history is scoped to the selected account.' },
    { label: 'Live preview', value: liveReady ? 'Available' : isDemoMode ? 'Demo mode' : 'Not readable', note: liveReady ? `${livePreview?.summary?.campaignCount ?? 0} campaigns · ${livePreview?.summary?.adCount ?? 0} ads` : livePreview?.error || 'Live Meta preview is not being used here.' },
    { label: 'Internal detected changes', value: String(changes.length), note: data?.ok ? 'Rows loaded from meta_change_log.' : data?.error || 'No data loaded yet.' },
    { label: 'Watching', value: String(watchingCount), note: 'Waiting for enough time or data before review.' },
    { label: 'Ready for review', value: String(readyCount), note: 'Review date has passed.' },
    { label: 'Primary text / headline', value: `${primaryTextCount} / ${headlineCount}`, note: 'Internal Meta creative copy changes detected.' },
    { label: 'URL changes', value: String(urlCount), note: 'Internal destination URL changes detected.' },
    { label: 'Fatigue signals', value: String(fatigueCount), note: 'Internal frequency or fatigue status changes detected.' }
  ];

  return (
    <>
      <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta change history</h2>
        <p style={{ color: liveReady ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          {liveReady ? 'Live Meta read-only preview is available, but this change history table still shows internal DynLander change rows only.' : 'This page is showing internal/mock Meta change history. It does not change Facebook / Meta ads.'}
        </p>
        <p style={{ color: '#475569', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
          Live Meta preview status is separate from internal detected changes.
        </p>
      </section>

      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 24 }}>{loading ? 'Loading...' : card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

      {liveReady ? <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live Meta preview status</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
          <tbody><tr><td style={thTdStyle}>{livePreview?.summary?.spend || '—'}</td><td style={thTdStyle}>{livePreview?.summary?.impressions || '—'}</td><td style={thTdStyle}>{livePreview?.summary?.clicks || '—'}</td><td style={thTdStyle}>{livePreview?.summary?.ctr || '—'}</td><td style={thTdStyle}>{livePreview?.summary?.cpc || '—'}</td><td style={thTdStyle}>{livePreview?.summary?.cpm || '—'}</td></tr></tbody>
        </table>
        <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>This is read-only preview context. It is not a saved live change history.</p>
      </section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Internal detected Meta changes</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Detected</th>
              <th style={thTdStyle}>Status</th>
              <th style={thTdStyle}>Ad ID</th>
              <th style={thTdStyle}>Ad set ID</th>
              <th style={thTdStyle}>Asset</th>
              <th style={thTdStyle}>Old value</th>
              <th style={thTdStyle}>New value</th>
              <th style={thTdStyle}>Review after</th>
            </tr>
          </thead>
          <tbody>
            {changes.map((row) => (
              <tr key={row.id}>
                <td style={thTdStyle}>{new Date(row.detected_at).toLocaleString()}</td>
                <td style={thTdStyle}>{getReviewStatus(row)}</td>
                <td style={thTdStyle}>{row.ad_id}</td>
                <td style={thTdStyle}>{row.ad_set_id}</td>
                <td style={thTdStyle}>{row.asset_type} {row.asset_position}</td>
                <td style={thTdStyle}>{row.old_value || '—'}</td>
                <td style={thTdStyle}>{row.new_value || '—'}</td>
                <td style={thTdStyle}>{row.review_after_date ? new Date(row.review_after_date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && changes.length === 0 ? <p style={{ color: '#64748b' }}>No internal Meta changes yet. Use Snapshot Preview to save an internal snapshot, save a changed internal snapshot, then detect internal changes.</p> : null}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>What this page does and does not do</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          This page can show live Meta read-only preview status when live mode is selected. The detected changes table still comes from DynLander internal snapshot/change tables.
        </p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
          It does not edit ads, pause ads, change budgets, publish campaigns, or save live Meta changes back into Meta.
        </p>
      </section>
    </>
  );
}
