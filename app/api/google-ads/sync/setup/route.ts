import { getGoogleAdsEnvStatus } from '../../../../../lib/google-ads/env';

export const dynamic = 'force-dynamic';

const mockSetupItems = [
  { type: 'campaign', count: 4, note: 'Campaigns ready to pull when API is connected.' },
  { type: 'ad_group', count: 8, note: 'Ad groups will map to seller-intent themes.' },
  { type: 'responsive_search_ad', count: 12, note: 'Headlines and descriptions will be snapshotted.' },
  { type: 'sitelink', count: 16, note: 'Sitelinks will be reviewed for theme match.' },
  { type: 'callout', count: 12, note: 'Callouts will be reviewed for offer and trust language.' },
  { type: 'structured_snippet', count: 6, note: 'Snippets will be checked for seller situation coverage.' }
];

export async function GET() {
  const env = getGoogleAdsEnvStatus();

  return Response.json({
    ok: true,
    mode: env.configured ? 'ready_but_not_pulling_live_yet' : 'mock_only',
    configured: env.configured,
    syncType: 'setup_snapshot',
    items: mockSetupItems,
    nextStep: env.configured ? 'Add Google Ads query service implementation.' : 'Add Google Ads environment variables when the correct account is ready.',
    checkedAt: new Date().toISOString()
  });
}
