const names = {
  appId: 'META_APP_ID',
  appSecret: 'META_APP_SECRET',
  accessToken: 'META_ACCESS_TOKEN',
  adAccountId: 'META_AD_ACCOUNT_ID',
  apiVersion: 'META_API_VERSION',
  businessId: 'META_BUSINESS_ID'
};

export function getMetaAdsEnvStatus() {
  const status = {
    hasAppId: Boolean(process.env[names.appId]),
    hasAppSecret: Boolean(process.env[names.appSecret]),
    hasAccessToken: Boolean(process.env[names.accessToken]),
    hasAdAccountId: Boolean(process.env[names.adAccountId]),
    hasApiVersion: Boolean(process.env[names.apiVersion]),
    hasBusinessId: Boolean(process.env[names.businessId])
  };

  return {
    ...status,
    configured: status.hasAppId && status.hasAppSecret && status.hasAccessToken && status.hasAdAccountId,
    requiredNames: names
  };
}

export function getMetaAdsAccountContext() {
  return {
    adAccountId: process.env[names.adAccountId] || null,
    businessId: process.env[names.businessId] || null,
    apiVersion: process.env[names.apiVersion] || 'v21.0'
  };
}
