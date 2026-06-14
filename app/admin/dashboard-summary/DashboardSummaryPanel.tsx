'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';

type RangeKey = 'today' | 'yesterday' | 'last_7d' | 'this_month' | 'last_month' | 'custom';
type Summary = { spend: string; impressions: string; clicks: string; ctr: string; cpc: string; cpm: string };
type Row = Summary & { id: string; name: string };
type ApiData = { ok: boolean; source: string; error?: string; range?: { since: string; until: string; label: string }; summary: Summary | null; campaigns: Row[]; adSets: Row[]; ads: Row[]; checkedAt?: string; warnings?: Record<string, string | null> };

function DataTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <table style={tableStyle}>
        <thead><tr><th style={thTdStyle}>Name</th><th style={thTdStyle}>ID</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={`${title}-${row.id}`}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.id}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
      </table>
      {rows.length === 0 ? <p style={{ color: '#64748b' }}>No rows returned for the selected date range.</p> : null}
    </section>
  );
}

export default function DashboardSummaryPanel() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const [range, setRange] = useState<RangeKey>('last_7d');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    const params = new URLSearchParams({ accountKey: selectedAccount.customerId, range });
    if (range === 'custom') {
      if (start) params.set('start', start);
      if (end) params.set('end', end);
    }
    try {
      const response = await fetch(`/api/meta-ads/dashboard-summary?${params.toString()}`, { cache: 'no-store' });
      setData(await response.json());
    } catch {
      setData({ ok: false, source: 'request_failed', error: 'Dashboard summary request failed.', summary: null, campaigns: [], adSets: [], ads: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (platform === 'meta_ads') loadData(); }, [platform, selectedAccount.customerId, range]);

  if (platform !== 'meta_ads') {
    return <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Dashboard Summary</h2><p style={{ color: '#64748b' }}>Select Facebook / Meta Ads from the left sidebar to view the Meta Dashboard Summary.</p></section>;
  }

  const summary = data?.summary;
  const lastRefresh = data?.checkedAt ? Math.max(0, Math.round((Date.now() - new Date(data.checkedAt).getTime()) / 60000)) : null;

  return (
    <>
      <section style={{ ...cardStyle, border: data?.ok ? '2px solid #0f766e' : '2px solid #f97316', background: data?.ok ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Connection and refresh status</h2>
            <p style={{ color: data?.ok ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
              {data?.ok ? `Connected to ${selectedAccount.name}. Last refresh was ${lastRefresh ?? 0} min ago.` : data?.error || `Not connected for ${selectedAccount.name}.`}
            </p>
          </div>
          <button type="button" onClick={loadData} style={blueButtonStyle}>{loading ? 'Refreshing...' : 'Refresh summary'}</button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Summary information</h2>
        <div style={twoColumnStyle}>
          <label style={labelStyle}>Date range<select style={inputStyle} value={range} onChange={(event) => setRange(event.target.value as RangeKey)}><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="last_7d">Last 7 days</option><option value="this_month">This month</option><option value="last_month">Last month</option><option value="custom">Custom date</option></select></label>
          {range === 'custom' ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><label style={labelStyle}>Start<input style={inputStyle} type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label><label style={labelStyle}>End<input style={inputStyle} type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label></div> : <div><strong>{data?.range?.label || 'Last 7 days'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{data?.range ? `${data.range.since} to ${data.range.until}` : 'Waiting for data.'}</p></div>}
        </div>
        {range === 'custom' ? <button type="button" onClick={loadData} style={{ ...blueButtonStyle, marginTop: 12 }}>Apply custom date</button> : null}
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 34 }}>{summary?.spend || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Impressions</div><strong style={{ fontSize: 34 }}>{summary?.impressions || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Clicks</div><strong style={{ fontSize: 34 }}>{summary?.clicks || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 34 }}>{summary?.ctr || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CPC / CPM</div><strong style={{ fontSize: 34 }}>{summary ? `${summary.cpc} / ${summary.cpm}` : '—'}</strong></div>
      </div>

      <DataTable title="Campaign summary" rows={data?.campaigns || []} />
      <DataTable title="Ad set summary" rows={data?.adSets || []} />
      <DataTable title="Ad summary" rows={data?.ads || []} />
    </>
  );
}
