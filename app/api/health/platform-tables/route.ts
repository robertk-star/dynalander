import { getDatabaseClient, getDatabaseEnvStatus } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

const tablesToCheck = [
  'clients',
  'google_ads_accounts',
  'ai_directions',
  'ad_snapshots',
  'ad_change_log',
  'ad_performance_snapshots',
  'meta_ad_snapshots',
  'meta_change_log',
  'meta_performance_snapshots',
  'ai_recommendations',
  'recommendation_results',
  'lead_events'
];

export async function GET() {
  const env = getDatabaseEnvStatus();
  const client = getDatabaseClient();

  if (!client) {
    return Response.json({
      ok: false,
      configured: false,
      env,
      tables: tablesToCheck.map((table) => ({ table, ok: false, count: null, error: 'Database not configured.' })),
      checkedAt: new Date().toISOString()
    });
  }

  const tables = [];

  for (const table of tablesToCheck) {
    const result = await client.from(table).select('id', { count: 'exact', head: true });
    tables.push({
      table,
      ok: !result.error,
      count: result.count ?? null,
      error: result.error?.message ?? null
    });
  }

  return Response.json({
    ok: tables.every((item) => item.ok),
    configured: true,
    env,
    tables,
    checkedAt: new Date().toISOString()
  });
}
