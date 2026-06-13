import { getLiveMetaDataPreview } from '../../../../lib/meta-ads/readOnlyService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getLiveMetaDataPreview();
  return Response.json(result);
}
