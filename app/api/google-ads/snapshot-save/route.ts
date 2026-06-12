import { createHash } from 'crypto';
import { getDemoAccountMap } from '../../../../lib/accounts/demoAccountMap';
import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

const baseMockAds = [
  { id: 'ad_001', campaignId: 'cmp_001', campaignName: 'DFW Cash Offer - Search', adGroupId: 'ag_001', adGroupName: 'Sell Fast', finalUrl: '/sell?theme=fast&city=Plano', headlines: ['Sell Fast in Plano', 'Get a Cash Offer Today', 'Close On Your Timeline'], descriptions: ['Request a simple cash offer without repairs, showings, or listing with an agent.', 'Tell us about the property and your timeline.'] },
  { id: 'ad_002', campaignId: 'cmp_002', campaignName: 'As-Is Repairs - Search', adGroupId: 'ag_002', adGroupName: 'Repairs / As-Is', finalUrl: '/sell?theme=repairs&city=Frisco', headlines: ['Sell Your House As-Is', 'No Repairs Needed', 'Skip Repairs and Showings'], descriptions: ['Sell your house as-is without cleaning, repairs, or showings.', 'Request an as-is offer and review your timeline with no pressure.'] },
  { id: 'ad_003', campaignId: 'cmp_003', campaignName: 'Inherited House - Search', adGroupId: 'ag_003', adGroupName: 'Inherited House', finalUrl: '/sell?theme=inherited&city=Dallas', headlines: ['Inherited Property Offer', 'Sell an Inherited House', 'No Cleanout Needed'], descriptions: ['Request an offer for an inherited property without cleaning it out first.', 'Review options for an inherited house without repairs or listing.'] }
];

function getMockAds(variant: string) {
  if (variant !== 'changed') return baseMockAds;
  return baseMockAds.map((ad) => {
    if (ad.id !== 'ad_002') return ad;
    return {
      ...ad,
      finalUrl: '/sell?theme=repairs&city=Plano',
      headlines: ['Sell Your House As-Is', 'No Repairs Needed', 'Get an As-Is Cash Offer'],
      descriptions: ['Sell your house as-is without cleaning, repairs, or showings.', 'Request an as-is offer and choose your closing timeline.']
    };
  });
}

function snapshotHash(input: unknown) {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const accountKey = body.accountKey || 'cash-offer-demo';
  const variant = body.variant || 'base';
  const ids = getDemoAccountMap(accountKey);
  const client = getDatabaseClient();

  if (!client) {
    return Response.json({ ok: false, source: 'local', saved: 0, error: 'Database is not configured.' });
  }

  const rows = getMockAds(variant).map((ad) => ({
    client_id: ids.clientId,
    google_ads_account_id: ids.googleAdsAccountId,
    campaign_id: ad.campaignId,
    campaign_name: ad.campaignName,
    ad_group_id: ad.adGroupId,
    ad_group_name: ad.adGroupName,
    ad_id: ad.id,
    ad_type: 'responsive_search_ad',
    ad_status: 'enabled',
    final_url: ad.finalUrl,
    headlines_json: ad.headlines,
    descriptions_json: ad.descriptions,
    sitelinks_json: [],
    callouts_json: [],
    structured_snippets_json: [],
    snapshot_hash: snapshotHash(ad),
    snapshot_at: new Date().toISOString()
  }));

  const { data, error } = await client.from('ad_snapshots').insert(rows).select('id,ad_id,campaign_name,ad_group_name,snapshot_at');

  if (error) {
    return Response.json({ ok: false, source: 'database', saved: 0, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, source: 'database', variant, saved: data?.length ?? 0, snapshots: data ?? [] });
}
