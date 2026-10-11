import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
  verifyCronAuthorization,
  verifyMetaAdsReadKey
} from './lib/auth/adminAuth';

// Auth gate for the admin UI and internal APIs. Public landing pages (/, /sell, /thank-you)
// and the plain /api/health check are not matched / not gated. Everything fails closed when
// ADMIN_SESSION_SECRET, META_ADS_READ_KEY, or CRON_SECRET is unset.

const PUBLIC_API_PATHS = new Set(['/api/health', '/api/auth/login', '/api/auth/logout']);

// Meta Ads routes that are POST but read-only (no writes to Meta or the DB snapshot tables),
// which the x-api-key may call. ai-review-chat sends the question to OpenAI (costs tokens).
const META_ADS_READ_ONLY_POST_PATHS = new Set(['/api/meta-ads/ai-review-chat']);

function unauthorized(message = 'Unauthorized.') {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

function stripTrailingSlash(pathname: string) {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export async function middleware(request: NextRequest) {
  const pathname = stripTrailingSlash(request.nextUrl.pathname);
  const method = request.method.toUpperCase();
  const hasSession = await verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  // Admin UI
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (pathname === '/admin/login') return NextResponse.next();
    if (hasSession) return NextResponse.next();
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (!pathname.startsWith('/api/')) return NextResponse.next();
  if (PUBLIC_API_PATHS.has(pathname)) return NextResponse.next();

  // Cron routes: Vercel Cron bearer token only.
  if (pathname.startsWith('/api/cron/')) {
    if (await verifyCronAuthorization(request.headers.get('authorization'))) return NextResponse.next();
    return unauthorized('Unauthorized cron request.');
  }

  if (hasSession) return NextResponse.next();

  if (pathname.startsWith('/api/meta-ads/')) {
    // The hourly cron forwards its bearer token to /api/meta-ads/live-snapshot.
    if (await verifyCronAuthorization(request.headers.get('authorization'))) return NextResponse.next();

    const isReadMethod = method === 'GET' || method === 'HEAD';
    const isReadOnlyPost = method === 'POST' && META_ADS_READ_ONLY_POST_PATHS.has(pathname);
    if ((isReadMethod || isReadOnlyPost) && (await verifyMetaAdsReadKey(request.headers.get('x-api-key')))) {
      return NextResponse.next();
    }
  }

  return unauthorized();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/:path*']
};
