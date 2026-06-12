import { getDemoAccountMap } from '../../../../lib/accounts/demoAccountMap';
import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

type Snapshot = {
  id: string;
  client_id: string;
  google_ads_account_id: string;
  campaign_id: string;
  ad_group_id: string;
  ad_id: string;
  headlines_json: string[];
  descriptions_json: string[];
  final_url: string;
  snapshot_at: string;
};

function compareList(assetType: string, oldValues: string[], newValues: string[]) {
  const changes: Array<{ assetType: string; position: number; oldValue: string; newValue: string }> = [];
  const max = Math.max(oldValues.length, newValues.length);
  for (let index = 0; index < max; index += 1) {
    const oldValue = oldValues[index] || '';
    const newValue = newValues[index] || '';
    if (oldValue !== newValue) changes.push({ assetType, position: index + 1, oldValue, newValue });
  }
  return changes;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const accountKey = body.accountKey || 'cash-offer-demo';
  const ids = getDemoAccountMap(accountKey);
  const client = getDatabaseClient();

  if (!client) return Response.json({ ok: false, source: 'local', detected: 0, error: 'Database is not configured.' });

  const { data, error } = await client
    .from('ad_snapshots')
    .select('id,client_id,google_ads_account_id,campaign_id,ad_group_id,ad_id,headlines_json,descriptions_json,final_url,snapshot_at')
    .eq('client_id', ids.clientId)
    .eq('google_ads_account_id', ids.googleAdsAccountId)
    .order('snapshot_at', { ascending: false })
    .limit(20);

  if (error) return Response.json({ ok: false, source: 'database', detected: 0, error: error.message }, { status: 500 });

  const snapshots = (data ?? []) as Snapshot[];
  const byAd = new Map<string, Snapshot[]>();
  for (const snapshot of snapshots) byAd.set(snapshot.ad_id, [...(byAd.get(snapshot.ad_id) || []), snapshot]);

  const changeRows = [];
  for (const [, rows] of byAd.entries()) {
    if (rows.length < 2) continue;
    const newest = rows[0];
    const previous = rows[1];
    const changes = [
      ...compareList('headline', previous.headlines_json || [], newest.headlines_json || []),
      ...compareList('description', previous.descriptions_json || [], newest.descriptions_json || [])
    ];
    if ((previous.final_url || '') !== (newest.final_url || '')) {
      changes.push({ assetType: 'final_url', position: 1, oldValue: previous.final_url || '', newValue: newest.final_url || '' });
    }

    for (const change of changes) {
      changeRows.push({
        client_id: ids.clientId,
        google_ads_account_id: ids.googleAdsAccountId,
        ad_snapshot_id: newest.id,
        campaign_id: newest.campaign_id,
        ad_group_id: newest.ad_group_id,
        ad_id: newest.ad_id,
        asset_type: change.assetType,
        asset_position: change.position,
        old_value: change.oldValue,
        new_value: change.newValue,
        change_source: 'mock_snapshot_detector',
        detected_at: new Date().toISOString(),
        review_after_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  if (changeRows.length === 0) {
    return Response.json({ ok: true, source: 'database', detected: 0, inserted: 0, changes: [] });
  }

  const { data: inserted, error: insertError } = await client.from('ad_change_log').insert(changeRows).select('id,asset_type,asset_position,old_value,new_value,ad_id,detected_at');

  if (insertError) return Response.json({ ok: false, source: 'database', detected: changeRows.length, inserted: 0, error: insertError.message }, { status: 500 });

  return Response.json({ ok: true, source: 'database', detected: changeRows.length, inserted: inserted?.length ?? 0, changes: inserted ?? [] });
}
