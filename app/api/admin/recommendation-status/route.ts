import { getDemoAccountMap } from '../../../../lib/accounts/demoAccountMap';
import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

function normalizePlatform(value: string | null | undefined) {
  return value === 'meta_ads' ? 'meta_ads' : 'google_ads';
}

function keyFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function mapActivity(row: any) {
  return {
    id: row.id,
    recommendationKey: row.recommendation_key,
    recommendationTitle: row.recommendation_title,
    oldStatus: row.old_status || '—',
    newStatus: row.new_status,
    note: row.note || '',
    assignedTo: row.assigned_to || '',
    changedBy: row.changed_by,
    changeSource: row.change_source,
    changedAt: row.changed_at
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const accountKey = url.searchParams.get('accountKey') || 'cash-offer-demo';
  const adPlatform = normalizePlatform(url.searchParams.get('adPlatform'));
  const ids = getDemoAccountMap(accountKey);
  const client = getDatabaseClient();

  if (!client) return Response.json({ ok: false, source: 'local', statuses: {}, notes: {}, assignments: {}, activity: [] });

  const { data, error } = await client
    .from('recommendation_action_status')
    .select('recommendation_key,status,note,assigned_to,updated_at')
    .eq('client_id', ids.clientId)
    .eq('google_ads_account_id', ids.googleAdsAccountId)
    .eq('ad_platform', adPlatform);

  if (error) return Response.json({ ok: false, source: 'database', error: error.message, statuses: {}, notes: {}, assignments: {}, activity: [] }, { status: 500 });

  const { data: activityData, error: activityError } = await client
    .from('recommendation_activity_log')
    .select('id,recommendation_key,recommendation_title,old_status,new_status,note,assigned_to,changed_by,change_source,changed_at')
    .eq('client_id', ids.clientId)
    .eq('google_ads_account_id', ids.googleAdsAccountId)
    .eq('ad_platform', adPlatform)
    .order('changed_at', { ascending: false })
    .limit(20);

  const statuses = Object.fromEntries((data || []).map((row: any) => [row.recommendation_key, row.status]));
  const notes = Object.fromEntries((data || []).map((row: any) => [row.recommendation_key, row.note || '']));
  const assignments = Object.fromEntries((data || []).map((row: any) => [row.recommendation_key, row.assigned_to || 'Needs review']));
  return Response.json({ ok: true, source: 'database', adPlatform, statuses, notes, assignments, activity: activityError ? [] : (activityData || []).map(mapActivity) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const ids = getDemoAccountMap(body.accountKey || 'cash-offer-demo');
  const adPlatform = normalizePlatform(body.adPlatform);
  const client = getDatabaseClient();
  const recommendationTitle = String(body.recommendationTitle || body.recommendation || '');
  const recommendationKey = String(body.recommendationKey || keyFor(recommendationTitle));
  const status = String(body.status || 'Open');
  const changedBy = String(body.changedBy || 'DynLander Admin');
  const note = String(body.note || '').trim();
  const assignedTo = String(body.assignedTo || 'Needs review');

  if (!client) return Response.json({ ok: false, source: 'local', error: 'Database is not configured.' });
  if (!recommendationKey || !recommendationTitle) return Response.json({ ok: false, source: 'database', error: 'Missing recommendation.' }, { status: 400 });

  const { data: existing } = await client
    .from('recommendation_action_status')
    .select('status,note,assigned_to')
    .eq('client_id', ids.clientId)
    .eq('google_ads_account_id', ids.googleAdsAccountId)
    .eq('ad_platform', adPlatform)
    .eq('recommendation_key', recommendationKey)
    .maybeSingle();

  const oldStatus = existing?.status || null;

  const payload = {
    client_id: ids.clientId,
    google_ads_account_id: ids.googleAdsAccountId,
    ad_platform: adPlatform,
    recommendation_key: recommendationKey,
    recommendation_title: recommendationTitle,
    status,
    note,
    assigned_to: assignedTo,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('recommendation_action_status')
    .upsert(payload, { onConflict: 'client_id,google_ads_account_id,ad_platform,recommendation_key' })
    .select('recommendation_key,status,note,assigned_to,updated_at')
    .single();

  if (error) return Response.json({ ok: false, source: 'database', error: error.message }, { status: 500 });

  const activityPayload = {
    client_id: ids.clientId,
    google_ads_account_id: ids.googleAdsAccountId,
    ad_platform: adPlatform,
    recommendation_key: recommendationKey,
    recommendation_title: recommendationTitle,
    old_status: oldStatus,
    new_status: status,
    note,
    assigned_to: assignedTo,
    changed_by: changedBy,
    change_source: 'recommendation_status_button'
  };

  await client.from('recommendation_activity_log').insert(activityPayload);

  const { data: activityData } = await client
    .from('recommendation_activity_log')
    .select('id,recommendation_key,recommendation_title,old_status,new_status,note,assigned_to,changed_by,change_source,changed_at')
    .eq('client_id', ids.clientId)
    .eq('google_ads_account_id', ids.googleAdsAccountId)
    .eq('ad_platform', adPlatform)
    .order('changed_at', { ascending: false })
    .limit(20);

  return Response.json({ ok: true, source: 'database', adPlatform, status: data.status, note: data.note || '', assignedTo: data.assigned_to || 'Needs review', recommendationKey: data.recommendation_key, updatedAt: data.updated_at, activity: (activityData || []).map(mapActivity) });
}
