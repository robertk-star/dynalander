'use client';

import AdminShell from './_components/AdminShell';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from './_components/adminStyles';
import { useActiveAccount } from './_components/useActiveAccount';
import { getAccountBestTheme, getAccountLeads, getAccountThemePerformance } from './_data/accountScopedData';

export default function DynLanderAdminPage() {
  const { accountId, selectedAccount } = useActiveAccount();
  const themePerformance = getAccountThemePerformance(accountId);
  const leads = getAccountLeads(accountId);
  const totalClicks = themePerformance.reduce((sum, row) => sum + row.clicks, 0);
  const totalLeads = themePerformance.reduce((sum, row) => sum + row.leads, 0);
  const conversionRate = ((totalLeads / totalClicks) * 100).toFixed(1);
  const bestTheme = getAccountBestTheme(accountId);

  return (
    <AdminShell
      title="DynLander Admin"
      subtitle="Manage dynamic landing pages, seller-intent themes, Google Ads URLs, and home-buyer lead reporting. This demo now scopes mock data to the active client account."
      action={<a href="/admin/url-builder" style={blueButtonStyle}>Build Ad URL</a>}
    >
      <section style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
        <strong>Account-scoped dashboard</strong>
        <p style={{ color: '#475569', marginBottom: 0 }}>The summary below is generated from mock records for {selectedAccount.name}, not the shared default data.</p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Total clicks</div><strong style={{ fontSize: 34 }}>{totalClicks}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Total leads</div><strong style={{ fontSize: 34 }}>{totalLeads}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Conversion rate</div><strong style={{ fontSize: 34 }}>{conversionRate}%</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Best theme</div><strong style={{ fontSize: 34 }}>{bestTheme}</strong></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Theme performance</h2>
        <table style={tableStyle}>
          <thead>
            <tr><th style={thTdStyle}>Theme</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>Conversion</th><th style={thTdStyle}>Demo CPL</th></tr>
          </thead>
          <tbody>
            {themePerformance.map((row) => (
              <tr key={row.theme}><td style={thTdStyle}>{row.theme}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.conversion}</td><td style={thTdStyle}>{row.cpl}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>AI-style recommendations</h2>
        <div style={gridStyle}>
          <div><strong>Review {bestTheme}</strong><p style={{ color: '#64748b' }}>{bestTheme} is the current top account-specific theme for {selectedAccount.name}.</p></div>
          <div><strong>Keep account context active</strong><p style={{ color: '#64748b' }}>Recommendations should only use data from the active account shown in the banner above.</p></div>
          <div><strong>Create local variants</strong><p style={{ color: '#64748b' }}>Use the selected account market before generating city-specific landing pages.</p></div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recent leads</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Name</th><th style={thTdStyle}>Phone</th><th style={thTdStyle}>City</th><th style={thTdStyle}>Theme</th><th style={thTdStyle}>Status</th></tr></thead>
          <tbody>{leads.slice(0, 4).map((lead) => <tr key={lead.phone}><td style={thTdStyle}>{lead.name}</td><td style={thTdStyle}>{lead.phone}</td><td style={thTdStyle}>{lead.city}</td><td style={thTdStyle}>{lead.theme}</td><td style={thTdStyle}>{lead.status}</td></tr>)}</tbody>
        </table>
      </section>
    </AdminShell>
  );
}
