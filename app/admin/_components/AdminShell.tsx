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
    <div style={shellStyle}>
      <aside style={sidebarStyle}>
        <div style={brandStyle}>
          <div style={markStyle}>DL</div>
          <div>
            <strong>DynLander</strong><br />
            <span style={smallStyle}>Multi-platform ad analyzer</span>
          </div>
        </div>
        <AdminPlatformNav />
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
        <ModeSafetyBanner />
        {children}
      </main>
    </div>
  );
}
