import { createHash, randomUUID } from 'crypto';
import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';
import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

type EntityLevel = 'campaign' | 'ad_set' | 'ad';
type SnapshotItem = { account_key: string; meta_account_id: string; snapshot_run_id: string; entity_level: EntityLevel; entity_id: string; entity_name: string; parent_campaign_id?: string; parent_campaign_name?: string; parent_ad_set_id?: string; parent_ad_set_name?: string; setup_hash: string; setup_json: Record<string, any> };

function normalizeAdAccountId(value: string | null) { if (!value) return null; return value.startsWith('act_') ? value : `act_${value}`; }
function stableStringify(value: any): string { if (value === null || typeof value !== 'object') return JSON.stringify(value); if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`; return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`; }
function hash(value: any) { return createHash('sha256').update(stableStringify(value)).digest('hex'); }
function valueText(value: any): string { if (value === undefined || value === null || value === '') return ''; if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value); return stableStringify(value); }
function getPath(object: any, path: string) { return path.split('.').reduce((current, key) => current?.[key], object); }
function importance(field: string) { return ['status','effective_status','daily_budget','lifetime_budget','objective','optimization_goal','billing_event','bid_strategy','targeting','promoted_object','destination_url','cta','creative_id'].includes(field) ? 'high' : field === 'name' ? 'low' : 'medium'; }

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

function creativeFields(ad: any) {
  const creative = ad.creative || {};
  const spec = creative.object_story_spec || {};
  const link = spec.link_data || {};
  const video = spec.video_data || {};
  const asset = creative.asset_feed_spec || {};
  return {
    creative_id: creative.id || '',
    creative_name: creative.name || '',
    primary_text: link.message || video.message || creative.body || asset.bodies?.[0]?.text || '',
    headline: link.name || video.title || creative.title || asset.titles?.[0]?.text || '',
    description: link.description || asset.descriptions?.[0]?.text || '',
    cta: link.call_to_action?.type || video.call_to_action?.type || asset.call_to_action_types?.[0] || '',
    destination_url: link.link || video.call_to_action?.value?.link || asset.link_urls?.[0]?.website_url || ''
  };
}

async function readMetaSetup(accountKey: string, configured: string, runId: string): Promise<SnapshotItem[]> {
  const [campaignResult, adSetResult, adResult] = await Promise.all([
    metaGet(`${configured}/campaigns`, { fields: 'id,name,status,effective_status,objective,buying_type,daily_budget,lifetime_budget,bid_strategy', limit: '100' }),
    metaGet(`${configured}/adsets`, { fields: 'id,name,campaign_id,campaign{name},status,effective_status,daily_budget,lifetime_budget,bid_strategy,billing_event,optimization_goal,destination_type,targeting,promoted_object', limit: '100' }),
    metaGet(`${configured}/ads`, { fields: 'id,name,campaign_id,adset_id,status,effective_status,creative{id,name,title,body,object_story_spec,asset_feed_spec}', limit: '100' })
  ]);
  if (!campaignResult.response.ok) throw new Error(campaignResult.json?.error?.message || 'Could not read campaigns.');
  if (!adSetResult.response.ok) throw new Error(adSetResult.json?.error?.message || 'Could not read ad sets.');
  if (!adResult.response.ok) throw new Error(adResult.json?.error?.message || 'Could not read ads.');

  const campaignMap = new Map<string, any>((campaignResult.json?.data || []).map((row: any) => [row.id, row]));
  const adSetMap = new Map<string, any>((adSetResult.json?.data || []).map((row: any) => [row.id, row]));
  const items: SnapshotItem[] = [];

  for (const row of campaignResult.json?.data || []) {
    const setup = { name: row.name || '', status: row.status || '', effective_status: row.effective_status || '', objective: row.objective || '', buying_type: row.buying_type || '', daily_budget: row.daily_budget || '', lifetime_budget: row.lifetime_budget || '', bid_strategy: row.bid_strategy || '' };
    items.push({ account_key: accountKey, meta_account_id: configured, snapshot_run_id: runId, entity_level: 'campaign', entity_id: row.id, entity_name: row.name || '', setup_hash: hash(setup), setup_json: setup });
  }

  for (const row of adSetResult.json?.data || []) {
    const campaign = row.campaign || campaignMap.get(row.campaign_id) || {};
    const setup = { name: row.name || '', status: row.status || '', effective_status: row.effective_status || '', daily_budget: row.daily_budget || '', lifetime_budget: row.lifetime_budget || '', bid_strategy: row.bid_strategy || '', billing_event: row.billing_event || '', optimization_goal: row.optimization_goal || '', destination_type: row.destination_type || '', targeting: row.targeting || null, promoted_object: row.promoted_object || null };
    items.push({ account_key: accountKey, meta_account_id: configured, snapshot_run_id: runId, entity_level: 'ad_set', entity_id: row.id, entity_name: row.name || '', parent_campaign_id: row.campaign_id || '', parent_campaign_name: campaign.name || '', setup_hash: hash(setup), setup_json: setup });
  }

  for (const row of adResult.json?.data || []) {
    const adSet = adSetMap.get(row.adset_id) || {};
    const campaign = campaignMap.get(row.campaign_id) || {};
    const setup = { name: row.name || '', status: row.status || '', effective_status: row.effective_status || '', ...creativeFields(row) };
    items.push({ account_key: accountKey, meta_account_id: configured, snapshot_run_id: runId, entity_level: 'ad', entity_id: row.id, entity_name: row.name || '', parent_campaign_id: row.campaign_id || '', parent_campaign_name: campaign.name || '', parent_ad_set_id: row.adset_id || '', parent_ad_set_name: adSet.name || '', setup_hash: hash(setup), setup_json: setup });
  }
  return items;
}

