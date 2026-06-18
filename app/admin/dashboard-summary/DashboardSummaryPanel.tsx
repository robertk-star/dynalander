'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import PlatformDetailsSection from './PlatformDetailsSection';

type RangeKey = 'today' | 'yesterday' | 'last_7d' | 'this_month' | 'last_month' | 'custom';
type Summary = { spend: string; results: string; impressions: string; clicks: string; ctr: string; cpc: string; cpm: string };
type Row = Summary & { id: string; name: string; campaignId?: string; campaignName?: string; adSetId?: string; adSetName?: string };
type DeviceSummary = Summary & { device: string };
type DeviceRow = Summary & { id: string; device: string; rawDevice: string; adId: string; adName: string; adSetName: string; campaignName: string };
type PlatformSummary = Summary & { platform: string; costPerResult: string };
type PlatformRow = PlatformSummary & { id: string; rawPlatform: string; adName: string; adSetName: string; campaignName: string };
type ApiData = { ok: boolean; source: string; error?: string; range?: { since: string; until: string; label: string; timeZone?: string }; summary: Summary | null; campaigns: Row[]; adSets: Row[]; ads: Row[]; adDeviceSummary?: DeviceSummary[]; adDeviceRows?: DeviceRow[]; platformSummary?: PlatformSummary[]; platformRows?: PlatformRow[]; checkedAt?: string; warnings?: Record<string, string | null> };

type SavedDateDefault = { range: RangeKey; start: string; end: string };
const DATE_DEFAULT_STORAGE_KEY = 'dynalander.dashboardSummary.defaultDateRange';

function CampaignTable({ rows }: { rows: Row[] }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Campaign summary</h2>
      <table style={tableStyle}>
        <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Campaign ID</th><th style={thTdStyle}>Results</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={`campaign-${row.id}`}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.id}</td><td style={thTdStyle}>{row.results}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
      </table>
      {rows.length === 0 ? <p style={{ color: '#64748b' }}>No campaign rows returned for the selected date range.</p> : null}
    </section>
  );
}

function AdSetTable({ rows }: { rows: Row[] }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Ad set summary</h2>
      <table style={tableStyle}>
        <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Ad set ID</th><th style={thTdStyle}>Results</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={`adset-${row.id}`}><td style={thTdStyle}>{row.campaignName || '—'}</td><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.id}</td><td style={thTdStyle}>{row.results}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
      </table>
      {rows.length === 0 ? <p style={{ color: '#64748b' }}>No ad set rows returned for the selected date range.</p> : null}
    </section>
  );
}

function AdTable({ rows }: { rows: Row[] }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Ad summary</h2>
      <table style={tableStyle}>
        <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Ad ID</th><th style={thTdStyle}>Results</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={`ad-${row.id}`}><td style={thTdStyle}>{row.campaignName || '—'}</td><td style={thTdStyle}>{row.adSetName || '—'}</td><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.id}</td><td style={thTdStyle}>{row.results}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
      </table>
      {rows.length === 0 ? <p style={{ color: '#64748b' }}>No ad rows returned for the selected date range.</p> : null}
    </section>
  );
}

function AdDeviceSummary({ summaryRows, detailRows, warning }: { summaryRows: DeviceSummary[]; detailRows: DeviceRow[]; warning?: string | null }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Ad summary by device</h2>
      <p style={{ color: '#64748b' }}>Ad-level performance grouped by Meta impression device. Phones and tablets are grouped as Mobile. Desktop is shown separately.</p>
      {warning ? <p style={{ color: '#9a3412', fontWeight: 800 }}>{warning}</p> : null}
      <div style={gridStyle}>
        {summaryRows.map((row) => (
          <div key={`device-card-${row.device}`} style={cardStyle}>
            <div style={{ color: '#64748b' }}>{row.device}</div>
            <strong style={{ fontSize: 30 }}>{row.results}</strong>
            <p style={{ marginBottom: 0, color: '#64748b' }}>Results</p>
            <p style={{ marginBottom: 0 }}><strong>{row.spend}</strong> spend · {row.clicks} clicks · {row.ctr} CTR</p>
          </div>
        ))}
      </div>
      <table style={tableStyle}>
        <thead><tr><th style={thTdStyle}>Device</th><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Results</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
        <tbody>{detailRows.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.device}<div style={{ color: '#64748b', fontSize: 12 }}>{row.rawDevice}</div></td><td style={thTdStyle}>{row.adName}</td><td style={thTdStyle}>{row.adSetName}</td><td style={thTdStyle}>{row.campaignName}</td><td style={thTdStyle}>{row.results}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
      </table>
      {summaryRows.length === 0 ? <p style={{ color: '#64748b' }}>No mobile/desktop breakdown rows returned for the selected date range.</p> : null}
    </section>
  );
}

