export async function GET() {
  return Response.json({
    ok: true,
    app: 'DynLander',
    phase: 'Phase 1 Next.js foundation',
    googleAdsConnected: false
  });
}
