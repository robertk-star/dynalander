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

function moneyFromCents(value: string | number | undefined) {
  if (value === undefined || value === null || value === '') return 'Not returned by Meta';
  return `$${(Number(value) / 100).toFixed(2)}`;
}

function text(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'Not returned by Meta';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  try { return JSON.stringify(value, null, 2); } catch { return 'Not returned by Meta'; }
}

function list(value: unknown): string {
  if (!value) return 'Not returned by Meta';
  if (Array.isArray(value)) return value.length ? value.map((item) => text(item)).join(', ') : 'None returned';
  return text(value);
}

function creativeFields(ad: any) {
  const creative = ad.creative || {};
  const spec = creative.object_story_spec || {};
  const link = spec.link_data || {};
  const video = spec.video_data || {};
  const asset = creative.asset_feed_spec || {};
  return {
    creative_id: text(creative.id),
    creative_name: text(creative.name),
    primary_text: text(link.message || video.message || creative.body || asset.bodies?.[0]?.text),
    headline: text(link.name || video.title || creative.title || asset.titles?.[0]?.text),
    description: text(link.description || asset.descriptions?.[0]?.text),
    call_to_action: text(link.call_to_action?.type || video.call_to_action?.type || asset.call_to_action_types?.[0]),
    destination_url: text(link.link || video.call_to_action?.value?.link || asset.link_urls?.[0]?.website_url),
    asset_feed_spec: text(asset),
    object_story_spec: text(spec)
  };
}

function campaignDetails(row: any) {
  return [
    ['Campaign ID', text(row.id)],
    ['Name', text(row.name)],
    ['Status', text(row.status)],
    ['Effective status', text(row.effective_status)],
    ['Objective', text(row.objective)],
    ['Buying type', text(row.buying_type)],
    ['Bid strategy', text(row.bid_strategy)],
    ['Daily budget', moneyFromCents(row.daily_budget)],
    ['Lifetime budget', moneyFromCents(row.lifetime_budget)],
    ['Spend cap', moneyFromCents(row.spend_cap)],
    ['Budget remaining', moneyFromCents(row.budget_remaining)],
    ['Start time', text(row.start_time)],
    ['Stop time', text(row.stop_time)],
    ['Created time', text(row.created_time)],
    ['Updated time', text(row.updated_time)],
    ['Special ad categories', list(row.special_ad_categories)],
    ['Configured status', text(row.configured_status)]
  ];
}

function adSetDetails(row: any) {
  const targeting = row.targeting || {};
  return [
    ['Ad set ID', text(row.id)],
    ['Name', text(row.name)],
    ['Campaign', text(row.campaign?.name || row.campaign_id)],
    ['Status', text(row.status)],
    ['Effective status', text(row.effective_status)],
    ['Configured status', text(row.configured_status)],
    ['Daily budget', moneyFromCents(row.daily_budget)],
    ['Lifetime budget', moneyFromCents(row.lifetime_budget)],
    ['Bid amount', moneyFromCents(row.bid_amount)],
    ['Bid strategy', text(row.bid_strategy)],
    ['Billing event', text(row.billing_event)],
    ['Optimization goal', text(row.optimization_goal)],
    ['Destination type', text(row.destination_type)],
    ['Promoted object', text(row.promoted_object)],
    ['Start time', text(row.start_time)],
    ['End time', text(row.end_time)],
    ['Attribution spec', text(row.attribution_spec)],
    ['Publisher platforms', list(targeting.publisher_platforms)],
    ['Facebook positions', list(targeting.facebook_positions)],
    ['Instagram positions', list(targeting.instagram_positions)],
    ['Messenger positions', list(targeting.messenger_positions)],
    ['Audience Network positions', list(targeting.audience_network_positions)],
    ['Device platforms', list(targeting.device_platforms)],
    ['User OS', list(targeting.user_os)],
    ['User device', list(targeting.user_device)],
    ['Wireless carrier', list(targeting.wireless_carrier)],
    ['Age min', text(targeting.age_min)],
    ['Age max', text(targeting.age_max)],
    ['Genders', list(targeting.genders)],
    ['Geo locations', text(targeting.geo_locations)],
    ['Custom audiences', text(targeting.custom_audiences)],
    ['Excluded custom audiences', text(targeting.excluded_custom_audiences)],
    ['Flexible spec', text(targeting.flexible_spec)],
    ['Exclusions', text(targeting.exclusions)],
    ['Raw targeting JSON', text(targeting)]
  ];
}

