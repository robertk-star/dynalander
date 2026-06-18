import { getDatabaseClient } from '../../../../lib/supabase/server';
import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

function normalizeAdAccountId(value: string | null) { if (!value) return null; return value.startsWith('act_') ? value : `act_${value}`; }

export async function GET(request: Request) {
  const url = new URL(request.url);
  const accountKey = url.searchParams.get('accountKey') || 'act_meta-connected-account';
  const configured = normalizeAdAccountId(getMetaAdsAccountContext().adAccountId);
  const selected = normalizeAdAccountId(accountKey);
  const db = getDatabaseClient();
  const env = getMetaAdsEnvStatus();

  if (!env.configured || !configured) return Response.json({ ok: false, error: 'Meta ENV is not configured.', changes: [], snapshotCount: 0, lastSnapshotAt: null });
  if (selected && selected !== configured && selected !== 'act_meta-connected-account') return Response.json({ ok: false, error: 'Selected active account does not match connected Meta account.', changes: [], snapshotCount: 0, lastSnapshotAt: null });
  if (!db) return Response.json({ ok: false, error: 'Database is not configured.', changes: [], snapshotCount: 0, lastSnapshotAt: null });

  const [{ data: changes, error: changesError }, { count, error: countError }, { data: latest, error: latestError }] = await Promise.all([
    db.from('meta_live_change_events').select('id,entity_level,entity_id,entity_name,parent_campaign_name,parent_ad_set_name,field_name,old_value,new_value,change_importance,change_source,detected_at,snapshot_run_id').eq('account_key', accountKey).order('detected_at', { ascending: false }).limit(200),
    db.from('meta_live_snapshots').select('id', { count: 'exact', head: true }).eq('account_key', accountKey),
    db.from('meta_live_snapshots').select('snapshot_at').eq('account_key', accountKey).order('snapshot_at', { ascending: false }).limit(1)
  ]);

  const error = changesError || countError || latestError;
  if (error) return Response.json({ ok: false, error: error.message, changes: [], snapshotCount: 0, lastSnapshotAt: null }, { status: 500 });

  return Response.json({ ok: true, source: 'live_meta_change_history', changes: changes || [], snapshotCount: count || 0, lastSnapshotAt: latest?.[0]?.snapshot_at || null });
}
