import { runReadOnlyGoogleAdsQuery } from '../../../../../lib/google-ads/readOnlyService';

export const dynamic = 'force-dynamic';

const mockRows = [
  { campaign: { id: 'cmp_001', name: 'DFW Cash Offer - Search', status: 'ENABLED' }, adGroup: { id: 'ag_001', name: 'Sell Fast' }, adGroupAd: { ad: { id: 'ad_001', finalUrls: ['/sell?theme=fast&city=Plano'] } } },
  { campaign: { id: 'cmp_002', name: 'As-Is Repairs - Search', status: 'ENABLED' }, adGroup: { id: 'ag_002', name: 'Repairs / As-Is' }, adGroupAd: { ad: { id: 'ad_002', finalUrls: ['/sell?theme=repairs&city=Frisco'] } } },
  { campaign: { id: 'cmp_003', name: 'Inherited House - Search', status: 'ENABLED' }, adGroup: { id: 'ag_003', name: 'Inherited House' }, adGroupAd: { ad: { id: 'ad_003', finalUrls: ['/sell?theme=inherited&city=Dallas'] } } }
];

const setupQuery = `
  SELECT
    campaign.id,
    campaign.name,
    campaign.status,
    ad_group.id,
    ad_group.name,
    ad_group_ad.ad.id,
    ad_group_ad.status,
    ad_group_ad.ad.final_urls,
    ad_group_ad.ad.responsive_search_ad.headlines,
    ad_group_ad.ad.responsive_search_ad.descriptions
  FROM ad_group_ad
  WHERE ad_group_ad.status != 'REMOVED'
  LIMIT 20
`;

export async function GET(request: Request) {
  const live = new URL(request.url).searchParams.get('live') === '1';

  if (!live) {
    return Response.json({
      ok: true,
      source: 'mock',
      liveRequested: false,
      readOnly: true,
      saveEnabled: false,
      query: setupQuery,
      rows: mockRows,
      note: 'Mock preview. Add ?live=1 to attempt a read-only Google Ads query when credentials are configured.',
      checkedAt: new Date().toISOString()
    });
  }

  const result = await runReadOnlyGoogleAdsQuery(setupQuery);

  return Response.json({
    ok: result.ok,
    source: result.source,
    liveRequested: true,
    readOnly: true,
    saveEnabled: false,
    query: setupQuery,
    rows: result.ok ? result.rows : mockRows,
    error: result.error || null,
    note: result.ok ? 'Live read-only setup preview returned data. No data was saved.' : 'Live query was not completed. Showing mock fallback rows.',
    checkedAt: new Date().toISOString()
  });
}
