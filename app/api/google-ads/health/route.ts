import { getGoogleAdsCustomerContext, getGoogleAdsEnvStatus } from '../../../../lib/google-ads/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = getGoogleAdsEnvStatus();
  const context = getGoogleAdsCustomerContext();

  return Response.json({
    ok: env.configured,
    configured: env.configured,
    env: {
      hasClientId: env.hasClientId,
      hasClientSecret: env.hasClientSecret,
      hasDeveloperToken: env.hasDeveloperToken,
      hasRefreshToken: env.hasRefreshToken,
      hasLoginCustomerId: env.hasLoginCustomerId,
      hasCustomerId: env.hasCustomerId
    },
    context: {
      hasCustomerId: Boolean(context.customerId),
      hasLoginCustomerId: Boolean(context.loginCustomerId)
    },
    checkedAt: new Date().toISOString(),
    mode: env.configured ? 'ready_for_server_side_connection' : 'mock_only'
  });
}