const fieldsByLevel: Record<EntityLevel, string[]> = {
  campaign: ['name','status','effective_status','objective','buying_type','daily_budget','lifetime_budget','bid_strategy'],
  ad_set: ['name','status','effective_status','daily_budget','lifetime_budget','bid_strategy','billing_event','optimization_goal','destination_type','targeting','promoted_object'],
  ad: ['name','status','effective_status','creative_id','creative_name','primary_text','headline','description','cta','destination_url']
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const accountKey = String(body.accountKey || body.adAccountId || 'act_meta-connected-account');
  const configured = normalizeAdAccountId(getMetaAdsAccountContext().adAccountId);
  const selected = normalizeAdAccountId(accountKey);
  const env = getMetaAdsEnvStatus();
  const db = getDatabaseClient();
  if (!env.configured || !configured) return Response.json({ ok: false, error: 'Meta ENV is not configured.' }, { status: 400 });
  if (selected && selected !== configured && selected !== 'act_meta-connected-account') return Response.json({ ok: false, error: 'Selected active account does not match connected Meta account.' }, { status: 400 });
  if (!db) return Response.json({ ok: false, error: 'Database is not configured.' }, { status: 400 });

  const runId = randomUUID();
  const items = await readMetaSetup(accountKey, configured, runId);
  const { data: previousRows, error: previousError } = await db.from('meta_live_snapshots').select('id,entity_level,entity_id,setup_hash,setup_json').eq('account_key', accountKey).order('snapshot_at', { ascending: false }).limit(1000);
  if (previousError) return Response.json({ ok: false, error: previousError.message }, { status: 500 });

  const previousByEntity = new Map<string, any>();
  for (const row of previousRows || []) {
    const key = `${row.entity_level}:${row.entity_id}`;
    if (!previousByEntity.has(key)) previousByEntity.set(key, row);
  }

  const { data: inserted, error: insertError } = await db.from('meta_live_snapshots').insert(items).select('id,entity_level,entity_id,entity_name,parent_campaign_name,parent_ad_set_name,setup_json');
  if (insertError) return Response.json({ ok: false, error: insertError.message }, { status: 500 });

  const changes: any[] = [];
  for (const current of inserted || []) {
    const previous = previousByEntity.get(`${current.entity_level}:${current.entity_id}`);
    if (!previous) continue;
    for (const field of fieldsByLevel[current.entity_level as EntityLevel]) {
      const oldValue = valueText(getPath(previous.setup_json, field));
      const newValue = valueText(getPath(current.setup_json, field));
      if (oldValue === newValue) continue;
      changes.push({ account_key: accountKey, meta_account_id: configured, snapshot_run_id: runId, entity_level: current.entity_level, entity_id: current.entity_id, entity_name: current.entity_name, parent_campaign_name: current.parent_campaign_name, parent_ad_set_name: current.parent_ad_set_name, field_name: field, old_value: oldValue, new_value: newValue, old_snapshot_id: previous.id, new_snapshot_id: current.id, change_importance: importance(field), detected_at: new Date().toISOString() });
    }
  }

  if (changes.length) {
    const { error: changeError } = await db.from('meta_live_change_events').insert(changes);
    if (changeError) return Response.json({ ok: false, error: changeError.message, snapshotsSaved: inserted?.length || 0, changesDetected: changes.length }, { status: 500 });
  }

  return Response.json({ ok: true, source: 'live_meta_snapshot_compare', snapshotRunId: runId, snapshotsSaved: inserted?.length || 0, changesDetected: changes.length, changes });
}
