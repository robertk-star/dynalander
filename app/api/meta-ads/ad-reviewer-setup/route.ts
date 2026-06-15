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

function chooseValue(candidates: Array<{ value: string; source: string }>) {
  const found = candidates.find((item) => item.value);
  return { value: found?.value || 'Not returned by Meta', source: found?.source || 'not_found' };
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

  const primaryText = chooseValue([{ value: link.message, source: 'object_story_spec.link_data.message' }, { value: video.message, source: 'object_story_spec.video_data.message' }, { value: assetBody, source: 'asset_feed_spec.bodies' }, { value: creative?.body, source: 'creative.body' }, { value: postMessage, source: 'page_post.message_or_story' }]);
  const headline = chooseValue([{ value: link.name, source: 'object_story_spec.link_data.name' }, { value: video.title, source: 'object_story_spec.video_data.title' }, { value: assetTitle, source: 'asset_feed_spec.titles' }, { value: creative?.title, source: 'creative.title' }, { value: postAttachment?.title, source: 'page_post.attachment.title' }]);
  const description = chooseValue([{ value: link.description, source: 'object_story_spec.link_data.description' }, { value: assetDescription, source: 'asset_feed_spec.descriptions' }, { value: postAttachment?.description, source: 'page_post.attachment.description' }]);
  const ctaValue = chooseValue([{ value: cta.type, source: 'object_story_spec.call_to_action.type' }, { value: firstText(assetFeed.call_to_action_types, 'type'), source: 'asset_feed_spec.call_to_action_types' }]);
  const destinationUrl = chooseValue([{ value: link.link, source: 'object_story_spec.link_data.link' }, { value: cta.value?.link, source: 'object_story_spec.call_to_action.value.link' }, { value: assetLink, source: 'asset_feed_spec.link_urls' }, { value: creative?.template_url, source: 'creative.template_url' }, { value: postAttachment?.url, source: 'page_post.attachment.url' }]);
  const image = chooseValue([{ value: link.picture, source: 'object_story_spec.link_data.picture' }, { value: assetImage, source: 'asset_feed_spec.images' }, { value: creative?.image_url, source: 'creative.image_url' }, { value: creative?.thumbnail_url, source: 'creative.thumbnail_url' }, { value: postMedia?.image?.src, source: 'page_post.attachment.media.image' }]);

  return {
    primaryText: primaryText.value,
    headline: headline.value,
    description: description.value,
    cta: ctaValue.value,
    destinationUrl: destinationUrl.value,
    imageUrl: image.value === 'Not returned by Meta' ? '' : image.value,
    format: video.video_id ? 'Video' : assetFeed.images ? 'Dynamic creative' : link.picture ? 'Image / Link' : postAttachment?.media_type || 'Not returned by Meta',
    objectStoryId: creative?.effective_object_story_id || creative?.object_story_id || 'Not returned by Meta',
    urlTags: creative?.url_tags || 'Not returned by Meta',
    directCreativeRead: creative?.__directCreativeRead || false,
    directCreativeError: creative?.__directCreativeError || null,
    readSource: assetBody || assetTitle || assetDescription ? 'asset_feed_spec' : postMessage || postAttachment?.title ? 'object_story' : link.message || link.name ? 'object_story_spec' : creative?.body || creative?.title ? 'creative_fields' : 'limited',
    fieldSources: { primaryText: primaryText.source, headline: headline.source, description: description.source, cta: ctaValue.source, destinationUrl: destinationUrl.source, imageUrl: image.source }
  };
}

function summarizeTargeting(targeting: any) {
  const geo = targeting?.geo_locations || {};
  const customAudiences = targeting?.custom_audiences || [];
  const excludedCustomAudiences = targeting?.excluded_custom_audiences || [];
  return {
    ageMin: targeting?.age_min || '—', ageMax: targeting?.age_max || '—', genders: Array.isArray(targeting?.genders) && targeting.genders.length ? targeting.genders.join(', ') : 'All / not specified', countries: Array.isArray(geo.countries) && geo.countries.length ? geo.countries.join(', ') : 'Not returned by Meta', regions: Array.isArray(geo.regions) ? geo.regions.map((item: any) => item.name || item.key).filter(Boolean).join(', ') : '', cities: Array.isArray(geo.cities) ? geo.cities.map((item: any) => item.name || item.key).filter(Boolean).join(', ') : '', customAudienceCount: customAudiences.length, customAudiences: customAudiences.map((item: any) => item.name || item.id).filter(Boolean), excludedCustomAudienceCount: excludedCustomAudiences.length, excludedCustomAudiences: excludedCustomAudiences.map((item: any) => item.name || item.id).filter(Boolean), publisherPlatforms: Array.isArray(targeting?.publisher_platforms) ? targeting.publisher_platforms.join(', ') : 'Not returned by Meta', rawReturned: Boolean(targeting)
  };
}

function mergeAds(...groups: any[][]) {
  const map = new Map<string, any>();
  groups.flat().forEach((ad) => { if (ad?.id && !map.has(ad.id)) map.set(ad.id, ad); });
  return Array.from(map.values());
}

