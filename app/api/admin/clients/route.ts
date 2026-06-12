import { getDatabaseClient } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

const fallbackClients = [
  { id: 'cash-offer-demo', name: 'Cash Offer Demo', market: 'DFW Home Buyers', status: 'mock' },
  { id: 'north-texas-buyers', name: 'North Texas Buyers', market: 'North Texas', status: 'mock' },
  { id: 'probate-home-demo', name: 'Probate Home Demo', market: 'Inherited / Probate', status: 'mock' }
];

export async function GET() {
  const client = getDatabaseClient();

  if (!client) {
    return Response.json({ ok: false, source: 'mock', clients: fallbackClients });
  }

  const { data, error } = await client.from('clients').select('id,name,market,status,created_at').order('created_at', { ascending: false });

  if (error) {
    return Response.json({ ok: false, source: 'mock', error: error.message, clients: fallbackClients });
  }

  return Response.json({ ok: true, source: 'database', clients: data ?? [] });
}
