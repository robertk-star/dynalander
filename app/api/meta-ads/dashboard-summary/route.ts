import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

type RangeKey = 'today' | 'yesterday' | 'last_7d' | 'this_month' | 'last_month' | 'custom';
const DASHBOARD_TIME_ZONE = 'America/Chicago';

function normalizeAdAccountId(value: string | null) { if (!value) return null; return value.startsWith('act_') ? value : `act_${value}`; }
function chicagoDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: DASHBOARD_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return { year: Number(parts.find((part) => part.type === 'year')?.value || '0'), month: Number(parts.find((part) => part.type === 'month')?.value || '0'), day: Number(parts.find((part) => part.type === 'day')?.value || '0') };
}
function dateStringFromParts(year: number, month: number, day: number) { return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }
function shiftDateParts(parts: { year: number; month: number; day: number }, days: number) { const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, 12, 0, 0)); return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }; }
function monthStart(parts: { year: number; month: number; day: number }, offsetMonths = 0) { const date = new Date(Date.UTC(parts.year, parts.month - 1 + offsetMonths, 1, 12, 0, 0)); return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }; }
function monthEnd(parts: { year: number; month: number; day: number }, offsetMonths = 0) { const date = new Date(Date.UTC(parts.year, parts.month + offsetMonths, 0, 12, 0, 0)); return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }; }
function toDateString(parts: { year: number; month: number; day: number }) { return dateStringFromParts(parts.year, parts.month, parts.day); }
function getRange(range: RangeKey, customStart: string | null, customEnd: string | null) {
  const today = chicagoDateParts(new Date());
  const yesterday = shiftDateParts(today, -1);
  const startOfThisMonth = monthStart(today, 0);
  const startOfLastMonth = monthStart(today, -1);
  const endOfLastMonth = monthEnd(today, -1);
  const last7 = shiftDateParts(today, -6);
  if (range === 'today') return { since: toDateString(today), until: toDateString(today), label: 'Today', timeZone: DASHBOARD_TIME_ZONE };
  if (range === 'yesterday') return { since: toDateString(yesterday), until: toDateString(yesterday), label: 'Yesterday', timeZone: DASHBOARD_TIME_ZONE };
  if (range === 'this_month') return { since: toDateString(startOfThisMonth), until: toDateString(today), label: 'This month', timeZone: DASHBOARD_TIME_ZONE };
  if (range === 'last_month') return { since: toDateString(startOfLastMonth), until: toDateString(endOfLastMonth), label: 'Last month', timeZone: DASHBOARD_TIME_ZONE };
  if (range === 'custom' && customStart && customEnd) return { since: customStart, until: customEnd, label: 'Custom date', timeZone: DASHBOARD_TIME_ZONE };
  return { since: toDateString(last7), until: toDateString(today), label: 'Last 7 days', timeZone: DASHBOARD_TIME_ZONE };
}
async function metaGet(path: string, params: Record<string, string>) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const token = process.env[env.requiredNames.accessToken];
  const url = new URL(`https://graph.facebook.com/${context.apiVersion}/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  if (token) url.searchParams.set('access_token', token);
  const response = await fetch(url.toString(), { cache: 'no-store' });
  const json = await response.json().catch(() => ({}));
  return { response, json };
}
function money(value: string | number | undefined) { return `$${Number(value || 0).toFixed(2)}`; }
function percent(value: string | number | undefined) { return `${Number(value || 0).toFixed(2)}%`; }
function numberText(value: string | number | undefined) { return Number(value || 0).toLocaleString(); }
function rowResults(row: any) { const actions = Array.isArray(row.actions) ? row.actions : []; return actions.filter((action: any) => action.action_type === 'lead').reduce((sum: number, action: any) => sum + Number(action.value || 0), 0); }
function deviceGroup(value: string | undefined) { const device = String(value || 'unknown').toLowerCase(); if (device.includes('desktop')) return 'Desktop'; if (device === 'unknown' || device === 'other') return 'Other / Unknown'; return 'Mobile'; }
function platformGroup(value: string | undefined) { const platform = String(value || 'unknown').toLowerCase(); if (platform === 'facebook') return 'Facebook'; if (platform === 'instagram') return 'Instagram'; if (platform === 'messenger') return 'Messenger'; if (platform === 'audience_network') return 'Audience Network'; return 'Other / Unknown'; }
function positionLabel(value: string | undefined) { const raw = String(value || 'unknown'); if (raw === 'unknown') return 'Unknown placement'; return raw.split('_').map((part) => part ? part[0].toUpperCase() + part.slice(1) : part).join(' '); }
function placementGroup(row: any) { return `${platformGroup(row.publisher_platform)} — ${positionLabel(row.platform_position)}`; }
function summarizeNumbers(rows: any[]) {
  const spend = rows.reduce((sum, row) => sum + Number(row.spend || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + Number(row.impressions || 0), 0);
  const clicks = rows.reduce((sum, row) => sum + Number(row.clicks || 0), 0);
  const results = rows.reduce((sum, row) => sum + rowResults(row), 0);
  const ctr = impressions ? (clicks / impressions) * 100 : 0;
  const cpc = clicks ? spend / clicks : 0;
  const cpm = impressions ? (spend / impressions) * 1000 : 0;
  const costPerResult = results ? spend / results : 0;
  return { spend, impressions, clicks, results, ctr, cpc, cpm, costPerResult };
}
function summarize(rows: any[]) { const totals = summarizeNumbers(rows); return { spend: money(totals.spend), results: numberText(totals.results), impressions: numberText(totals.impressions), clicks: numberText(totals.clicks), ctr: percent(totals.ctr), cpc: money(totals.cpc), cpm: money(totals.cpm) }; }
function summarizeWithCostPerResult(rows: any[]) { const totals = summarizeNumbers(rows); return { spend: money(totals.spend), results: numberText(totals.results), costPerResult: totals.results ? money(totals.costPerResult) : '—', impressions: numberText(totals.impressions), clicks: numberText(totals.clicks), ctr: percent(totals.ctr), cpc: money(totals.cpc), cpm: money(totals.cpm) }; }
function mapInsightRows(rows: any[], nameField: string, idField: string) { return rows.map((row) => ({ id: row[idField] || '—', name: row[nameField] || '—', campaignId: row.campaign_id || '—', campaignName: row.campaign_name || '—', adSetId: row.adset_id || '—', adSetName: row.adset_name || '—', results: numberText(rowResults(row)), spend: money(row.spend), impressions: numberText(row.impressions), clicks: numberText(row.clicks), ctr: percent(row.ctr), cpc: money(row.cpc), cpm: money(row.cpm) })); }
function mapDeviceSummary(rows: any[]) { const grouped = new Map<string, any[]>(); rows.forEach((row) => { const group = deviceGroup(row.impression_device); grouped.set(group, [...(grouped.get(group) || []), row]); }); return ['Mobile', 'Desktop', 'Other / Unknown'].filter((group) => grouped.has(group)).map((group) => ({ device: group, ...summarize(grouped.get(group) || []) })); }
function mapAdDeviceRows(rows: any[]) { return rows.map((row) => ({ id: `${row.ad_id || 'unknown'}-${row.impression_device || 'unknown'}`, device: deviceGroup(row.impression_device), rawDevice: row.impression_device || '—', adId: row.ad_id || '—', adName: row.ad_name || '—', adSetName: row.adset_name || '—', campaignName: row.campaign_name || '—', results: numberText(rowResults(row)), spend: money(row.spend), impressions: numberText(row.impressions), clicks: numberText(row.clicks), ctr: percent(row.ctr), cpc: money(row.cpc), cpm: money(row.cpm) })); }
function mapPlatformSummary(rows: any[]) { const grouped = new Map<string, any[]>(); rows.forEach((row) => { const group = platformGroup(row.publisher_platform); grouped.set(group, [...(grouped.get(group) || []), row]); }); return ['Facebook', 'Instagram', 'Messenger', 'Audience Network', 'Other / Unknown'].filter((group) => grouped.has(group)).map((group) => ({ platform: group, ...summarizeWithCostPerResult(grouped.get(group) || []) })); }
function mapPlatformRows(rows: any[]) { return rows.map((row) => ({ id: `${row.publisher_platform || 'unknown'}-${row.ad_id || 'account'}`, platform: platformGroup(row.publisher_platform), rawPlatform: row.publisher_platform || '—', adId: row.ad_id || '—', adName: row.ad_name || '—', adSetName: row.adset_name || '—', campaignName: row.campaign_name || '—', results: numberText(rowResults(row)), costPerResult: rowResults(row) ? money(Number(row.spend || 0) / rowResults(row)) : '—', spend: money(row.spend), impressions: numberText(row.impressions), clicks: numberText(row.clicks), ctr: percent(row.ctr), cpc: money(row.cpc), cpm: money(row.cpm) })); }
function mapPlacementSummary(rows: any[]) { const grouped = new Map<string, any[]>(); rows.forEach((row) => { const group = placementGroup(row); grouped.set(group, [...(grouped.get(group) || []), row]); }); return Array.from(grouped.entries()).map(([placement, groupRows]) => ({ placement, ...summarizeWithCostPerResult(groupRows) })).sort((a, b) => Number(b.spend.replace(/[$,]/g, '')) - Number(a.spend.replace(/[$,]/g, ''))); }
function mapPlacementRows(rows: any[]) { return rows.map((row) => ({ id: `${row.publisher_platform || 'unknown'}-${row.platform_position || 'unknown'}-${row.ad_id || 'account'}`, placement: placementGroup(row), rawPlatform: row.publisher_platform || '—', rawPosition: row.platform_position || '—', adId: row.ad_id || '—', adName: row.ad_name || '—', adSetName: row.adset_name || '—', campaignName: row.campaign_name || '—', results: numberText(rowResults(row)), costPerResult: rowResults(row) ? money(Number(row.spend || 0) / rowResults(row)) : '—', spend: money(row.spend), impressions: numberText(row.impressions), clicks: numberText(row.clicks), ctr: percent(row.ctr), cpc: money(row.cpc), cpm: money(row.cpm) })); }

export async function GET(request: Request) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const url = new URL(request.url);
  const selected = normalizeAdAccountId(url.searchParams.get('accountKey') || url.searchParams.get('adAccountId'));
  const configured = normalizeAdAccountId(context.adAccountId);
  const rangeKey = (url.searchParams.get('range') || 'last_7d') as RangeKey;
  const range = getRange(rangeKey, url.searchParams.get('start'), url.searchParams.get('end'));
  if (!env.configured || !configured) return Response.json({ ok: false, source: 'not_configured', error: 'Meta ENV is not configured.', range, summary: null, campaigns: [], adSets: [], ads: [], adDeviceSummary: [], adDeviceRows: [], platformSummary: [], platformRows: [], placementSummary: [], placementRows: [] });
  if (selected && selected !== configured && selected !== 'act_meta-connected-account') return Response.json({ ok: false, source: 'active_account_mismatch', error: 'Selected active account does not match connected Meta account.', selected, configured, range, summary: null, campaigns: [], adSets: [], ads: [], adDeviceSummary: [], adDeviceRows: [], platformSummary: [], platformRows: [], placementSummary: [], placementRows: [] });
  const params = { time_range: JSON.stringify({ since: range.since, until: range.until }), limit: '100' };
  const fields = 'spend,impressions,clicks,cpc,cpm,ctr,actions';
  const adFields = `campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,${fields}`;
  const [accountResult, campaignResult, adSetResult, adResult, adDeviceResult, platformResult, placementResult] = await Promise.all([
    metaGet(`${configured}/insights`, { ...params, fields }),
    metaGet(`${configured}/insights`, { ...params, level: 'campaign', fields: `campaign_id,campaign_name,${fields}` }),
    metaGet(`${configured}/insights`, { ...params, level: 'adset', fields: `campaign_id,campaign_name,adset_id,adset_name,${fields}` }),
    metaGet(`${configured}/insights`, { ...params, level: 'ad', fields: adFields }),
    metaGet(`${configured}/insights`, { ...params, level: 'ad', breakdowns: 'impression_device', fields: adFields }),
    metaGet(`${configured}/insights`, { ...params, level: 'ad', breakdowns: 'publisher_platform', fields: adFields }),
    metaGet(`${configured}/insights`, { ...params, level: 'ad', breakdowns: 'publisher_platform,platform_position', fields: adFields })
  ]);
  if (!accountResult.response.ok) return Response.json({ ok: false, source: 'meta_dashboard_summary_failed', error: accountResult.json?.error?.message || 'Could not read Meta summary.', range, summary: null, campaigns: [], adSets: [], ads: [], adDeviceSummary: [], adDeviceRows: [], platformSummary: [], platformRows: [], placementSummary: [], placementRows: [] });
  const accountRows = accountResult.json?.data || [];
  const adDeviceRows = adDeviceResult.response.ok ? adDeviceResult.json?.data || [] : [];
  const platformRows = platformResult.response.ok ? platformResult.json?.data || [] : [];
  const placementRows = placementResult.response.ok ? placementResult.json?.data || [] : [];
  return Response.json({
    ok: true,
    source: 'meta_dashboard_summary_active_account',
    adAccountId: configured,
    range,
    summary: summarize(accountRows),
    campaigns: mapInsightRows(campaignResult.json?.data || [], 'campaign_name', 'campaign_id'),
    adSets: mapInsightRows(adSetResult.json?.data || [], 'adset_name', 'adset_id'),
    ads: mapInsightRows(adResult.json?.data || [], 'ad_name', 'ad_id'),
    adDeviceSummary: mapDeviceSummary(adDeviceRows),
    adDeviceRows: mapAdDeviceRows(adDeviceRows),
    platformSummary: mapPlatformSummary(platformRows),
    platformRows: mapPlatformRows(platformRows),
    placementSummary: mapPlacementSummary(placementRows),
    placementRows: mapPlacementRows(placementRows),
    warnings: {
      campaigns: campaignResult.response.ok ? null : campaignResult.json?.error?.message || 'Could not read campaign rows.',
      adSets: adSetResult.response.ok ? null : adSetResult.json?.error?.message || 'Could not read ad set rows.',
      ads: adResult.response.ok ? null : adResult.json?.error?.message || 'Could not read ad rows.',
      adDeviceRows: adDeviceResult.response.ok ? null : adDeviceResult.json?.error?.message || 'Could not read ad device breakdown rows.',
      platformRows: platformResult.response.ok ? null : platformResult.json?.error?.message || 'Could not read platform breakdown rows.',
      placementRows: placementResult.response.ok ? null : placementResult.json?.error?.message || 'Could not read placement breakdown rows.'
    },
    checkedAt: new Date().toISOString()
  });
}
