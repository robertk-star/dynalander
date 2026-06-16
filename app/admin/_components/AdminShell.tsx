import type { ReactNode } from 'react';
import ActiveAccountBanner from './ActiveAccountBanner';
import AdminPlatformNav from './AdminPlatformNav';
import ModeSafetyBanner from './ModeSafetyBanner';
import {
  brandStyle,
  mainStyle,
  markStyle,
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
    <div className="dl-admin-shell" style={shellStyle}>
      <style>{`
        @media (max-width: 760px) {
          .dl-admin-shell {
            display: block !important;
          }

          .dl-admin-sidebar {
            padding: 16px !important;
          }

          .dl-admin-main {
            padding: 16px !important;
            overflow-x: hidden !important;
          }

          .dl-admin-top {
            display: block !important;
            margin-bottom: 16px !important;
          }

          .dl-admin-title {
            font-size: 28px !important;
            line-height: 1.1 !important;
          }

          .dl-admin-main section {
            padding: 16px !important;
            border-radius: 14px !important;
          }

          .dl-admin-main table {
            min-width: 760px !important;
          }

          .dl-admin-main button,
          .dl-admin-main a[role='button'] {
            min-height: 44px !important;
          }

          .dl-admin-main textarea {
            min-height: 110px !important;
          }
        }
      `}</style>
      <aside className="dl-admin-sidebar" style={sidebarStyle}>
        <div style={brandStyle}>
          <div style={markStyle}>DL</div>
          <div>
            <strong>DynLander</strong><br />
            <span style={smallStyle}>Multi-platform ad analyzer</span>
          </div>
        </div>
        <AdminPlatformNav />
      </aside>
      <main className="dl-admin-main" style={mainStyle}>
        <div className="dl-admin-top" style={topStyle}>
          <div>
            <h1 className="dl-admin-title" style={titleStyle}>{title}</h1>
            <p style={subtitleStyle}>{subtitle}</p>
          </div>
          {action}
        </div>
        <ActiveAccountBanner />
        <ModeSafetyBanner />
        {children}
      </main>
    </div>
  );
}
