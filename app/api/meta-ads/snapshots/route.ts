import { getDemoAccountMap } from '../../../../lib/accounts/demoAccountMap';
import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const accountKey = new URL(request.url).searchParams.get('accountKey') || 'cash-offer-demo';
  const ids = getDemoAccountMap(accountKey);
  const client = getDatabaseClient();

  if (!client) {
    return Response.json({ ok: false, source: 'local', snapshots: [], error: 'Database is not configured.' });
  }

  const { data, error } = await client
    .from('meta_ad_snapshots')
    .select('id,campaign_name,ad_set_name,ad_id,ad_name,creative_type,destination_url,snapshot_hash,snapshot_at')
    .eq('client_id', ids.clientId)
    .eq('meta_account_key', accountKey)
    .order('snapshot_at', { ascending: false })
    .limit(25);

  if (error) {
    return Response.json({ ok: false, source: 'database', snapshots: [], error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, source: 'database', snapshots: data ?? [] });
}
