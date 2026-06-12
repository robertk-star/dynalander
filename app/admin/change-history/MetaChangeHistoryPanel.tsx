'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';

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

function getReviewStatus(row: MetaChangeRow) {
  if (!row.review_after_date) return 'Watching';
  const reviewDate = new Date(row.review_after_date).getTime();
  return Date.now() >= reviewDate ? 'Ready for review' : 'Watching';
}

export default function MetaChangeHistoryPanel() {
  const { accountId, selectedAccount } = useActiveAccount();
  const [data, setData] = useState<MetaChangeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadChanges() {
    setLoading(true);
    try {
      const response = await fetch(`/api/meta-ads/changes?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' });
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadChanges(); }, [accountId]);

  const changes = data?.changes ?? [];
  const readyCount = changes.filter((row) => getReviewStatus(row) === 'Ready for review').length;
  const watchingCount = changes.length - readyCount;
  const primaryTextCount = changes.filter((row) => row.asset_type === 'primary_text').length;
  const headlineCount = changes.filter((row) => row.asset_type === 'headline').length;
  const urlCount = changes.filter((row) => row.asset_type === 'destination_url').length;
  const fatigueCount = changes.filter((row) => row.asset_type === 'fatigue_status' || row.asset_type === 'frequency').length;

  const cards = [
    { label: 'Platform', value: 'Facebook / Meta Ads', note: 'Showing Meta mock change history.' },
    { label: 'Active account', value: selectedAccount.name, note: 'Change history is scoped to the selected account.' },
    { label: 'Detected changes', value: String(changes.length), note: data?.ok ? 'Rows loaded from meta_change_log.' : data?.error || 'No data loaded yet.' },
    { label: 'Watching', value: String(watchingCount), note: 'Waiting for enough time or data before review.' },
    { label: 'Ready for review', value: String(readyCount), note: 'Review date has passed.' },
    { label: 'Primary text / headline', value: `${primaryTextCount} / ${headlineCount}`, note: 'Meta creative copy changes detected.' },
    { label: 'URL changes', value: String(urlCount), note: 'Destination URL changes detected.' },
    { label: 'Fatigue signals', value: String(fatigueCount), note: 'Frequency or fatigue status changes detected.' }
  ];

  return (
    <>
      <section style={{ ...cardStyle, border: '2px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta change history</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          This page shows detected changes from saved Meta mock snapshots. It does not pull live Meta data or change Facebook / Meta ads.
        </p>
      </section>

      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 24 }}>{loading ? 'Loading...' : card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Detected Meta changes</h2>
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
        {!loading && changes.length === 0 ? <p style={{ color: '#64748b' }}>No Meta changes yet. Use Snapshot Preview to save a Meta mock snapshot, save a changed Meta mock snapshot, then detect Meta changes.</p> : null}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>How this will work with live Meta Ads</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          When live Meta snapshots are connected, DynLander will show creative, copy, CTA, destination URL, frequency, and fatigue changes here.
        </p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
          This will help decide whether a Meta ad change should be kept, watched longer, refreshed, or rolled back.
        </p>
      </section>
    </>
  );
}
