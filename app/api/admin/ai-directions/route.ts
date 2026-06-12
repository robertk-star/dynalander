import { getDemoAccountMap } from '../../../../lib/accounts/demoAccountMap';
import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

function mapRow(row: any) {
  return {
    monthlyBudget: row?.monthly_budget?.toString() || '1000',
    targetCpl: row?.target_cpl?.toString() || '100',
    approvalRequired: row?.approval_rules || '',
    leadQuality: row?.lead_quality_rules || '',
    recommendationRules: row?.recommendation_rules || '',
    restrictedLanguage: row?.restricted_language || '',
    clientNotes: row?.client_notes || ''
  };
}

export async function GET(request: Request) {
  const accountKey = new URL(request.url).searchParams.get('accountKey') || 'cash-offer-demo';
  const ids = getDemoAccountMap(accountKey);
  const client = getDatabaseClient();

  if (!client) return Response.json({ ok: false, source: 'local', directions: null });

  const { data, error } = await client
    .from('ai_directions')
    .select('monthly_budget,target_cpl,approval_rules,lead_quality_rules,recommendation_rules,restricted_language,client_notes,updated_at')
    .eq('client_id', ids.clientId)
    .eq('google_ads_account_id', ids.googleAdsAccountId)
    .maybeSingle();

  if (error) return Response.json({ ok: false, source: 'database', error: error.message, directions: null });

  return Response.json({ ok: true, source: data ? 'database' : 'database_empty', directions: data ? mapRow(data) : null, updatedAt: data?.updated_at || null });
}

export async function POST(request: Request) {
  const body = await request.json();
  const ids = getDemoAccountMap(body.accountKey || 'cash-offer-demo');
  const client = getDatabaseClient();

  if (!client) return Response.json({ ok: false, source: 'local', error: 'Database is not configured.' });

  const payload = {
    client_id: ids.clientId,
    google_ads_account_id: ids.googleAdsAccountId,
    monthly_budget: body.monthlyBudget === '' ? null : Number(body.monthlyBudget),
    target_cpl: body.targetCpl === '' ? null : Number(body.targetCpl),
    approval_rules: body.approvalRequired || '',
    lead_quality_rules: body.leadQuality || '',
    recommendation_rules: body.recommendationRules || '',
    restricted_language: body.restrictedLanguage || '',
    client_notes: body.clientNotes || '',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await client
    .from('ai_directions')
    .upsert(payload, { onConflict: 'client_id,google_ads_account_id' })
    .select('monthly_budget,target_cpl,approval_rules,lead_quality_rules,recommendation_rules,restricted_language,client_notes,updated_at')
    .single();

  if (error) return Response.json({ ok: false, source: 'database', error: error.message }, { status: 500 });

  return Response.json({ ok: true, source: 'database', directions: mapRow(data), updatedAt: data.updated_at });
}
