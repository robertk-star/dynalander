import { getDemoAccountMap } from '../../../../lib/accounts/demoAccountMap';
import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const accountKey = new URL(request.url).searchParams.get('accountKey') || 'cash-offer-demo';
  const ids = getDemoAccountMap(accountKey);
  const client = getDatabaseClient();

  if (!client) return Response.json({ ok: false, source: 'local', changes: [], error: 'Database is not configured.' });

  const { data, error } = await client
    .from('ad_change_log')
    .select('id,campaign_id,ad_group_id,ad_id,asset_type,asset_position,old_value,new_value,change_source,detected_at,review_after_date')
    .eq('client_id', ids.clientId)
    .eq('google_ads_account_id', ids.googleAdsAccountId)
    .order('detected_at', { ascending: false })
    .limit(50);

  if (error) return Response.json({ ok: false, source: 'database', changes: [], error: error.message }, { status: 500 });

  return Response.json({ ok: true, source: 'database', changes: data ?? [] });
}
