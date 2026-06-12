'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';

type ChangeRow = {
  id: string;
  campaign_id: string;
  ad_group_id: string;
  ad_id: string;
  asset_type: string;
  asset_position: number;
  old_value: string;
  new_value: string;
  change_source: string;
  detected_at: string;
  review_after_date: string;
};

type ChangeResponse = {
  ok: boolean;
  source: string;
  changes: ChangeRow[];
  error?: string;
};

function getReviewStatus(row: ChangeRow) {
  if (!row.review_after_date) return 'Watching';
  const reviewDate = new Date(row.review_after_date).getTime();
  return Date.now() >= reviewDate ? 'Ready for review' : 'Watching';
}

export default function ChangeHistoryPanel() {
  const { accountId, selectedAccount } = useActiveAccount();
  const [data, setData] = useState<ChangeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadChanges() {
    setLoading(true);
    try {
      const response = await fetch(`/api/google-ads/changes?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' });
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadChanges(); }, [accountId]);

  const changes = data?.changes ?? [];
  const readyCount = changes.filter((row) => getReviewStatus(row) === 'Ready for review').length;
  const watchingCount = changes.length - readyCount;
  const headlineCount = changes.filter((row) => row.asset_type === 'headline').length;
  const descriptionCount = changes.filter((row) => row.asset_type === 'description').length;
  const urlCount = changes.filter((row) => row.asset_type === 'final_url').length;

  const cards = [
    { label: 'Active account', value: selectedAccount.name, note: 'Change history is scoped to the selected account.' },
    { label: 'Detected changes', value: String(changes.length), note: data?.ok ? 'Rows loaded from ad_change_log.' : data?.error || 'No data loaded yet.' },
    { label: 'Watching', value: String(watchingCount), note: 'Waiting for enough time or data before review.' },
    { label: 'Ready for review', value: String(readyCount), note: 'Review date has passed.' },
    { label: 'Headline changes', value: String(headlineCount), note: 'Headline asset changes detected.' },
    { label: 'Description / URL', value: `${descriptionCount} / ${urlCount}`, note: 'Description and final URL changes detected.' }
  ];

  return (
    <>
      <section style={{ ...cardStyle, border: '2px solid #0f766e', background: '#f0fdfa' }}>
        <h2 style={{ marginTop: 0 }}>Change history</h2>
        <p style={{ color: '#115e59', fontWeight: 800, lineHeight: 1.6 }}>
          This page shows detected changes from saved snapshots. Today these are mock snapshot changes. Later this same page will show live Google Ads changes after real snapshots are saved.
        </p>
      </section>

      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 24 }}>{loading ? 'Loading...' : card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Detected changes</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Detected</th>
              <th style={thTdStyle}>Status</th>
              <th style={thTdStyle}>Ad ID</th>
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
                <td style={thTdStyle}>{row.asset_type} {row.asset_position}</td>
                <td style={thTdStyle}>{row.old_value || '—'}</td>
                <td style={thTdStyle}>{row.new_value || '—'}</td>
                <td style={thTdStyle}>{row.review_after_date ? new Date(row.review_after_date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && changes.length === 0 ? <p style={{ color: '#64748b' }}>No detected changes yet. Use Snapshot Preview to save a normal snapshot, save a changed snapshot, then detect changes.</p> : null}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>How this will work with live Google Ads</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          When live snapshots are connected, DynLander will show the same change list here. The difference is that the old and new values will come from real Google Ads snapshots instead of mock test rows.
        </p>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
          This page is where future performance review will connect each change to cost, clicks, leads, and cost per lead before recommending keep, test longer, or roll back.
        </p>
      </section>
    </>
  );
}
