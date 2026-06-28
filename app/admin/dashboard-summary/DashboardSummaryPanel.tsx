'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import PlatformDetailsSection from './PlatformDetailsSection';
import PlacementDetailsSection from './PlacementDetailsSection';

type RangeKey = 'today' | 'yesterday' | 'last_7d' | 'this_month' | 'last_month' | 'custom';
type Summary = { spend: string; results: string; impressions: string; clicks: string; ctr: string; cpc: string; cpm: string };
type Row = Summary & { id: string; name: string; campaignId?: string; campaignName?: string; adSetId?: string; adSetName?: string };
type DeviceSummary = Summary & { device: string };
type DeviceRow = Summary & { id: string; device: string; rawDevice: string; adId: string; adName: string; adSetName: string; campaignName: string };
type PlatformSummary = Summary & { platform: string; costPerResult: string };
type PlatformRow = PlatformSummary & { id: string; rawPlatform: string; adName: string; adSetName: string; campaignName: string };
type PlacementSummary = Summary & { placement: string; costPerResult: string };
type PlacementRow = PlacementSummary & { id: string; rawPlatform: string; rawPosition: string; adName: string; adSetName: string; campaignName: string };
type ApiData = { ok: boolean; source: string; error?: string; range?: { since: string; until: string; label: string; timeZone?: string }; summary: Summary | null; campaigns: Row[]; adSets: Row[]; ads: Row[]; adDeviceSummary?: DeviceSummary[]; adDeviceRows?: DeviceRow[]; platformSummary?: PlatformSummary[]; platformRows?: PlatformRow[]; placementSummary?: PlacementSummary[]; placementRows?: PlacementRow[]; checkedAt?: string; warnings?: Record<string, string | null> };

type SavedDateDefault = { range: RangeKey; start: string; end: string };
type QuickView = { title: string; name: string; sub?: string; results?: string; spend?: string; clicks?: string; ctr?: string; cpc?: string; cpm?: string; costPerResult?: string };

const DATE_DEFAULT_STORAGE_KEY = 'dynalander.dashboardSummary.defaultDateRange';

function metricNumber(value?: string) {
  if (!value) return 0;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function topBySpend<T extends { spend: string }>(rows?: T[]) {
  if (!rows?.length) return null;
  return [...rows].sort((a, b) => metricNumber(b.spend) - metricNumber(a.spend))[0];
}

function ScrollTable({ children }: { children: React.ReactNode }) {
  return <div className="dash-table-wrap">{children}</div>;
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <p style={{ color: '#64748b' }}>{children}</p>;
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="dash-metric-card">
      <div className="dash-muted">{label}</div>
      <strong>{value}</strong>
      {helper ? <p>{helper}</p> : null}
    </div>
  );
}

function MobileQuickCard({ item }: { item: QuickView }) {
  return (
    <div className="dash-mobile-card">
      <div className="dash-mobile-card-title">{item.title}</div>
      <strong>{item.name || 'No data returned'}</strong>
      {item.sub ? <p>{item.sub}</p> : null}
      <div className="dash-mobile-metrics">
        <span>Results: <b>{item.results || '—'}</b></span>
        <span>Spend: <b>{item.spend || '—'}</b></span>
        <span>Clicks: <b>{item.clicks || '—'}</b></span>
        <span>CTR: <b>{item.ctr || '—'}</b></span>
        {item.costPerResult ? <span>Cost/result: <b>{item.costPerResult}</b></span> : null}
        {item.cpc ? <span>CPC: <b>{item.cpc}</b></span> : null}
        {item.cpm ? <span>CPM: <b>{item.cpm}</b></span> : null}
      </div>
    </div>
  );
}

function CampaignTable({ rows }: { rows: Row[] }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Campaign summary</h2>
      <ScrollTable>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Campaign ID</th><th style={thTdStyle}>Results</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={`campaign-${row.id}`}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.id}</td><td style={thTdStyle}>{row.results}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
        </table>
      </ScrollTable>
      {rows.length === 0 ? <EmptyText>No campaign rows returned for the selected date range.</EmptyText> : null}
    </section>
  );
}

function AdSetTable({ rows }: { rows: Row[] }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Ad set summary</h2>
      <ScrollTable>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Ad set ID</th><th style={thTdStyle}>Results</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={`adset-${row.id}`}><td style={thTdStyle}>{row.campaignName || '—'}</td><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.id}</td><td style={thTdStyle}>{row.results}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
        </table>
      </ScrollTable>
      {rows.length === 0 ? <EmptyText>No ad set rows returned for the selected date range.</EmptyText> : null}
    </section>
  );
}

function AdTable({ rows }: { rows: Row[] }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Ad summary</h2>
      <ScrollTable>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Ad ID</th><th style={thTdStyle}>Results</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={`ad-${row.id}`}><td style={thTdStyle}>{row.campaignName || '—'}</td><td style={thTdStyle}>{row.adSetName || '—'}</td><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.id}</td><td style={thTdStyle}>{row.results}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
        </table>
      </ScrollTable>
      {rows.length === 0 ? <EmptyText>No ad rows returned for the selected date range.</EmptyText> : null}
    </section>
  );
}

