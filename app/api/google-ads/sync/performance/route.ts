import { getGoogleAdsEnvStatus } from '../../../../../lib/google-ads/env';

export const dynamic = 'force-dynamic';

const mockPerformance = [
  { metric: 'impressions', value: 22910 },
  { metric: 'clicks', value: 1438 },
  { metric: 'cost', value: '$7,842' },
  { metric: 'leads', value: 92 },
  { metric: 'qualified_leads', value: 54 },
  { metric: 'cost_per_lead', value: '$85' }
];

export async function GET() {
  const env = getGoogleAdsEnvStatus();

  return Response.json({
    ok: true,
    mode: env.configured ? 'ready_but_not_pulling_live_yet' : 'mock_only',
    configured: env.configured,
    syncType: 'performance_snapshot',
    metrics: mockPerformance,
    nextStep: env.configured ? 'Add Google Ads metrics query implementation.' : 'Add Google Ads environment variables when the correct account is ready.',
    checkedAt: new Date().toISOString()
  });
}
