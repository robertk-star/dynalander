import { getDatabaseEnvStatus } from '../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = getDatabaseEnvStatus();
  return Response.json({
    ok: env.hasUrl && env.hasAdminKey,
    configured: env.hasUrl && env.hasAdminKey,
    env,
    checkedAt: new Date().toISOString()
  });
}
