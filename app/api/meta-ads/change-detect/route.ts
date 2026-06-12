import { getDemoAccountMap } from '../../../../lib/accounts/demoAccountMap';
import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

type MetaSnapshot = {
  id: string;
  client_id: string;
  meta_account_key: string;
  campaign_id: string;
  ad_set_id: string;
  ad_id: string;
  primary_text: string | null;
  headline: string | null;
  description: string | null;
  call_to_action: string | null;
  destination_url: string | null;
  frequency: string | null;
  fatigue_status: string | null;
  snapshot_at: string;
};

function compareField(assetType: string, oldValue?: string | null, newValue?: string | null) {
  if ((oldValue || '') === (newValue || '')) return null;
  return { assetType, position: 1, oldValue: oldValue || '', newValue: newValue || '' };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const accountKey = body.accountKey || 'cash-offer-demo';
  const ids = getDemoAccountMap(accountKey);
  const client = getDatabaseClient();

  if (!client) {
    return Response.json({ ok: false, source: 'local', detected: 0, error: 'Database is not configured.' });
  }

  const { data, error } = await client
    .from('meta_ad_snapshots')
    .select('id,client_id,meta_account_key,campaign_id,ad_set_id,ad_id,primary_text,headline,description,call_to_action,destination_url,frequency,fatigue_status,snapshot_at')
    .eq('client_id', ids.clientId)
    .eq('meta_account_key', accountKey)
    .order('snapshot_at', { ascending: false })
    .limit(30);

  if (error) {
    return Response.json({ ok: false, source: 'database', detected: 0, error: error.message }, { status: 500 });
  }

  const snapshots = (data ?? []) as MetaSnapshot[];
  const byAd = new Map<string, MetaSnapshot[]>();
  for (const snapshot of snapshots) byAd.set(snapshot.ad_id, [...(byAd.get(snapshot.ad_id) || []), snapshot]);

  const changeRows = [];
  for (const [, rows] of byAd.entries()) {
    if (rows.length < 2) continue;
    const newest = rows[0];
    const previous = rows[1];
    const changes = [
      compareField('primary_text', previous.primary_text, newest.primary_text),
      compareField('headline', previous.headline, newest.headline),
      compareField('description', previous.description, newest.description),
      compareField('call_to_action', previous.call_to_action, newest.call_to_action),
      compareField('destination_url', previous.destination_url, newest.destination_url),
      compareField('frequency', previous.frequency, newest.frequency),
      compareField('fatigue_status', previous.fatigue_status, newest.fatigue_status)
    ].filter(Boolean) as Array<{ assetType: string; position: number; oldValue: string; newValue: string }>;

    for (const change of changes) {
      changeRows.push({
        client_id: ids.clientId,
        meta_account_key: accountKey,
        meta_ad_snapshot_id: newest.id,
        campaign_id: newest.campaign_id,
        ad_set_id: newest.ad_set_id,
        ad_id: newest.ad_id,
        asset_type: change.assetType,
        asset_position: change.position,
        old_value: change.oldValue,
        new_value: change.newValue,
        change_source: 'meta_mock_snapshot_detector',
        detected_at: new Date().toISOString(),
        review_after_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  if (changeRows.length === 0) {
    return Response.json({ ok: true, source: 'database', detected: 0, inserted: 0, changes: [] });
  }

  const { data: inserted, error: insertError } = await client
    .from('meta_change_log')
    .insert(changeRows)
    .select('id,asset_type,asset_position,old_value,new_value,ad_id,detected_at');

  if (insertError) {
    return Response.json({ ok: false, source: 'database', detected: changeRows.length, inserted: 0, error: insertError.message }, { status: 500 });
  }

  return Response.json({ ok: true, source: 'database', detected: changeRows.length, inserted: inserted?.length ?? 0, changes: inserted ?? [] });
}