function statusBreakdown(rows: any[]) {
  return rows.reduce((acc: Record<string, number>, ad: any) => { const key = ad.effective_status || ad.status || 'UNKNOWN'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
}

async function readAds(configured: string) {
  const deepFields = 'id,name,status,effective_status,campaign_id,adset_id,created_time,updated_time,creative{id,name,title,body,image_url,thumbnail_url,object_story_spec,asset_feed_spec,effective_object_story_id,object_story_id,url_tags,template_url}';
  const safeFields = 'id,name,status,effective_status,campaign_id,adset_id,created_time,updated_time,creative{id,name,title,body,image_url,thumbnail_url,object_story_spec}';
  const statusFilter = JSON.stringify([{ field: 'effective_status', operator: 'IN', value: ['ACTIVE', 'PAUSED', 'IN_PROCESS', 'WITH_ISSUES', 'PENDING_REVIEW', 'DISAPPROVED', 'CAMPAIGN_PAUSED', 'ADSET_PAUSED'] }]);
  const deep = await metaGet(`${configured}/ads`, { fields: deepFields, limit: '500' });
  const filtered = await metaGet(`${configured}/ads`, { fields: deepFields, limit: '500', filtering: statusFilter });
  if (deep.response.ok || filtered.response.ok) {
    const rows = mergeAds(deep.response.ok ? (deep.json?.data || []) : [], filtered.response.ok ? (filtered.json?.data || []) : []);
    return { response: { ok: true }, json: { data: rows }, creativeMode: 'deep_expanded', adDiscovery: { unfilteredCount: deep.json?.data?.length || 0, filteredCount: filtered.json?.data?.length || 0, mergedCount: rows.length, statusBreakdown: statusBreakdown(rows), filteredError: filtered.response.ok ? null : filtered.json?.error?.message || null, unfilteredError: deep.response.ok ? null : deep.json?.error?.message || null } };
  }
  const safe = await metaGet(`${configured}/ads`, { fields: safeFields, limit: '500' });
  return { ...safe, creativeMode: safe.response.ok ? 'safe_fallback' : 'failed', creativeWarning: deep.json?.error?.message || filtered.json?.error?.message || null, adDiscovery: { unfilteredCount: safe.json?.data?.length || 0, filteredCount: 0, mergedCount: safe.json?.data?.length || 0, statusBreakdown: statusBreakdown(safe.json?.data || []) } };
}

async function readCreativeById(creativeId: string | undefined) {
  if (!creativeId) return null;
  const deepFields = 'id,name,title,body,image_url,thumbnail_url,object_story_spec,asset_feed_spec,effective_object_story_id,object_story_id,url_tags,template_url';
  const result = await metaGet(creativeId, { fields: deepFields });
  if (result.response.ok) return { ...result.json, __directCreativeRead: true };
  return { __directCreativeRead: false, __directCreativeError: result.json?.error?.message || 'Direct creative read failed.' };
}

async function readPostByStoryId(storyId: string | undefined) { if (!storyId) return null; const result = await metaGet(storyId, { fields: 'message,story,attachments{title,description,url,media,media_type}' }); return result.response.ok ? result.json : null; }
function mergeCreative(nestedCreative: any, directCreative: any) { if (!directCreative || directCreative.__directCreativeRead === false) return { ...(nestedCreative || {}), __directCreativeRead: false, __directCreativeError: directCreative?.__directCreativeError || null }; return { ...(nestedCreative || {}), ...directCreative, __directCreativeRead: true }; }

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
  const [adSetResults, campaignResults, directCreativeResults] = await Promise.all([Promise.all(adSetIds.map((id) => metaGet(String(id), { fields: 'id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,optimization_goal,billing_event,bid_strategy,targeting' }))), Promise.all(campaignIds.map((id) => metaGet(String(id), { fields: 'id,name,status,effective_status,objective,buying_type' }))), Promise.all(adRows.map((ad: any) => readCreativeById(ad.creative?.id)))]);
  const mergedCreatives = adRows.map((ad: any, index: number) => mergeCreative(ad.creative, directCreativeResults[index]));
  const postResults = await Promise.all(mergedCreatives.map((creative: any) => readPostByStoryId(creative?.effective_object_story_id || creative?.object_story_id)));
  const adSets = new Map<string, any>(); adSetResults.forEach((result) => { if (result.response.ok && result.json?.id) adSets.set(result.json.id, result.json); });
  const campaigns = new Map<string, any>(); campaignResults.forEach((result) => { if (result.response.ok && result.json?.id) campaigns.set(result.json.id, result.json); });
  const ads = adRows.map((ad: any, index: number) => { const adSet = adSets.get(ad.adset_id) || {}; const campaign = campaigns.get(ad.campaign_id) || {}; return { id: ad.id, name: ad.name || ad.id, status: ad.status || '—', effectiveStatus: ad.effective_status || '—', campaign: { id: ad.campaign_id || '—', name: campaign.name || 'Not returned by Meta', objective: campaign.objective || '—', status: campaign.effective_status || campaign.status || '—' }, adSet: { id: ad.adset_id || '—', name: adSet.name || 'Not returned by Meta', status: adSet.effective_status || adSet.status || '—', dailyBudget: moneyFromMinorUnits(adSet.daily_budget), lifetimeBudget: moneyFromMinorUnits(adSet.lifetime_budget), optimizationGoal: adSet.optimization_goal || '—', billingEvent: adSet.billing_event || '—', bidStrategy: adSet.bid_strategy || '—', targeting: summarizeTargeting(adSet.targeting) }, creative: getCreativeText(mergedCreatives[index], postResults[index]) }; });
  return Response.json({ ok: true, source: 'meta_ad_reviewer_setup_active_account', creativeMode: adsResult.creativeMode, creativeWarning: adsResult.creativeWarning || null, adDiscovery: adsResult.adDiscovery || null, adAccountId: configured, ads, checkedAt: new Date().toISOString() });
}
