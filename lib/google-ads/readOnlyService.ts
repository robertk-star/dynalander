import { getGoogleAdsCustomerContext, getGoogleAdsEnvStatus } from './env';

const tokenUrl = 'https://oauth2.googleapis.com/token';
const defaultApiVersion = 'v21';

export type GoogleAdsQueryResult = {
  ok: boolean;
  source: 'live' | 'mock' | 'not_configured' | 'error';
  rows: unknown[];
  error?: string;
};

function getEnvValue(name: string) {
  return process.env[name] || '';
}

export async function getGoogleAccessToken() {
  const body = new URLSearchParams({
    client_id: getEnvValue('GOOGLE_ADS_CLIENT_ID'),
    client_secret: getEnvValue('GOOGLE_ADS_CLIENT_SECRET'),
    refresh_token: getEnvValue('GOOGLE_ADS_REFRESH_TOKEN'),
    grant_type: 'refresh_token'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const json = await response.json();
  if (!response.ok || !json.access_token) {
    throw new Error(json.error_description || json.error || 'Unable to get Google access token.');
  }

  return json.access_token as string;
}

export async function runReadOnlyGoogleAdsQuery(query: string): Promise<GoogleAdsQueryResult> {
  const env = getGoogleAdsEnvStatus();
  const context = getGoogleAdsCustomerContext();

  if (!env.configured || !context.customerId) {
    return { ok: false, source: 'not_configured', rows: [], error: 'Google Ads credentials are not configured.' };
  }

  try {
    const accessToken = await getGoogleAccessToken();
    const apiVersion = process.env.GOOGLE_ADS_API_VERSION || defaultApiVersion;
    const url = `https://googleads.googleapis.com/${apiVersion}/customers/${context.customerId}/googleAds:searchStream`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': getEnvValue('GOOGLE_ADS_DEVELOPER_TOKEN'),
      'Content-Type': 'application/json'
    };

    if (context.loginCustomerId) {
      headers['login-customer-id'] = context.loginCustomerId;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    if (!response.ok) {
      return { ok: false, source: 'error', rows: [], error: JSON.stringify(json) };
    }

    return { ok: true, source: 'live', rows: Array.isArray(json) ? json : [json] };
  } catch (error) {
    return { ok: false, source: 'error', rows: [], error: error instanceof Error ? error.message : 'Unknown Google Ads query error.' };
  }
}
