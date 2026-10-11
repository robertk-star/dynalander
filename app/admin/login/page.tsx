export const dynamic = 'force-dynamic';

export const metadata = { title: 'DynLander Admin Login', robots: { index: false, follow: false } };

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === 'string' && params.next.startsWith('/admin') && !params.next.startsWith('//') ? params.next : '/admin';
  const hasError = params.error === '1';

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f5f7fb', fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <form method="post" action="/api/auth/login" style={{ width: '100%', maxWidth: 360, background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 8px 30px rgba(15,23,42,0.08)' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22 }}>DynLander Admin</h1>
        <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: 14 }}>Sign in to continue.</p>
        {hasError ? (
          <p role="alert" style={{ margin: '0 0 14px', color: '#b91c1c', fontSize: 14 }}>Incorrect password, or admin login is not configured.</p>
        ) : null}
        <input type="hidden" name="next" value={next} />
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }} htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoFocus autoComplete="current-password"
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 15, marginBottom: 16 }} />
        <button type="submit" style={{ width: '100%', padding: '10px 12px', border: 0, borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Sign in</button>
      </form>
    </main>
  );
}
