import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

type RangeKey = 'today' | 'yesterday' | 'last_7d' | 'this_month' | 'last_month' | 'custom';

function normalizeAdAccountId(value: string | null) {
  if (!value) return null;
  return value.startsWith('act_') ? value : `act_${value}`;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getRange(range: RangeKey, customStart: string | null, customEnd: string | null) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const startOfThisMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const startOfLastMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
  const endOfLastMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));
  const last7 = new Date(today);
  last7.setUTCDate(last7.getUTCDate() - 6);

  if (range === 'today') return { since: toDateString(today), until: toDateString(today), label: 'Today' };
  if (range === 'yesterday') return { since: toDateString(yesterday), until: toDateString(yesterday), label: 'Yesterday' };
  if (range === 'this_month') return { since: toDateString(startOfThisMonth), until: toDateString(today), label: 'This month' };
  if (range === 'last_month') return { since: toDateString(startOfLastMonth), until: toDateString(endOfLastMonth), label: 'Last month' };
  if (range === 'custom' && customStart && customEnd) return { since: customStart, until: customEnd, label: 'Custom date' };
  return { since: toDateString(last7), until: toDateString(today), label: 'Last 7 days' };
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

function money(value: string | number | undefined) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function percent(value: string | number | undefined) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function numberText(value: string | number | undefined) {
  return Number(value || 0).toLocaleString();
}

function rowResults(row: any) {
  const actions = Array.isArray(row.actions) ? row.actions : [];
  return actions
    .filter((action: any) => action.action_type === 'lead')
    .reduce((sum: number, action: any) => sum + Number(action.value || 0), 0);
}

function summarize(rows: any[]) {
  const spend = rows.reduce((sum, row) => sum + Number(row.spend || 0), 0);
  const impressions = rows.reduce((sum, row) => sum + Number(row.impressions || 0), 0);
  const clicks = rows.reduce((sum, row) => sum + Number(row.clicks || 0), 0);
  const results = rows.reduce((sum, row) => sum + rowResults(row), 0);
  const ctr = impressions ? (clicks / impressions) * 100 : 0;
  const cpc = clicks ? spend / clicks : 0;
  const cpm = impressions ? (spend / impressions) * 1000 : 0;
  return { spend: money(spend), results: numberText(results), impressions: numberText(impressions), clicks: numberText(clicks), ctr: percent(ctr), cpc: money(cpc), cpm: money(cpm) };
}

function mapInsightRows(rows: any[], nameField: string, idField: string) {
  return rows.map((row) => ({
    id: row[idField] || '—',
    name: row[nameField] || '—',
    campaignId: row.campaign_id || '—',
    campaignName: row.campaign_name || '—',
    adSetId: row.adset_id || '—',
    adSetName: row.adset_name || '—',
    results: numberText(rowResults(row)),
    spend: money(row.spend),
    impressions: numberText(row.impressions),
    clicks: numberText(row.clicks),
    ctr: percent(row.ctr),
    cpc: money(row.cpc),
    cpm: money(row.cpm)
  }));
}

export async function GET(request: Request) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const url = new URL(request.url);
  const selected = normalizeAdAccountId(url.searchParams.get('accountKey') || url.searchParams.get('adAccountId'));
  const configured = normalizeAdAccountId(context.adAccountId);
  const rangeKey = (url.searchParams.get('range') || 'last_7d') as RangeKey;
  const range = getRange(rangeKey, url.searchParams.get('start'), url.searchParams.get('end'));

  if (!env.configured || !configured) {
    return Response.json({ ok: false, source: 'not_configured', error: 'Meta ENV is not configured.', range, summary: null, campaigns: [], adSets: [], ads: [] });
  }

  if (selected && selected !== configured && selected !== 'act_meta-connected-account') {
    return Response.json({ ok: false, source: 'active_account_mismatch', error: 'Selected active account does not match connected Meta account.', selected, configured, range, summary: null, campaigns: [], adSets: [], ads: [] });
  }

  const params = { time_range: JSON.stringify({ since: range.since, until: range.until }), limit: '100' };
  const fields = 'spend,impressions,clicks,cpc,cpm,ctr,actions';
  const [accountResult, campaignResult, adSetResult, adResult] = await Promise.all([
    metaGet(`${configured}/insights`, { ...params, fields }),
    metaGet(`${configured}/insights`, { ...params, level: 'campaign', fields: `campaign_id,campaign_name,${fields}` }),
    metaGet(`${configured}/insights`, { ...params, level: 'adset', fields: `campaign_id,campaign_name,adset_id,adset_name,${fields}` }),
    metaGet(`${configured}/insights`, { ...params, level: 'ad', fields: `campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,${fields}` })
  ]);

  if (!accountResult.response.ok) {
    return Response.json({ ok: false, source: 'meta_dashboard_summary_failed', error: accountResult.json?.error?.message || 'Could not read Meta summary.', range, summary: null, campaigns: [], adSets: [], ads: [] });
  }

  const accountRows = accountResult.json?.data || [];
  return Response.json({
    ok: true,
    source: 'meta_dashboard_summary_active_account',
    adAccountId: configured,
    range,
    summary: summarize(accountRows),
    campaigns: mapInsightRows(campaignResult.json?.data || [], 'campaign_name', 'campaign_id'),
    adSets: mapInsightRows(adSetResult.json?.data || [], 'adset_name', 'adset_id'),
    ads: mapInsightRows(adResult.json?.data || [], 'ad_name', 'ad_id'),
    warnings: {
      campaigns: campaignResult.response.ok ? null : campaignResult.json?.error?.message || 'Could not read campaign rows.',
      adSets: adSetResult.response.ok ? null : adSetResult.json?.error?.message || 'Could not read ad set rows.',
      ads: adResult.response.ok ? null : adResult.json?.error?.message || 'Could not read ad rows.'
    },
    checkedAt: new Date().toISOString()
  });
}
