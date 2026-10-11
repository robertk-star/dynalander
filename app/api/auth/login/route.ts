import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  verifyAdminPassword
} from '../../../../lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

function safeNextPath(value: unknown) {
  const next = typeof value === 'string' ? value : '';
  // Only allow same-site relative admin paths (no protocol-relative or external redirects).
  if (!next.startsWith('/admin') || next.startsWith('//') || next.startsWith('/admin/login')) return '/admin';
  return next;
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  let password = '';
  let next: unknown = '/admin';

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    password = typeof body.password === 'string' ? body.password : '';
    next = body.next;
  } else {
    const form = await request.formData().catch(() => null);
    password = String(form?.get('password') || '');
    next = form?.get('next');
  }

  const nextPath = safeNextPath(next);
  const valid = await verifyAdminPassword(password);
  const token = valid ? await createAdminSessionToken() : null;

  if (!token) {
    const failUrl = new URL('/admin/login', request.url);
    failUrl.searchParams.set('error', '1');
    failUrl.searchParams.set('next', nextPath);
    return Response.redirect(failUrl, 303);
  }

  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(nextPath, request.url).toString(),
      'Set-Cookie': `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}${secure}`
    }
  });
}
