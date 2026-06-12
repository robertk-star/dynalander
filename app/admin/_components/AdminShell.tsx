import type { ReactNode } from 'react';
import AdminAccountSelector from './AdminAccountSelector';
import ActiveAccountBanner from './ActiveAccountBanner';
import {
  brandStyle,
  mainStyle,
  markStyle,
  navLinkStyle,
  navStyle,
  shellStyle,
  sidebarStyle,
  smallStyle,
  subtitleStyle,
  titleStyle,
  topStyle
} from './adminStyles';

export default function AdminShell({
  title,
  subtitle,
  action,
  children
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={shellStyle}>
      <aside style={sidebarStyle}>
        <div style={brandStyle}>
          <div style={markStyle}>DL</div>
          <div>
            <strong>DynLander</strong><br />
            <span style={smallStyle}>Admin demo</span>
          </div>
        </div>
        <AdminAccountSelector />
        <nav style={navStyle}>
          <a style={navLinkStyle} href="/admin">Dashboard</a>
          <a style={navLinkStyle} href="/admin/google-ads">Google Ads Intelligence</a>
          <a style={navLinkStyle} href="/admin/live-query-preview">Live Query Preview</a>
          <a style={navLinkStyle} href="/admin/snapshot-preview">Snapshot Preview</a>
          <a style={navLinkStyle} href="/admin/ad-review">Ad Review</a>
          <a style={navLinkStyle} href="/admin/themes">Theme Editor</a>
          <a style={navLinkStyle} href="/admin/url-builder">URL Builder</a>
          <a style={navLinkStyle} href="/admin/leads">Leads</a>
          <a style={navLinkStyle} href="/sell?theme=repairs&city=Plano&utm_source=google&utm_medium=cpc&utm_campaign=as-is-repairs">View Landing Page</a>
          <a style={{ ...navLinkStyle, marginTop: 24 }} href="/admin/connection-settings">Connection Settings</a>
        </nav>
      </aside>
      <main style={mainStyle}>
        <div style={topStyle}>
          <div>
            <h1 style={titleStyle}>{title}</h1>
            <p style={subtitleStyle}>{subtitle}</p>
          </div>
          {action}
        </div>
        <ActiveAccountBanner />
        {children}
      </main>
    </div>
  );
}
