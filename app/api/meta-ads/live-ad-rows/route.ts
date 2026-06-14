import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

function normalizeAdAccountId(value: string | null) {
  if (!value) return null;
  return value.startsWith('act_') ? value : `act_${value}`;
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

export async function GET(request: Request) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const url = new URL(request.url);
  const requested = normalizeAdAccountId(url.searchParams.get('accountKey') || url.searchParams.get('adAccountId'));
  const configured = normalizeAdAccountId(context.adAccountId);

  if (!env.configured || !configured) {
    return Response.json({ ok: false, source: 'not_configured', ads: [], insights: [], error: 'Meta ENV is not configured.' });
  }

  if (requested && requested !== configured && requested !== 'act_meta-connected-account') {
    return Response.json({ ok: false, source: 'active_account_mismatch', ads: [], insights: [], requestedAdAccountId: requested, configuredAdAccountId: configured });
  }

  const [adsResult, insightsResult] = await Promise.all([
    metaGet(`${configured}/ads`, { fields: 'id,name,campaign_id,adset_id,status,effective_status', limit: '100' }),
    metaGet(`${configured}/insights`, { fields: 'ad_id,ad_name,spend,impressions,clicks,cpc,cpm,ctr,reach,frequency,date_start,date_stop', level: 'ad', date_preset: 'last_7d', limit: '100' })
  ]);

  if (!adsResult.response.ok) {
    return Response.json({ ok: false, source: 'meta_live_ad_rows_failed', ads: [], insights: [], error: adsResult.json?.error?.message || 'Could not read Meta ads.' });
  }

  return Response.json({
    ok: true,
    source: 'meta_live_ad_rows_active_account',
    adAccountId: configured,
    ads: adsResult.json?.data || [],
    insights: insightsResult.json?.data || [],
    insightsError: insightsResult.response.ok ? null : insightsResult.json?.error?.message || 'Could not read ad insights.',
    checkedAt: new Date().toISOString()
  });
}
