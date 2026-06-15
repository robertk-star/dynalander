import { getGoogleAdsCustomerContext, getGoogleAdsEnvStatus } from '../../../../lib/google-ads/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = getGoogleAdsEnvStatus();
  const context = getGoogleAdsCustomerContext();
  const customerId = context.customerId || null;
  const loginCustomerId = context.loginCustomerId || null;

  return Response.json({
    ok: env.configured && Boolean(customerId),
    configured: env.configured,
    customerId,
    loginCustomerId,
    account: customerId
      ? {
          id: customerId,
          name: `Google Ads ${customerId}`,
          currency: 'Google Ads',
          timezone_name: loginCustomerId ? `Manager ${loginCustomerId}` : 'Direct account'
        }
      : null,
    checks: [
      { name: 'Client ID', ok: env.hasClientId, status: env.hasClientId ? 'Found' : 'Missing', detail: env.requiredNames.clientId },
      { name: 'Client Secret', ok: env.hasClientSecret, status: env.hasClientSecret ? 'Found' : 'Missing', detail: env.requiredNames.clientSecret },
      { name: 'Developer Token', ok: env.hasDeveloperToken, status: env.hasDeveloperToken ? 'Found' : 'Missing', detail: env.requiredNames.developerToken },
      { name: 'Refresh Token', ok: env.hasRefreshToken, status: env.hasRefreshToken ? 'Found' : 'Missing', detail: env.requiredNames.refreshToken },
      { name: 'Customer ID', ok: env.hasCustomerId, status: env.hasCustomerId ? 'Found' : 'Missing', detail: env.requiredNames.customerId },
      { name: 'Login Customer ID', ok: env.hasLoginCustomerId, status: env.hasLoginCustomerId ? 'Found' : 'Optional / Missing', detail: env.requiredNames.loginCustomerId }
    ],
    checkedAt: new Date().toISOString()
  });
}
