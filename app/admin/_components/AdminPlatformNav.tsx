'use client';

import { usePathname } from 'next/navigation';
import AdminAccountSelector from './AdminAccountSelector';
import { navLinkStyle, navStyle, smallStyle } from './adminStyles';
import { useActivePlatform, type AdPlatform } from './useActivePlatform';
import { useMetaDataMode, type MetaDataMode } from './useMetaDataMode';

function activeNavStyle(pathname: string, href: string, extra: Record<string, string | number> = {}) {
  const active = pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));
  return active
    ? {
        ...navLinkStyle,
        ...extra,
        background: '#dbeafe',
        border: '1px solid #2563eb',
        color: '#1d4ed8',
        fontWeight: 900,
        boxShadow: '0 6px 16px rgba(37, 99, 235, 0.18)'
      }
    : { ...navLinkStyle, ...extra };
}

export default function AdminPlatformNav() {
  const pathname = usePathname();
  const { platform, setPlatform } = useActivePlatform();
  const { mode, setMode } = useMetaDataMode();
  const isMeta = platform === 'meta_ads';

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontSize: 12, fontWeight: 800 }}>Platform</label>
        <select
          style={{ width: '100%', borderRadius: 12, border: '1px solid #cbd5e1', padding: '10px 12px', fontWeight: 800 }}
          value={platform}
          onChange={(event) => setPlatform(event.target.value as AdPlatform)}
        >
          <option value="google_ads">Google Ads</option>
          <option value="meta_ads">Facebook / Meta Ads</option>
        </select>
      </div>
      {isMeta ? (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#64748b', fontSize: 12, fontWeight: 800 }}>Meta Data Mode</label>
          <select
            style={{ width: '100%', borderRadius: 12, border: '1px solid #cbd5e1', padding: '10px 12px', fontWeight: 800 }}
            value={mode}
            onChange={(event) => setMode(event.target.value as MetaDataMode)}
          >
            <option value="live">Connected Live Meta Account</option>
            <option value="demo">Demo / Mock Meta Account</option>
          </select>
        </div>
      ) : null}
      <AdminAccountSelector />
      <nav style={navStyle}>
        {isMeta ? <a style={activeNavStyle(pathname, '/admin/dashboard-summary')} href="/admin/dashboard-summary">Dashboard Summary</a> : null}
        {isMeta ? <a style={activeNavStyle(pathname, '/admin/ad-reviewer')} href="/admin/ad-reviewer">Ad Reviewer</a> : null}
        {!isMeta ? <a style={activeNavStyle(pathname, '/admin/google-ads')} href="/admin/google-ads">Google Ads Intelligence</a> : null}
        {!isMeta ? <a style={activeNavStyle(pathname, '/admin/live-query-preview')} href="/admin/live-query-preview">Live Query Preview</a> : null}
        {isMeta ? <a style={activeNavStyle(pathname, '/admin/meta-ads-connection')} href="/admin/meta-ads-connection">Meta Ads Connection</a> : null}
        {isMeta ? <a style={activeNavStyle(pathname, '/admin/meta-audit')} href="/admin/meta-audit">Meta Safety Audit</a> : null}
        {!isMeta ? <a style={activeNavStyle(pathname, '/admin/recommendations')} href="/admin/recommendations">Recommendations</a> : null}
        <a style={activeNavStyle(pathname, '/admin/snapshot-preview')} href="/admin/snapshot-preview">Snapshot Preview</a>
        <a style={activeNavStyle(pathname, '/admin/change-history')} href="/admin/change-history">Change History</a>
        {!isMeta ? <a style={activeNavStyle(pathname, '/admin/ad-review')} href="/admin/ad-review">Ad Review</a> : null}
        {!isMeta ? <a style={activeNavStyle(pathname, '/admin/themes')} href="/admin/themes">Theme Editor</a> : null}
        {!isMeta ? <a style={activeNavStyle(pathname, '/admin/url-builder')} href="/admin/url-builder">URL Builder</a> : null}
        {!isMeta ? <a style={activeNavStyle(pathname, '/admin/leads')} href="/admin/leads">Leads</a> : null}
        {!isMeta ? <a style={navLinkStyle} href="/sell?theme=repairs&city=Plano">View Landing Page</a> : null}
        <a style={activeNavStyle(pathname, '/admin/connection-settings', { marginTop: 24 })} href="/admin/connection-settings">Connection Settings</a>
        <span style={{ ...smallStyle, display: 'block', marginTop: 8, color: '#64748b' }}>{isMeta ? (mode === 'live' ? 'Meta live read-only mode.' : 'Meta demo/mock mode.') : 'Google Ads is active.'}</span>
      </nav>
    </>
  );
}
