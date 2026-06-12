import { getGoogleAdsEnvStatus } from '../../../../lib/google-ads/env';

export const dynamic = 'force-dynamic';

const preview = {
  campaigns: [
    { id: 'cmp_001', name: 'DFW Cash Offer - Search', status: 'enabled', budget: '$35/day' },
    { id: 'cmp_002', name: 'As-Is Repairs - Search', status: 'enabled', budget: '$25/day' },
    { id: 'cmp_003', name: 'Inherited House - Search', status: 'enabled', budget: '$20/day' }
  ],
  adGroups: [
    { id: 'ag_001', campaignId: 'cmp_001', name: 'Sell Fast', theme: 'fast' },
    { id: 'ag_002', campaignId: 'cmp_002', name: 'Repairs / As-Is', theme: 'repairs' },
    { id: 'ag_003', campaignId: 'cmp_003', name: 'Inherited House', theme: 'inherited' }
  ],
  ads: [
    { id: 'ad_001', adGroupId: 'ag_001', type: 'responsive_search_ad', headlines: 13, descriptions: 4, finalUrl: '/sell?theme=fast&city=Plano' },
    { id: 'ad_002', adGroupId: 'ag_002', type: 'responsive_search_ad', headlines: 14, descriptions: 4, finalUrl: '/sell?theme=repairs&city=Frisco' },
    { id: 'ad_003', adGroupId: 'ag_003', type: 'responsive_search_ad', headlines: 12, descriptions: 4, finalUrl: '/sell?theme=inherited&city=Dallas' }
  ],
  assets: [
    { type: 'headline', count: 39 },
    { type: 'description', count: 12 },
    { type: 'sitelink', count: 16 },
    { type: 'callout', count: 12 },
    { type: 'structured_snippet', count: 6 },
    { type: 'keyword', count: 84 },
    { type: 'negative_keyword', count: 38 }
  ],
  databaseWrites: [
    { table: 'ad_snapshots', action: 'insert setup snapshot rows' },
    { table: 'ad_change_log', action: 'compare newest snapshot to previous saved snapshot' },
    { table: 'ad_performance_snapshots', action: 'not used in setup preview' }
  ]
};

export async function GET() {
  const env = getGoogleAdsEnvStatus();

  return Response.json({
    ok: true,
    mode: env.configured ? 'ready_for_live_preview' : 'mock_preview_only',
    configured: env.configured,
    readOnly: true,
    saveEnabled: false,
    saveReason: 'Phase 6.2 is preview-only. No live Google Ads data is saved yet.',
    preview,
    counts: {
      campaigns: preview.campaigns.length,
      adGroups: preview.adGroups.length,
      ads: preview.ads.length,
      assets: preview.assets.reduce((sum, item) => sum + item.count, 0)
    },
    checkedAt: new Date().toISOString()
  });
}