function dateDefaultLabel(saved: SavedDateDefault | null) {
  if (!saved) return 'No saved default yet.';
  if (saved.range === 'custom') return saved.start && saved.end ? `Saved default: Custom date, ${saved.start} to ${saved.end}` : 'Saved default: Custom date';
  const labels: Record<RangeKey, string> = { today: 'Today', yesterday: 'Yesterday', last_7d: 'Last 7 days', this_month: 'This month', last_month: 'Last month', custom: 'Custom date' };
  return `Saved default: ${labels[saved.range]}`;
}

export default function DashboardSummaryPanel() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const [range, setRange] = useState<RangeKey>('last_7d');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedDateDefault, setSavedDateDefault] = useState<SavedDateDefault | null>(null);
  const [saveMessage, setSaveMessage] = useState('');

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
      setData({ ok: false, source: 'request_failed', error: 'Dashboard summary request failed.', summary: null, campaigns: [], adSets: [], ads: [], adDeviceSummary: [], adDeviceRows: [], platformSummary: [], platformRows: [] });
    } finally {
      setLoading(false);
    }
  }

  function saveDefaultDateRange() {
    if (range === 'custom' && (!start || !end)) {
      setSaveMessage('Choose both a start and end date before saving custom as the default.');
      return;
    }
    const nextDefault = { range, start: range === 'custom' ? start : '', end: range === 'custom' ? end : '' };
    localStorage.setItem(DATE_DEFAULT_STORAGE_KEY, JSON.stringify(nextDefault));
    setSavedDateDefault(nextDefault);
    setSaveMessage('Default date range saved.');
  }

  function clearDefaultDateRange() {
    localStorage.removeItem(DATE_DEFAULT_STORAGE_KEY);
    const resetDefault = { range: 'last_7d' as RangeKey, start: '', end: '' };
    setSavedDateDefault(null);
    setRange(resetDefault.range);
    setStart(resetDefault.start);
    setEnd(resetDefault.end);
    setSaveMessage('Default cleared. Using Last 7 days.');
  }

  useEffect(() => {
    const stored = localStorage.getItem(DATE_DEFAULT_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as SavedDateDefault;
      if (['today', 'yesterday', 'last_7d', 'this_month', 'last_month', 'custom'].includes(parsed.range)) {
        setSavedDateDefault(parsed);
        setRange(parsed.range);
        setStart(parsed.start || '');
        setEnd(parsed.end || '');
      }
    } catch {
      localStorage.removeItem(DATE_DEFAULT_STORAGE_KEY);
    }
  }, []);

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
            <p style={{ color: data?.ok ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{data?.ok ? `Connected to ${selectedAccount.name}. Last refresh was ${lastRefresh ?? 0} min ago.` : data?.error || `Not connected for ${selectedAccount.name}.`}</p>
          </div>
          <button type="button" onClick={loadData} style={blueButtonStyle}>{loading ? 'Refreshing...' : 'Refresh summary'}</button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Summary information</h2>
        <div style={twoColumnStyle}>
          <label style={labelStyle}>Date range<select style={inputStyle} value={range} onChange={(event) => setRange(event.target.value as RangeKey)}><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="last_7d">Last 7 days</option><option value="this_month">This month</option><option value="last_month">Last month</option><option value="custom">Custom date</option></select></label>
          {range === 'custom' ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><label style={labelStyle}>Start<input style={inputStyle} type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label><label style={labelStyle}>End<input style={inputStyle} type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label></div> : <div><strong>{data?.range?.label || 'Last 7 days'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{data?.range ? `${data.range.since} to ${data.range.until}` : 'Waiting for data.'}</p><p style={{ color: '#64748b', marginBottom: 0 }}>{data?.range?.timeZone || 'America/Chicago'}</p></div>}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
          {range === 'custom' ? <button type="button" onClick={loadData} style={blueButtonStyle}>Apply custom date</button> : null}
          <button type="button" onClick={saveDefaultDateRange} style={blueButtonStyle}>Save this date range as default</button>
          <button type="button" onClick={clearDefaultDateRange} style={{ ...blueButtonStyle, background: '#334155' }}>Clear saved default</button>
        </div>
        <p style={{ color: '#64748b', fontWeight: 800 }}>{saveMessage || dateDefaultLabel(savedDateDefault)}</p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Results</div><strong style={{ fontSize: 34 }}>{summary?.results || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 34 }}>{summary?.spend || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Impressions</div><strong style={{ fontSize: 34 }}>{summary?.impressions || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Clicks</div><strong style={{ fontSize: 34 }}>{summary?.clicks || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 34 }}>{summary?.ctr || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CPC / CPM</div><strong style={{ fontSize: 34 }}>{summary ? `${summary.cpc} / ${summary.cpm}` : '—'}</strong></div>
      </div>

      <PlatformDetailsSection summaryRows={data?.platformSummary || []} detailRows={data?.platformRows || []} warning={data?.warnings?.platformRows} />
      <AdDeviceSummary summaryRows={data?.adDeviceSummary || []} detailRows={data?.adDeviceRows || []} warning={data?.warnings?.adDeviceRows} />
      <CampaignTable rows={data?.campaigns || []} />
      <AdSetTable rows={data?.adSets || []} />
      <AdTable rows={data?.ads || []} />
    </>
  );
}
