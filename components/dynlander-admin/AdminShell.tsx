import type { ReactNode, CSSProperties } from 'react';

const styles: Record<string, CSSProperties> = {
  shell: { minHeight: '100vh', display: 'grid', gridTemplateColumns: '260px 1fr', background: '#f5f7fb', color: '#172033', fontFamily: 'Arial, Helvetica, sans-serif' },
  sidebar: { background: '#0f172a', color: '#fff', padding: 24 },
  brand: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28 },
  mark: { width: 42, height: 42, borderRadius: 12, background: '#2563eb', display: 'grid', placeItems: 'center', fontWeight: 800 },
  small: { color: '#94a3b8', fontSize: 13 },
  nav: { display: 'grid', gap: 10 },
  navLink: { color: '#dbeafe', textDecoration: 'none', padding: '11px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)' },
  main: { padding: 32 },
  top: { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 22 },
  title: { margin: 0, fontSize: 34, letterSpacing: -0.5 },
  subtitle: { marginTop: 8, color: '#64748b', maxWidth: 760, lineHeight: 1.5 },
  button: { background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700, border: 0 },
};

export const cardStyle: CSSProperties = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)'
};

export const gridStyle: CSSProperties = {
  display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 18
};

export const tableStyle: CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontSize: 14
};

export const thTdStyle: CSSProperties = {
  padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'left'
};

export const inputStyle: CSSProperties = {
  width: '100%', padding: '12px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box'
};

export const labelStyle: CSSProperties = {
  display: 'grid', gap: 6, fontSize: 13, color: '#475569', fontWeight: 700
};

export default function AdminShell({ title, subtitle, action, children }: { title: string; subtitle: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.mark}>DL</div>
          <div>
            <strong>DynLander</strong><br />
            <span style={styles.small}>Admin demo</span>
          </div>
        </div>
        <nav style={styles.nav}>
          <a style={styles.navLink} href="/admin">Dashboard</a>
          <a style={styles.navLink} href="/admin/themes">Theme Editor</a>
          <a style={styles.navLink} href="/admin/url-builder">URL Builder</a>
          <a style={styles.navLink} href="/admin/leads">Leads</a>
          <a style={styles.navLink} href="/sell?theme=repairs&city=Plano&utm_source=google&utm_medium=cpc&utm_campaign=as-is-repairs">View Landing Page</a>
        </nav>
      </aside>
      <main style={styles.main}>
        <div style={styles.top}>
          <div>
            <h1 style={styles.title}>{title}</h1>
            <p style={styles.subtitle}>{subtitle}</p>
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