function AdDeviceSummary({ summaryRows, detailRows, warning }: { summaryRows: DeviceSummary[]; detailRows: DeviceRow[]; warning?: string | null }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Ad summary by device</h2>
      <p style={{ color: '#64748b' }}>Ad-level performance grouped by Meta impression device. Phones and tablets are grouped as Mobile. Desktop is shown separately.</p>
      {warning ? <p style={{ color: '#9a3412', fontWeight: 800 }}>{warning}</p> : null}
      <div className="dash-metric-grid">
        {summaryRows.map((row) => <MetricCard key={`device-card-${row.device}`} label={row.device} value={row.results} helper={`${row.spend} spend · ${row.clicks} clicks · ${row.ctr} CTR`} />)}
      </div>
      <ScrollTable>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Device</th><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Results</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
          <tbody>{detailRows.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.device}<div style={{ color: '#64748b', fontSize: 12 }}>{row.rawDevice}</div></td><td style={thTdStyle}>{row.adName}</td><td style={thTdStyle}>{row.adSetName}</td><td style={thTdStyle}>{row.campaignName}</td><td style={thTdStyle}>{row.results}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
        </table>
      </ScrollTable>
      {summaryRows.length === 0 ? <EmptyText>No mobile/desktop breakdown rows returned for the selected date range.</EmptyText> : null}
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
    if (range === 'custom') { if (start) params.set('start', start); if (end) params.set('end', end); }
    try {
      const response = await fetch(`/api/meta-ads/dashboard-summary?${params.toString()}`, { cache: 'no-store' });
      setData(await response.json());
    } catch {
      setData({ ok: false, source: 'request_failed', error: 'Dashboard summary request failed.', summary: null, campaigns: [], adSets: [], ads: [], adDeviceSummary: [], adDeviceRows: [], platformSummary: [], platformRows: [], placementSummary: [], placementRows: [] });
    } finally {
      setLoading(false);
    }
  }

  function saveDefaultDateRange() {
    if (range === 'custom' && (!start || !end)) { setSaveMessage('Choose both a start and end date before saving custom as the default.'); return; }
    const nextDefault = { range, start: range === 'custom' ? start : '', end: range === 'custom' ? end : '' };
    localStorage.setItem(DATE_DEFAULT_STORAGE_KEY, JSON.stringify(nextDefault));
    setSavedDateDefault(nextDefault);
    setSaveMessage('Default date range saved.');
  }

  function clearDefaultDateRange() {
    localStorage.removeItem(DATE_DEFAULT_STORAGE_KEY);
    const resetDefault = { range: 'last_7d' as RangeKey, start: '', end: '' };
    setSavedDateDefault(null); setRange(resetDefault.range); setStart(resetDefault.start); setEnd(resetDefault.end); setSaveMessage('Default cleared. Using Last 7 days.');
  }

  useEffect(() => {
    const stored = localStorage.getItem(DATE_DEFAULT_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as SavedDateDefault;
      if (['today', 'yesterday', 'last_7d', 'this_month', 'last_month', 'custom'].includes(parsed.range)) { setSavedDateDefault(parsed); setRange(parsed.range); setStart(parsed.start || ''); setEnd(parsed.end || ''); }
    } catch { localStorage.removeItem(DATE_DEFAULT_STORAGE_KEY); }
  }, []);

  useEffect(() => { if (platform === 'meta_ads') loadData(); }, [platform, selectedAccount.customerId, range]);

  if (platform !== 'meta_ads') return <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Dashboard Summary</h2><p style={{ color: '#64748b' }}>Select Facebook / Meta Ads from the left sidebar to view the Meta Dashboard Summary.</p></section>;

  const summary = data?.summary;
  const lastRefresh = data?.checkedAt ? Math.max(0, Math.round((Date.now() - new Date(data.checkedAt).getTime()) / 60000)) : null;
  const topCampaign = topBySpend(data?.campaigns || []);
  const topAdSet = topBySpend(data?.adSets || []);
  const topAd = topBySpend(data?.ads || []);
  const topDevice = topBySpend(data?.adDeviceSummary || []);
  const topPlatform = topBySpend(data?.platformSummary || []);
  const topPlacement = topBySpend(data?.placementSummary || []);
  const quickViews: QuickView[] = [
    { title: 'Top campaign by spend', name: topCampaign?.name || '', sub: topCampaign?.id, results: topCampaign?.results, spend: topCampaign?.spend, clicks: topCampaign?.clicks, ctr: topCampaign?.ctr, cpc: topCampaign?.cpc, cpm: topCampaign?.cpm },
    { title: 'Top ad set by spend', name: topAdSet?.name || '', sub: topAdSet?.campaignName, results: topAdSet?.results, spend: topAdSet?.spend, clicks: topAdSet?.clicks, ctr: topAdSet?.ctr, cpc: topAdSet?.cpc, cpm: topAdSet?.cpm },
    { title: 'Top ad by spend', name: topAd?.name || '', sub: topAd?.adSetName || topAd?.campaignName, results: topAd?.results, spend: topAd?.spend, clicks: topAd?.clicks, ctr: topAd?.ctr, cpc: topAd?.cpc, cpm: topAd?.cpm },
    { title: 'Device quick view', name: topDevice?.device || '', results: topDevice?.results, spend: topDevice?.spend, clicks: topDevice?.clicks, ctr: topDevice?.ctr, cpc: topDevice?.cpc, cpm: topDevice?.cpm },
    { title: 'Platform quick view', name: topPlatform?.platform || '', results: topPlatform?.results, spend: topPlatform?.spend, clicks: topPlatform?.clicks, ctr: topPlatform?.ctr, costPerResult: topPlatform?.costPerResult },
    { title: 'Placement quick view', name: topPlacement?.placement || '', results: topPlacement?.results, spend: topPlacement?.spend, clicks: topPlacement?.clicks, ctr: topPlacement?.ctr, costPerResult: topPlacement?.costPerResult },
  ];

  return (
    <>
      <style>{`
        .dash-status-row { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
        .dash-muted { color: #64748b; }
        .dash-metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
        .dash-metric-card { border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; padding: 16px; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04); min-width: 0; }
        .dash-metric-card strong { display: block; font-size: clamp(24px, 6vw, 34px); line-height: 1.1; overflow-wrap: anywhere; margin-top: 6px; }
        .dash-metric-card p { color: #64748b; margin: 8px 0 0; line-height: 1.4; }
        .dash-mobile-quick { display: none; }
        .dash-mobile-card { border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; padding: 14px; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04); }
        .dash-mobile-card-title { color: #64748b; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; }
        .dash-mobile-card strong { display: block; margin-top: 6px; font-size: 18px; line-height: 1.25; overflow-wrap: anywhere; }
        .dash-mobile-card p { color: #64748b; margin: 6px 0 0; line-height: 1.35; overflow-wrap: anywhere; }
        .dash-mobile-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; color: #334155; font-size: 13px; }
        .dash-table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 12px; }
        .dash-table-wrap table { min-width: 920px; }
        .dash-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
        @media (max-width: 700px) {
          .dash-status-row { display: grid; grid-template-columns: 1fr; align-items: stretch; }
          .dash-status-row button, .dash-actions button { width: 100%; justify-content: center; }
          .dash-metric-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .dash-metric-card { border-radius: 14px; padding: 12px; }
          .dash-metric-card strong { font-size: 23px; }
          .dash-metric-card p { font-size: 12px; }
          .dash-mobile-quick { display: grid; grid-template-columns: 1fr; gap: 10px; margin: 12px 0 16px; }
          .dash-table-wrap { margin: 0 -6px; padding-bottom: 4px; }
        }
        @media (max-width: 430px) {
          .dash-metric-grid { grid-template-columns: 1fr; }
          .dash-mobile-metrics { grid-template-columns: 1fr; }
        }
      `}</style>

      <section style={{ ...cardStyle, border: data?.ok ? '2px solid #0f766e' : '2px solid #f97316', background: data?.ok ? '#f0fdfa' : '#fff7ed' }}>
        <div className="dash-status-row">
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
        <div className="dash-actions">{range === 'custom' ? <button type="button" onClick={loadData} style={blueButtonStyle}>Apply custom date</button> : null}<button type="button" onClick={saveDefaultDateRange} style={blueButtonStyle}>Save this date range as default</button><button type="button" onClick={clearDefaultDateRange} style={{ ...blueButtonStyle, background: '#334155' }}>Clear saved default</button></div>
        <p style={{ color: '#64748b', fontWeight: 800 }}>{saveMessage || dateDefaultLabel(savedDateDefault)}</p>
      </section>

      <div className="dash-metric-grid">
        <MetricCard label="Results" value={summary?.results || '—'} />
        <MetricCard label="Spend" value={summary?.spend || '—'} />
        <MetricCard label="Impressions" value={summary?.impressions || '—'} />
        <MetricCard label="Clicks" value={summary?.clicks || '—'} />
        <MetricCard label="CTR" value={summary?.ctr || '—'} />
        <MetricCard label="CPC / CPM" value={summary ? `${summary.cpc} / ${summary.cpm}` : '—'} />
      </div>

      <section className="dash-mobile-quick" aria-label="Mobile quick views">
        {quickViews.map((item) => <MobileQuickCard key={item.title} item={item} />)}
      </section>

      <AdDeviceSummary summaryRows={data?.adDeviceSummary || []} detailRows={data?.adDeviceRows || []} warning={data?.warnings?.adDeviceRows} />
      <CampaignTable rows={data?.campaigns || []} />
      <AdSetTable rows={data?.adSets || []} />
      <AdTable rows={data?.ads || []} />
      <PlatformDetailsSection summaryRows={data?.platformSummary || []} detailRows={data?.platformRows || []} warning={data?.warnings?.platformRows} />
      <PlacementDetailsSection summaryRows={data?.placementSummary || []} detailRows={data?.placementRows || []} warning={data?.warnings?.placementRows} />
    </>
  );
}
