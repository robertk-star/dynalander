import { getDemoAccountMap } from '../../../../lib/accounts/demoAccountMap';
import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

function normalizePlatform(value: string | null | undefined) {
  return value === 'meta_ads' ? 'meta_ads' : 'google_ads';
}

function keyFor(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const accountKey = url.searchParams.get('accountKey') || 'cash-offer-demo';
  const adPlatform = normalizePlatform(url.searchParams.get('adPlatform'));
  const ids = getDemoAccountMap(accountKey);
  const client = getDatabaseClient();

  if (!client) return Response.json({ ok: false, source: 'local', statuses: {} });

  const { data, error } = await client
    .from('recommendation_action_status')
    .select('recommendation_key,status,updated_at')
    .eq('client_id', ids.clientId)
    .eq('google_ads_account_id', ids.googleAdsAccountId)
    .eq('ad_platform', adPlatform);

  if (error) return Response.json({ ok: false, source: 'database', error: error.message, statuses: {} }, { status: 500 });

  const statuses = Object.fromEntries((data || []).map((row: any) => [row.recommendation_key, row.status]));
  return Response.json({ ok: true, source: 'database', adPlatform, statuses });
}

export async function POST(request: Request) {
  const body = await request.json();
  const ids = getDemoAccountMap(body.accountKey || 'cash-offer-demo');
  const adPlatform = normalizePlatform(body.adPlatform);
  const client = getDatabaseClient();
  const recommendationTitle = String(body.recommendationTitle || body.recommendation || '');
  const recommendationKey = String(body.recommendationKey || keyFor(recommendationTitle));
  const status = String(body.status || 'Open');

  if (!client) return Response.json({ ok: false, source: 'local', error: 'Database is not configured.' });
  if (!recommendationKey || !recommendationTitle) return Response.json({ ok: false, source: 'database', error: 'Missing recommendation.' }, { status: 400 });

  const payload = {
    client_id: ids.clientId,
    google_ads_account_id: ids.googleAdsAccountId,
    ad_platform: adPlatform,
    recommendation_key: recommendationKey,
    recommendation_title: recommendationTitle,
    status,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('recommendation_action_status')
    .upsert(payload, { onConflict: 'client_id,google_ads_account_id,ad_platform,recommendation_key' })
    .select('recommendation_key,status,updated_at')
    .single();

  if (error) return Response.json({ ok: false, source: 'database', error: error.message }, { status: 500 });

  return Response.json({ ok: true, source: 'database', adPlatform, status: data.status, recommendationKey: data.recommendation_key, updatedAt: data.updated_at });
}
