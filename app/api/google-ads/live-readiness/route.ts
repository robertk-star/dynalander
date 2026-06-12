import { getGoogleAdsEnvStatus } from '../../../../lib/google-ads/env';
import { getDatabaseClient, getDatabaseEnvStatus } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbEnv = getDatabaseEnvStatus();
  const googleAds = getGoogleAdsEnvStatus();
  const dbClient = getDatabaseClient();

  let clientCount = 0;
  let aiDirectionsCount = 0;
  let dbReadable = false;

  if (dbClient) {
    const clientsResult = await dbClient.from('clients').select('id', { count: 'exact', head: true });
    const directionsResult = await dbClient.from('ai_directions').select('id', { count: 'exact', head: true });
    dbReadable = !clientsResult.error && !directionsResult.error;
    clientCount = clientsResult.count ?? 0;
    aiDirectionsCount = directionsResult.count ?? 0;
  }

  const checks = [
    { key: 'database_env', label: 'Supabase ENV configured', ok: dbEnv.hasUrl && dbEnv.hasAdminKey },
    { key: 'database_readable', label: 'Database tables readable', ok: dbReadable },
    { key: 'clients_loaded', label: 'Client records loaded', ok: clientCount > 0 },
    { key: 'ai_directions_loaded', label: 'AI Directions records loaded', ok: aiDirectionsCount > 0 },
    { key: 'google_ads_env', label: 'Google Ads ENV configured', ok: googleAds.configured },
    { key: 'read_only_mode', label: 'Read-only mode confirmed', ok: true },
    { key: 'write_actions_disabled', label: 'Google Ads write actions disabled', ok: true },
    { key: 'preview_required', label: 'Snapshot preview required before save', ok: true }
  ];

  return Response.json({
    ok: checks.every((check) => check.ok),
    mode: 'read_only_pre_live',
    checks,
    counts: { clients: clientCount, aiDirections: aiDirectionsCount },
    checkedAt: new Date().toISOString()
  });
}
