import { runMetaReadinessCheck } from '../../../../lib/meta-ads/readOnlyService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await runMetaReadinessCheck();
  return Response.json(result);
}