function adDetails(row: any, adSetMap: Map<string, any>, campaignMap: Map<string, any>) {
  const creative = creativeFields(row);
  const adSet = adSetMap.get(row.adset_id) || {};
  const campaign = campaignMap.get(row.campaign_id) || {};
  return [
    ['Ad ID', text(row.id)],
    ['Name', text(row.name)],
    ['Campaign', text(campaign.name || row.campaign_id)],
    ['Ad set', text(adSet.name || row.adset_id)],
    ['Status', text(row.status)],
    ['Effective status', text(row.effective_status)],
    ['Configured status', text(row.configured_status)],
    ['Created time', text(row.created_time)],
    ['Updated time', text(row.updated_time)],
    ['Creative ID', creative.creative_id],
    ['Creative name', creative.creative_name],
    ['Primary text', creative.primary_text],
    ['Headline', creative.headline],
    ['Description', creative.description],
    ['CTA', creative.call_to_action],
    ['Destination URL', creative.destination_url],
    ['Asset feed spec', creative.asset_feed_spec],
    ['Object story spec', creative.object_story_spec]
  ];
}

export async function GET(request: Request) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const url = new URL(request.url);
  const selected = normalizeAdAccountId(url.searchParams.get('accountKey') || url.searchParams.get('adAccountId'));
  const configured = normalizeAdAccountId(context.adAccountId);

  if (!env.configured || !configured) return Response.json({ ok: false, error: 'Meta ENV is not configured.', campaigns: [], adSets: [], ads: [] });
  if (selected && selected !== configured && selected !== 'act_meta-connected-account') return Response.json({ ok: false, error: 'Selected active account does not match connected Meta account.', campaigns: [], adSets: [], ads: [] });

  const [campaignResult, adSetResult, adResult] = await Promise.all([
    metaGet(`${configured}/campaigns`, { fields: 'id,name,status,effective_status,configured_status,objective,buying_type,daily_budget,lifetime_budget,spend_cap,budget_remaining,bid_strategy,start_time,stop_time,created_time,updated_time,special_ad_categories', limit: '200' }),
    metaGet(`${configured}/adsets`, { fields: 'id,name,campaign_id,campaign{name},status,effective_status,configured_status,daily_budget,lifetime_budget,bid_amount,bid_strategy,billing_event,optimization_goal,destination_type,promoted_object,start_time,end_time,attribution_spec,targeting,created_time,updated_time', limit: '200' }),
    metaGet(`${configured}/ads`, { fields: 'id,name,campaign_id,adset_id,status,effective_status,configured_status,creative{id,name,title,body,object_story_spec,asset_feed_spec},created_time,updated_time', limit: '200' })
  ]);

  if (!campaignResult.response.ok) return Response.json({ ok: false, error: campaignResult.json?.error?.message || 'Could not read campaigns.', campaigns: [], adSets: [], ads: [] });
  if (!adSetResult.response.ok) return Response.json({ ok: false, error: adSetResult.json?.error?.message || 'Could not read ad sets.', campaigns: [], adSets: [], ads: [] });
  if (!adResult.response.ok) return Response.json({ ok: false, error: adResult.json?.error?.message || 'Could not read ads.', campaigns: [], adSets: [], ads: [] });

  const campaignsRaw = campaignResult.json?.data || [];
  const adSetsRaw = adSetResult.json?.data || [];
  const adsRaw = adResult.json?.data || [];
  const campaignMap = new Map<string, any>(campaignsRaw.map((row: any) => [row.id, row]));
  const adSetMap = new Map<string, any>(adSetsRaw.map((row: any) => [row.id, row]));

  return Response.json({
    ok: true,
    source: 'meta_setup_details_live',
    adAccountId: configured,
    campaigns: campaignsRaw.map((row: any) => ({ id: row.id, name: row.name || row.id, details: campaignDetails(row), raw: row })),
    adSets: adSetsRaw.map((row: any) => ({ id: row.id, name: row.name || row.id, campaignName: row.campaign?.name || row.campaign_id, details: adSetDetails(row), raw: row })),
    ads: adsRaw.map((row: any) => ({ id: row.id, name: row.name || row.id, adSetName: adSetMap.get(row.adset_id)?.name || row.adset_id, campaignName: campaignMap.get(row.campaign_id)?.name || row.campaign_id, details: adDetails(row, adSetMap, campaignMap), raw: row })),
    counts: { campaigns: campaignsRaw.length, adSets: adSetsRaw.length, ads: adsRaw.length },
    checkedAt: new Date().toISOString()
  });
}
