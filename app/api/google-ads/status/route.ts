import { getGoogleAdsCustomerContext, getGoogleAdsEnvStatus } from '../../../../lib/google-ads/env';
import { getGoogleAccessToken, runReadOnlyGoogleAdsQuery } from '../../../../lib/google-ads/readOnlyService';

export const dynamic = 'force-dynamic';

type Check = { name: string; ok: boolean; status: string; detail?: string };

function check(name: string, ok: boolean, status: string, detail?: string): Check {
  return { name, ok, status, detail };
}

function shortError(value: string | undefined) {
  if (!value) return undefined;
  return value.length > 900 ? `${value.slice(0, 900)}...` : value;
}

export async function GET() {
  const env = getGoogleAdsEnvStatus();
  const context = getGoogleAdsCustomerContext();
  const customerId = context.customerId || null;
  const loginCustomerId = context.loginCustomerId || null;
  const checks: Check[] = [
    check('Client ID', env.hasClientId, env.hasClientId ? 'Found' : 'Missing', env.requiredNames.clientId),
    check('Client Secret', env.hasClientSecret, env.hasClientSecret ? 'Found' : 'Missing', env.requiredNames.clientSecret),
    check('Developer Token', env.hasDeveloperToken, env.hasDeveloperToken ? 'Found' : 'Missing', env.requiredNames.developerToken),
    check('Refresh Token', env.hasRefreshToken, env.hasRefreshToken ? 'Found' : 'Missing', env.requiredNames.refreshToken),
    check('Customer ID', env.hasCustomerId, env.hasCustomerId ? 'Found' : 'Missing', env.requiredNames.customerId),
    check('Login Customer ID', env.hasLoginCustomerId, env.hasLoginCustomerId ? 'Found' : 'Optional / Missing', env.requiredNames.loginCustomerId)
  ];

  let tokenOk = false;
  if (env.hasClientId && env.hasClientSecret && env.hasRefreshToken) {
    try {
      const token = await getGoogleAccessToken();
      tokenOk = Boolean(token);
      checks.push(check('OAuth access token', tokenOk, tokenOk ? 'Connected' : 'Failed'));
    } catch (error) {
      checks.push(check('OAuth access token', false, 'Failed', error instanceof Error ? error.message : 'Unknown OAuth error'));
    }
  } else {
    checks.push(check('OAuth access token', false, 'Skipped', 'Missing OAuth ENV values.'));
  }

  let queryOk = false;
  let queryError: string | undefined;
  if (env.configured && customerId && tokenOk) {
    const query = 'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1';
    const result = await runReadOnlyGoogleAdsQuery(query);
    queryOk = result.ok;
    queryError = shortError(result.error);
    checks.push(check('Read Google Ads customer', result.ok, result.ok ? `${result.rows.length} response block(s)` : 'Failed', queryError));
  } else {
    checks.push(check('Read Google Ads customer', false, 'Skipped', 'Missing required ENV values or OAuth failed.'));
  }

  const liveOk = env.configured && Boolean(customerId) && tokenOk && queryOk;

  return Response.json({
    ok: liveOk,
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
    checks,
    checkedAt: new Date().toISOString()
  });
}
