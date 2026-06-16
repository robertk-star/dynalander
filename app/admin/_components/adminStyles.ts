import type { CSSProperties } from 'react';

export const shellStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: '260px minmax(0, 1fr)',
  background: '#f5f7fb',
  color: '#172033',
  fontFamily: 'Arial, Helvetica, sans-serif'
};

export const sidebarStyle: CSSProperties = { background: '#0f172a', color: '#fff', padding: 24 };
export const brandStyle: CSSProperties = { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28 };
export const markStyle: CSSProperties = { width: 42, height: 42, borderRadius: 12, background: '#2563eb', display: 'grid', placeItems: 'center', fontWeight: 800 };
export const smallStyle: CSSProperties = { color: '#94a3b8', fontSize: 13 };
export const navStyle: CSSProperties = { display: 'grid', gap: 10 };
export const navLinkStyle: CSSProperties = { color: '#dbeafe', textDecoration: 'none', padding: '11px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)' };
export const mainStyle: CSSProperties = { padding: 32, overflowX: 'auto', minWidth: 0 };
export const topStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', marginBottom: 22 };
export const titleStyle: CSSProperties = { margin: 0, fontSize: 34, letterSpacing: -0.5 };
export const subtitleStyle: CSSProperties = { marginTop: 8, color: '#64748b', maxWidth: 760, lineHeight: 1.5 };

export const cardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
  marginBottom: 18,
  overflowX: 'auto'
};

export const gridStyle: CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  marginBottom: 18
};

export const twoColumnStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 18
};

export const tableStyle: CSSProperties = { width: '100%', minWidth: 760, borderCollapse: 'collapse', fontSize: 14 };
export const thTdStyle: CSSProperties = { padding: '12px 10px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', verticalAlign: 'top' };
export const inputStyle: CSSProperties = { width: '100%', padding: '12px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 16, boxSizing: 'border-box' };
export const labelStyle: CSSProperties = { display: 'grid', gap: 6, fontSize: 13, color: '#475569', fontWeight: 700 };
export const blueButtonStyle: CSSProperties = { background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700, border: 0, cursor: 'pointer' };
