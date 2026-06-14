import { getLiveMetaDataPreview } from '../../../../lib/meta-ads/readOnlyService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const activeAccountKey = url.searchParams.get('accountKey') || url.searchParams.get('adAccountId');
  const result = await getLiveMetaDataPreview(activeAccountKey);
  return Response.json(result);
}
