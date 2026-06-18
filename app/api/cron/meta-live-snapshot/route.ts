export const dynamic = 'force-dynamic';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const authorization = request.headers.get('authorization') || '';
  const url = new URL(request.url);
  return authorization === `Bearer ${secret}` || url.searchParams.get('secret') === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ ok: false, error: 'Unauthorized cron request.' }, { status: 401 });
  }

  const snapshotUrl = new URL('/api/meta-ads/live-snapshot', request.url);
  const response = await fetch(snapshotUrl.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
