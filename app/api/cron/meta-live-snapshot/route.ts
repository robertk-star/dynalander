import { verifyCronAuthorization } from '../../../../lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

// Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}`. Fails closed when CRON_SECRET is unset.
export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!(await verifyCronAuthorization(authorization))) {
    return Response.json({ ok: false, error: 'Unauthorized cron request.' }, { status: 401 });
  }

  const snapshotUrl = new URL('/api/meta-ads/live-snapshot', request.url);
  const response = await fetch(snapshotUrl.toString(), {
    method: 'POST',
    // Forward the cron bearer token so the middleware lets this internal call through.
    headers: { 'Content-Type': 'application/json', Authorization: authorization as string },
    body: JSON.stringify({ accountKey: 'act_meta-connected-account', source: 'vercel_cron_hourly' })
  });

  const result = await response.json().catch(() => ({}));
  return Response.json({
    ok: response.ok && Boolean(result.ok),
    source: 'vercel_cron_meta_live_snapshot',
    ranAt: new Date().toISOString(),
    snapshot: result
  }, { status: response.ok ? 200 : 500 });
}
