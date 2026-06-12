import { dynlanderTables, getDatabaseClient, getDatabaseEnvStatus } from '../../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = getDatabaseEnvStatus();
  const client = getDatabaseClient();

  if (!client) {
    return Response.json({
      ok: false,
      configured: false,
      env,
      tables: dynlanderTables.map((table) => ({ table, ok: false, count: null, error: 'Database not configured.' })),
      checkedAt: new Date().toISOString()
    });
  }

  const tables = [];

  for (const table of dynlanderTables) {
    const result = await client.from(table).select('id', { count: 'exact', head: true });
    tables.push({
      table,
      ok: !result.error,
      count: result.count ?? null,
      error: result.error?.message ?? null
    });
  }

  return Response.json({
    ok: tables.every((item) => item.ok),
    configured: true,
    env,
    tables,
    checkedAt: new Date().toISOString()
  });
}
