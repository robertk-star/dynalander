import { createHash } from 'crypto';
import { getDemoAccountMap } from '../../../../lib/accounts/demoAccountMap';
import { getDatabaseClient } from '../../../../lib/supabase/server';
import { metaAdSets, metaCreatives } from '../../../admin/_data/metaMockData';

export const dynamic = 'force-dynamic';

function snapshotHash(input: unknown) {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

function getCreativeRows(variant: string) {
  if (variant !== 'changed') return metaCreatives;
  return metaCreatives.map((creative) => {
    if (creative.ad !== 'Inherited House Lead Ad') return creative;
    return {
      ...creative,
      primaryText: 'Inherited a house and not sure what to do next? Review your selling options before repairs or cleanout.',
      headline: 'Inherited House Options',
      description: 'Get a simple review of your property details with no pressure.',
      cta: 'Learn More',
      destinationUrl: '/sell?theme=inherited&city=Dallas',
      frequency: '2.42',
      ctr: '1.35%',
      cpl: '$47.50',
      fatigue: 'Needs refresh',
      recommendation: 'Changed mock version: softer copy and clearer option-based CTA.'
    };
  });
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

  const rows = getCreativeRows(variant).map((creative, index) => {
    const adSet = metaAdSets.find((item) => item.adSet === creative.adSet) || metaAdSets[0];
    const mockId = String(index + 1).padStart(3, '0');
    const snapshotInput = { creative, adSet, variant };

    return {
      client_id: ids.clientId,
      meta_account_key: accountKey,
      campaign_id: `meta_cmp_${mockId}`,
      campaign_name: creative.campaign,
      ad_set_id: `meta_adset_${mockId}`,
      ad_set_name: creative.adSet,
      ad_id: `meta_ad_${mockId}`,
      ad_name: creative.ad,
      creative_type: creative.creativeType,
      primary_text: creative.primaryText,
      headline: creative.headline,
      description: creative.description,
      call_to_action: creative.cta,
      destination_url: creative.destinationUrl,
      audience_summary: adSet.audience,
      placement_summary: adSet.placements,
      frequency: creative.frequency,
      ctr: creative.ctr,
      cost_per_lead: creative.cpl,
      fatigue_status: creative.fatigue,
      snapshot_hash: snapshotHash(snapshotInput),
      snapshot_at: new Date().toISOString()
    };
  });

  const { data, error } = await client
    .from('meta_ad_snapshots')
    .insert(rows)
    .select('id,ad_id,ad_name,campaign_name,ad_set_name,snapshot_at');

  if (error) {
    return Response.json({ ok: false, source: 'database', saved: 0, error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true, source: 'database', variant, saved: data?.length ?? 0, snapshots: data ?? [] });
}
