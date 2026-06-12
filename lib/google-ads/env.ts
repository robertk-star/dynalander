const names = {
  clientId: 'GOOGLE_ADS_CLIENT_ID',
  clientSecret: 'GOOGLE_ADS_CLIENT_SECRET',
  developerToken: 'GOOGLE_ADS_DEVELOPER_TOKEN',
  refreshToken: 'GOOGLE_ADS_REFRESH_TOKEN',
  loginCustomerId: 'GOOGLE_ADS_LOGIN_CUSTOMER_ID',
  customerId: 'GOOGLE_ADS_CUSTOMER_ID'
};

export function getGoogleAdsEnvStatus() {
  const status = {
    hasClientId: Boolean(process.env[names.clientId]),
    hasClientSecret: Boolean(process.env[names.clientSecret]),
    hasDeveloperToken: Boolean(process.env[names.developerToken]),
    hasRefreshToken: Boolean(process.env[names.refreshToken]),
    hasLoginCustomerId: Boolean(process.env[names.loginCustomerId]),
    hasCustomerId: Boolean(process.env[names.customerId])
  };

  return {
    ...status,
    configured: status.hasClientId && status.hasClientSecret && status.hasDeveloperToken && status.hasRefreshToken && status.hasCustomerId,
    requiredNames: names
  };
}

export function getGoogleAdsCustomerContext() {
  return {
    customerId: process.env[names.customerId] || null,
    loginCustomerId: process.env[names.loginCustomerId] || null
  };
}
