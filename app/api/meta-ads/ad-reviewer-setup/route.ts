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

function firstText(items: any[] | undefined, key = 'text') {
  if (!Array.isArray(items)) return '';
  const found = items.find((item) => item?.[key]);
  return found?.[key] || '';
}

function firstAsset(items: any[] | undefined) {
  if (!Array.isArray(items)) return '';
  const found = items.find((item) => item?.url || item?.website_url || item?.link || item?.thumbnail_url);
  return found?.url || found?.website_url || found?.link || found?.thumbnail_url || '';
}

function getCreativeText(creative: any, post: any) {
  const spec = creative?.object_story_spec || {};
  const link = spec.link_data || {};
  const video = spec.video_data || {};
  const cta = link.call_to_action || video.call_to_action || {};
  const assetFeed = creative?.asset_feed_spec || {};
  const assetTitle = firstText(assetFeed.titles);
  const assetBody = firstText(assetFeed.bodies);
  const assetDescription = firstText(assetFeed.descriptions);
  const assetLink = firstAsset(assetFeed.link_urls);
  const assetImage = firstAsset(assetFeed.images);
  const postMessage = post?.message || post?.story || '';
  const postAttachment = post?.attachments?.data?.[0] || {};
  const postMedia = postAttachment?.media || {};

  return {
    primaryText: link.message || video.message || assetBody || creative?.body || postMessage || 'Not returned by Meta',
    headline: link.name || video.title || assetTitle || creative?.title || postAttachment?.title || 'Not returned by Meta',
    description: link.description || assetDescription || postAttachment?.description || 'Not returned by Meta',
    cta: cta.type || firstText(assetFeed.call_to_action_types, 'type') || 'Not returned by Meta',
    destinationUrl: link.link || cta.value?.link || assetLink || creative?.template_url || postAttachment?.url || 'Not returned by Meta',
    imageUrl: link.picture || assetImage || creative?.image_url || creative?.thumbnail_url || postMedia?.image?.src || '',
    format: video.video_id ? 'Video' : assetFeed.images ? 'Dynamic creative' : link.picture ? 'Image / Link' : postAttachment?.media_type || 'Not returned by Meta',
    objectStoryId: creative?.effective_object_story_id || creative?.object_story_id || 'Not returned by Meta',
    urlTags: creative?.url_tags || 'Not returned by Meta',
    readSource: assetBody || assetTitle || assetDescription ? 'asset_feed_spec' : postMessage || postAttachment?.title ? 'object_story' : link.message || link.name ? 'object_story_spec' : creative?.body || creative?.title ? 'creative_fields' : 'limited'
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

async function readAds(configured: string) {
  const deepFields = 'id,name,status,effective_status,campaign_id,adset_id,creative{id,name,title,body,image_url,thumbnail_url,object_story_spec,asset_feed_spec,effective_object_story_id,object_story_id,url_tags,template_url}';
  const safeFields = 'id,name,status,effective_status,campaign_id,adset_id,creative{id,name,title,body,image_url,thumbnail_url,object_story_spec}';
  const deep = await metaGet(`${configured}/ads`, { fields: deepFields, limit: '100' });
  if (deep.response.ok) return { ...deep, creativeMode: 'deep' };
  const safe = await metaGet(`${configured}/ads`, { fields: safeFields, limit: '100' });
  return { ...safe, creativeMode: safe.response.ok ? 'safe_fallback' : 'failed', creativeWarning: deep.json?.error?.message || null };
}

async function readPostByStoryId(storyId: string | undefined) {
  if (!storyId) return null;
  const result = await metaGet(storyId, { fields: 'message,story,attachments{title,description,url,media,media_type}' });
  return result.response.ok ? result.json : null;
}

export async function GET(request: Request) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const url = new URL(request.url);
  const requested = normalizeAdAccountId(url.searchParams.get('accountKey') || url.searchParams.get('adAccountId'));
  const configured = normalizeAdAccountId(context.adAccountId);

  if (!env.configured || !configured) return Response.json({ ok: false, source: 'not_configured', ads: [], error: 'Meta ENV is not configured.' });
  if (requested && requested !== configured && requested !== 'act_meta-connected-account') return Response.json({ ok: false, source: 'active_account_mismatch', ads: [], requestedAdAccountId: requested, configuredAdAccountId: configured, error: 'Selected active account does not match connected Meta account.' });

  const adsResult = await readAds(configured);
  if (!adsResult.response.ok) return Response.json({ ok: false, source: 'ad_setup_failed', ads: [], error: adsResult.json?.error?.message || 'Could not read ads.' });

  const adRows = adsResult.json?.data || [];
  const adSetIds = Array.from(new Set(adRows.map((ad: any) => ad.adset_id).filter(Boolean)));
  const campaignIds = Array.from(new Set(adRows.map((ad: any) => ad.campaign_id).filter(Boolean)));

  const [adSetResults, campaignResults, postResults] = await Promise.all([
    Promise.all(adSetIds.map((id) => metaGet(String(id), { fields: 'id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,optimization_goal,billing_event,bid_strategy,targeting' }))),
    Promise.all(campaignIds.map((id) => metaGet(String(id), { fields: 'id,name,status,effective_status,objective,buying_type' }))),
    Promise.all(adRows.map((ad: any) => readPostByStoryId(ad.creative?.effective_object_story_id || ad.creative?.object_story_id)))
  ]);

  const adSets = new Map<string, any>();
  adSetResults.forEach((result) => { if (result.response.ok && result.json?.id) adSets.set(result.json.id, result.json); });
  const campaigns = new Map<string, any>();
  campaignResults.forEach((result) => { if (result.response.ok && result.json?.id) campaigns.set(result.json.id, result.json); });

  const ads = adRows.map((ad: any, index: number) => {
    const adSet = adSets.get(ad.adset_id) || {};
    const campaign = campaigns.get(ad.campaign_id) || {};
    return {
      id: ad.id,
      name: ad.name || ad.id,
      status: ad.status || '—',
      effectiveStatus: ad.effective_status || '—',
      campaign: { id: ad.campaign_id || '—', name: campaign.name || 'Not returned by Meta', objective: campaign.objective || '—', status: campaign.effective_status || campaign.status || '—' },
      adSet: { id: ad.adset_id || '—', name: adSet.name || 'Not returned by Meta', status: adSet.effective_status || adSet.status || '—', dailyBudget: moneyFromMinorUnits(adSet.daily_budget), lifetimeBudget: moneyFromMinorUnits(adSet.lifetime_budget), optimizationGoal: adSet.optimization_goal || '—', billingEvent: adSet.billing_event || '—', bidStrategy: adSet.bid_strategy || '—', targeting: summarizeTargeting(adSet.targeting) },
      creative: getCreativeText(ad.creative, postResults[index])
    };
  });

  return Response.json({ ok: true, source: 'meta_ad_reviewer_setup_active_account', creativeMode: adsResult.creativeMode, creativeWarning: adsResult.creativeWarning || null, adAccountId: configured, ads, checkedAt: new Date().toISOString() });
}
