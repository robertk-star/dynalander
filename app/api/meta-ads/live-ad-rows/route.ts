import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

const CACHE_MS = 5 * 60 * 1000;

type CachedPayload = {
  savedAt: number;
  payload: Record<string, unknown>;
};

const globalCache = globalThis as typeof globalThis & {
  __dynlanderMetaAdRowsCache?: Record<string, CachedPayload>;
};

globalCache.__dynlanderMetaAdRowsCache ||= {};

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

function getCached(cacheKey: string) {
  const cached = globalCache.__dynlanderMetaAdRowsCache?.[cacheKey];
  if (!cached) return null;
  const age = Date.now() - cached.savedAt;
  return { ...cached.payload, cacheAgeMs: age, cached: true };
}

function getFreshCached(cacheKey: string) {
  const cached = globalCache.__dynlanderMetaAdRowsCache?.[cacheKey];
  if (!cached) return null;
  if (Date.now() - cached.savedAt > CACHE_MS) return null;
  return { ...cached.payload, cacheAgeMs: Date.now() - cached.savedAt, cached: true };
}

function saveCached(cacheKey: string, payload: Record<string, unknown>) {
  globalCache.__dynlanderMetaAdRowsCache![cacheKey] = { savedAt: Date.now(), payload };
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

  const cacheKey = configured;
  const freshCached = getFreshCached(cacheKey);
  if (freshCached) {
    return Response.json({ ...freshCached, source: 'meta_live_ad_rows_cache' });
  }

  const [adsResult, insightsResult] = await Promise.all([
    metaGet(`${configured}/ads`, { fields: 'id,name,campaign_id,adset_id,status,effective_status', limit: '100' }),
    metaGet(`${configured}/insights`, { fields: 'ad_id,ad_name,spend,impressions,clicks,cpc,cpm,ctr,reach,frequency,date_start,date_stop', level: 'ad', date_preset: 'last_7d', limit: '100' })
  ]);

  if (!adsResult.response.ok) {
    const stale = getCached(cacheKey);
    if (stale) {
      return Response.json({ ...stale, source: 'meta_live_ad_rows_stale_cache', warning: adsResult.json?.error?.message || 'Meta request failed; showing last successful read.' });
    }
    return Response.json({ ok: false, source: 'meta_live_ad_rows_failed', ads: [], insights: [], error: adsResult.json?.error?.message || 'Could not read Meta ads.' });
  }

  const payload = {
    ok: true,
    source: 'meta_live_ad_rows_active_account',
    adAccountId: configured,
    ads: adsResult.json?.data || [],
    insights: insightsResult.json?.data || [],
    insightsError: insightsResult.response.ok ? null : insightsResult.json?.error?.message || 'Could not read ad insights.',
    checkedAt: new Date().toISOString()
  };

  saveCached(cacheKey, payload);
  return Response.json(payload);
}
