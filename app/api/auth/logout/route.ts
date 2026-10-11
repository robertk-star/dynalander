import { ADMIN_SESSION_COOKIE } from '../../../../lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL('/admin/login', request.url).toString(),
      'Set-Cookie': `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
    }
  });
}
