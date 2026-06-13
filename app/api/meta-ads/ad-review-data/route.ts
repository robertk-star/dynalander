import { getLiveMetaCreativePreview } from '../../../../lib/meta-ads/readOnlyService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getLiveMetaCreativePreview();
  return Response.json(result);
}
