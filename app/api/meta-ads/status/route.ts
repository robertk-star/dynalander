import { getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = getMetaAdsEnvStatus();

  return Response.json({
    ok: true,
    configured: env.configured,
    mode: env.configured ? 'future_read_only_ready' : 'mock_only',
    checkedAt: new Date().toISOString()
  });
}
