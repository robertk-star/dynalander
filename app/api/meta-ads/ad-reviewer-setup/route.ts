import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

function normalizeAdAccountId(value: string | null) {
  if (!value) return null;
  return value.startsWith('act_') ? value : `act_${value}`;
}

function moneyFromMinorUnits(value: string | number | undefined) {
  if (value === undefined || value === null || value === '') return '—';
  return `$${(Number(value || 0) / 100).toFixed(2)}`;
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

function getCreativeText(creative: any) {
  const spec = creative?.object_story_spec || {};
  const link = spec.link_data || {};
  const video = spec.video_data || {};
  const cta = link.call_to_action || video.call_to_action || {};
  return {
    primaryText: link.message || video.message || creative?.body || 'Not returned by Meta',
    headline: link.name || video.title || creative?.title || 'Not returned by Meta',
    description: link.description || creative?.description || 'Not returned by Meta',
    cta: cta.type || 'Not returned by Meta',
    destinationUrl: link.link || cta.value?.link || 'Not returned by Meta',
    imageUrl: link.picture || creative?.image_url || creative?.thumbnail_url || '',
    format: video.video_id ? 'Video' : link.picture ? 'Image / Link' : 'Not returned by Meta'
  };
}

function summarizeTargeting(targeting: any) {
  const geo = targeting?.geo_locations || {};
  const customAudiences = targeting?.custom_audiences || [];
  const excludedCustomAudiences = targeting?.excluded_custom_audiences || [];
  return {
    ageMin: targeting?.age_min || '—',
    ageMax: targeting?.age_max || '—',
    genders: Array.isArray(targeting?.genders) && targeting.genders.length ? targeting.genders.join(', ') : 'All / not specified',
    countries: Array.isArray(geo.countries) && geo.countries.length ? geo.countries.join(', ') : 'Not returned by Meta',
    regions: Array.isArray(geo.regions) ? geo.regions.map((item: any) => item.name || item.key).filter(Boolean).join(', ') : '',
    cities: Array.isArray(geo.cities) ? geo.cities.map((item: any) => item.name || item.key).filter(Boolean).join(', ') : '',
    customAudienceCount: customAudiences.length,
    customAudiences: customAudiences.map((item: any) => item.name || item.id).filter(Boolean),
    excludedCustomAudienceCount: excludedCustomAudiences.length,
    excludedCustomAudiences: excludedCustomAudiences.map((item: any) => item.name || item.id).filter(Boolean),
    publisherPlatforms: Array.isArray(targeting?.publisher_platforms) ? targeting.publisher_platforms.join(', ') : 'Not returned by Meta',
    rawReturned: Boolean(targeting)
  };
}

export async function GET(request: Request) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const url = new URL(request.url);
  const requested = normalizeAdAccountId(url.searchParams.get('accountKey') || url.searchParams.get('adAccountId'));
  const configured = normalizeAdAccountId(context.adAccountId);

  if (!env.configured || !configured) return Response.json({ ok: false, source: 'not_configured', ads: [], error: 'Meta ENV is not configured.' });
  if (requested && requested !== configured && requested !== 'act_meta-connected-account') return Response.json({ ok: false, source: 'active_account_mismatch', ads: [], requestedAdAccountId: requested, configuredAdAccountId: configured, error: 'Selected active account does not match connected Meta account.' });

  const adsResult = await metaGet(`${configured}/ads`, { fields: 'id,name,status,effective_status,campaign_id,adset_id,creative{id,name,title,body,description,image_url,thumbnail_url,object_story_spec}', limit: '100' });
  if (!adsResult.response.ok) return Response.json({ ok: false, source: 'ad_setup_failed', ads: [], error: adsResult.json?.error?.message || 'Could not read ads.' });

  const adRows = adsResult.json?.data || [];
  const adSetIds = Array.from(new Set(adRows.map((ad: any) => ad.adset_id).filter(Boolean)));
  const campaignIds = Array.from(new Set(adRows.map((ad: any) => ad.campaign_id).filter(Boolean)));

  const [adSetResults, campaignResults] = await Promise.all([
    Promise.all(adSetIds.map((id) => metaGet(String(id), { fields: 'id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,optimization_goal,billing_event,bid_strategy,targeting' }))),
    Promise.all(campaignIds.map((id) => metaGet(String(id), { fields: 'id,name,status,effective_status,objective,buying_type' })))
  ]);

  const adSets = new Map<string, any>();
  adSetResults.forEach((result) => { if (result.response.ok && result.json?.id) adSets.set(result.json.id, result.json); });
  const campaigns = new Map<string, any>();
  campaignResults.forEach((result) => { if (result.response.ok && result.json?.id) campaigns.set(result.json.id, result.json); });

  const ads = adRows.map((ad: any) => {
    const adSet = adSets.get(ad.adset_id) || {};
    const campaign = campaigns.get(ad.campaign_id) || {};
    return {
      id: ad.id,
      name: ad.name || ad.id,
      status: ad.status || '—',
      effectiveStatus: ad.effective_status || '—',
      campaign: { id: ad.campaign_id || '—', name: campaign.name || 'Not returned by Meta', objective: campaign.objective || '—', status: campaign.effective_status || campaign.status || '—' },
      adSet: { id: ad.adset_id || '—', name: adSet.name || 'Not returned by Meta', status: adSet.effective_status || adSet.status || '—', dailyBudget: moneyFromMinorUnits(adSet.daily_budget), lifetimeBudget: moneyFromMinorUnits(adSet.lifetime_budget), optimizationGoal: adSet.optimization_goal || '—', billingEvent: adSet.billing_event || '—', bidStrategy: adSet.bid_strategy || '—', targeting: summarizeTargeting(adSet.targeting) },
      creative: getCreativeText(ad.creative)
    };
  });

  return Response.json({ ok: true, source: 'meta_ad_reviewer_setup_active_account', adAccountId: configured, ads, checkedAt: new Date().toISOString() });
}
