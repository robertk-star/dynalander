import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = getDatabaseClient();

  if (!client) {
    return Response.json({ ok: false, source: 'mock', directions: [] });
  }

  const { data, error } = await client
    .from('ai_directions')
    .select('id,client_id,google_ads_account_id,monthly_budget,target_cpl,approval_rules,lead_quality_rules,recommendation_rules,restricted_language,client_notes,updated_at')
    .order('updated_at', { ascending: false });

  if (error) {
    return Response.json({ ok: false, source: 'database', error: error.message, directions: [] });
  }

  return Response.json({ ok: true, source: 'database', directions: data ?? [] });
}
