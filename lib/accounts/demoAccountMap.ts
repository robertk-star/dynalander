export const demoAccountMap: Record<string, { clientId: string; googleAdsAccountId: string }> = {
  'cash-offer-demo': {
    clientId: '11111111-1111-1111-1111-111111111111',
    googleAdsAccountId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  },
  'north-texas-buyers': {
    clientId: '22222222-2222-2222-2222-222222222222',
    googleAdsAccountId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  },
  'probate-home-demo': {
    clientId: '33333333-3333-3333-3333-333333333333',
    googleAdsAccountId: 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  }
};

export function getDemoAccountMap(accountKey: string) {
  return demoAccountMap[accountKey] || demoAccountMap['cash-offer-demo'];
}
