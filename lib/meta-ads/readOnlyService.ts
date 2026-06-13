import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from './env';

type CheckResult = {
  name: string;
  ok: boolean;
  status: string;
  detail?: string;
};

function normalizeAdAccountId(value: string | null) {
  if (!value) return null;
  return value.startsWith('act_') ? value : `act_${value}`;
}

async function metaGet(path: string, params: Record<string, string>) {
  const env = getMetaAdsEnvStatus();
  const { apiVersion } = getMetaAdsAccountContext();
  const token = process.env[env.requiredNames.accessToken];
  const url = new URL(`https://graph.facebook.com/${apiVersion}/${path}`);

  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  if (token) url.searchParams.set('access_token', token);

  const response = await fetch(url.toString(), { cache: 'no-store' });
  const json = await response.json().catch(() => ({}));

  return { response, json };
}

function check(name: string, ok: boolean, status: string, detail?: string): CheckResult {
  return { name, ok, status, detail };
}

function money(value: string | number | undefined) {
  const numberValue = Number(value || 0);
  return `$${numberValue.toFixed(2)}`;
}

function percent(value: string | number | undefined) {
  const numberValue = Number(value || 0);
  return `${numberValue.toFixed(2)}%`;
}

function numberText(value: string | number | undefined) {
  return Number(value || 0).toLocaleString();
}

export async function runMetaReadinessCheck() {
  const env = getMetaAdsEnvStatus();
  const account = getMetaAdsAccountContext();
  const adAccountId = normalizeAdAccountId(account.adAccountId);
  const checks: CheckResult[] = [
    check('App ID', env.hasAppId, env.hasAppId ? 'Found' : 'Missing', env.requiredNames.appId),
    check('App Secret', env.hasAppSecret, env.hasAppSecret ? 'Found' : 'Missing', env.requiredNames.appSecret),
    check('Access token', env.hasAccessToken, env.hasAccessToken ? 'Found' : 'Missing', env.requiredNames.accessToken),
    check('Ad account ID', env.hasAdAccountId, env.hasAdAccountId ? 'Found' : 'Missing', env.requiredNames.adAccountId),
    check('API version', true, account.apiVersion, env.requiredNames.apiVersion),
    check('Business ID', env.hasBusinessId, env.hasBusinessId ? 'Found' : 'Optional / Missing', env.requiredNames.businessId)
  ];

  if (!env.configured || !adAccountId) {
    return {
      ok: false,
      configured: false,
      mode: 'mock_only',
      adAccountId,
      apiVersion: account.apiVersion,
      checks,
      checkedAt: new Date().toISOString()
    };
  }

  try {
    const accountResult = await metaGet(adAccountId, { fields: 'id,name,account_status,currency,timezone_name' });
    checks.push(check('Can reach Meta API', accountResult.response.ok, accountResult.response.ok ? 'Connected' : 'Failed', accountResult.json?.error?.message));
    checks.push(check('Can read ad account', accountResult.response.ok && Boolean(accountResult.json?.id), accountResult.json?.name || 'Not readable', accountResult.json?.error?.message));

    const campaignsResult = await metaGet(`${adAccountId}/campaigns`, { fields: 'id,name,status,effective_status', limit: '5' });
    checks.push(check('Can read campaigns', campaignsResult.response.ok, campaignsResult.response.ok ? `${campaignsResult.json?.data?.length || 0} returned` : 'Failed', campaignsResult.json?.error?.message));

    const adSetsResult = await metaGet(`${adAccountId}/adsets`, { fields: 'id,name,status,effective_status', limit: '5' });
    checks.push(check('Can read ad sets', adSetsResult.response.ok, adSetsResult.response.ok ? `${adSetsResult.json?.data?.length || 0} returned` : 'Failed', adSetsResult.json?.error?.message));

    const adsResult = await metaGet(`${adAccountId}/ads`, { fields: 'id,name,status,effective_status', limit: '5' });
    checks.push(check('Can read ads', adsResult.response.ok, adsResult.response.ok ? `${adsResult.json?.data?.length || 0} returned` : 'Failed', adsResult.json?.error?.message));

    const insightsResult = await metaGet(`${adAccountId}/insights`, { fields: 'spend,impressions,clicks,cpm,cpc,ctr,date_start,date_stop', date_preset: 'last_7d', limit: '5' });
    checks.push(check('Can read insights', insightsResult.response.ok, insightsResult.response.ok ? `${insightsResult.json?.data?.length || 0} rows returned` : 'Failed', insightsResult.json?.error?.message));

    const liveOk = checks.filter((item) => item.name.startsWith('Can ')).every((item) => item.ok);

    return {
      ok: liveOk,
      configured: true,
      mode: 'read_only_live_check',
      adAccountId,
      apiVersion: account.apiVersion,
      account: accountResult.json?.error ? null : accountResult.json,
      checks,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    checks.push(check('Can reach Meta API', false, 'Request failed', error instanceof Error ? error.message : 'Unknown error'));
    return {
      ok: false,
      configured: true,
      mode: 'read_only_live_check_failed',
      adAccountId,
      apiVersion: account.apiVersion,
      checks,
      checkedAt: new Date().toISOString()
    };
  }
}

export async function getLiveMetaDataPreview() {
  const readiness = await runMetaReadinessCheck();
  const account = getMetaAdsAccountContext();
  const adAccountId = normalizeAdAccountId(account.adAccountId);

  if (!readiness.ok || !adAccountId) {
    return { ok: false, source: 'mock_fallback', readiness, summary: null, campaigns: [], adSets: [], ads: [], insights: [], checkedAt: new Date().toISOString() };
  }

  const [campaignsResult, adSetsResult, adsResult, insightsResult] = await Promise.all([
    metaGet(`${adAccountId}/campaigns`, { fields: 'id,name,status,effective_status,objective', limit: '25' }),
    metaGet(`${adAccountId}/adsets`, { fields: 'id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget', limit: '25' }),
    metaGet(`${adAccountId}/ads`, { fields: 'id,name,campaign_id,adset_id,status,effective_status', limit: '25' }),
    metaGet(`${adAccountId}/insights`, { fields: 'spend,impressions,clicks,cpm,cpc,ctr,reach,frequency,date_start,date_stop', date_preset: 'last_7d', limit: '25' })
  ]);

  const insightRows = insightsResult.json?.data || [];
  const totalSpend = insightRows.reduce((sum: number, row: any) => sum + Number(row.spend || 0), 0);
  const totalImpressions = insightRows.reduce((sum: number, row: any) => sum + Number(row.impressions || 0), 0);
  const totalClicks = insightRows.reduce((sum: number, row: any) => sum + Number(row.clicks || 0), 0);
  const avgCtr = totalImpressions ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks ? totalSpend / totalClicks : 0;
  const avgCpm = totalImpressions ? (totalSpend / totalImpressions) * 1000 : 0;

  return {
    ok: true,
    source: 'meta_live_read_only',
    readiness,
    summary: {
      spend: money(totalSpend),
      impressions: numberText(totalImpressions),
      clicks: numberText(totalClicks),
      ctr: percent(avgCtr),
      cpc: money(avgCpc),
      cpm: money(avgCpm),
      campaignCount: campaignsResult.json?.data?.length || 0,
      adSetCount: adSetsResult.json?.data?.length || 0,
      adCount: adsResult.json?.data?.length || 0
    },
    campaigns: campaignsResult.json?.data || [],
    adSets: adSetsResult.json?.data || [],
    ads: adsResult.json?.data || [],
    insights: insightRows,
    checkedAt: new Date().toISOString()
  };
}
