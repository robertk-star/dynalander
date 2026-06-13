'use client';

import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from './_components/adminStyles';
import { useActiveAccount } from './_components/useActiveAccount';
import { useActivePlatform } from './_components/useActivePlatform';
import { getAccountBestTheme, getAccountLeads, getAccountThemePerformance } from './_data/accountScopedData';
import { metaCampaigns, metaCreatives, metaRecommendations, metaSummary } from './_data/metaMockData';

function GoogleHomeDashboard() {
  const { accountId, selectedAccount } = useActiveAccount();
  const themePerformance = getAccountThemePerformance(accountId);
  const leads = getAccountLeads(accountId);
  const totalClicks = themePerformance.reduce((sum, row) => sum + row.clicks, 0);
  const totalLeads = themePerformance.reduce((sum, row) => sum + row.leads, 0);
  const conversionRate = totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : '0.0';
  const bestTheme = getAccountBestTheme(accountId);

  return (
    <>
      <section style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
        <strong>Google Ads dashboard summary</strong>
        <p style={{ color: '#475569', marginBottom: 0 }}>The summary below is generated from mock Google and landing page records for {selectedAccount.name}.</p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Total clicks</div><strong style={{ fontSize: 34 }}>{totalClicks}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Total leads</div><strong style={{ fontSize: 34 }}>{totalLeads}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Conversion rate</div><strong style={{ fontSize: 34 }}>{conversionRate}%</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Best theme</div><strong style={{ fontSize: 34 }}>{bestTheme}</strong></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Google theme performance</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Theme</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>Conversion</th><th style={thTdStyle}>Demo CPL</th></tr></thead>
          <tbody>{themePerformance.map((row) => <tr key={row.theme}><td style={thTdStyle}>{row.theme}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.conversion}</td><td style={thTdStyle}>{row.cpl}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recommended next action</h2>
        <div style={gridStyle}>
          <div><strong>Review {bestTheme}</strong><p style={{ color: '#64748b' }}>{bestTheme} is the current top account-specific theme for {selectedAccount.name}.</p></div>
          <div><strong>Check Snapshot Preview</strong><p style={{ color: '#64748b' }}>Save a normal Google mock snapshot, save a changed snapshot, then detect changes.</p></div>
          <div><strong>Open Ad Review</strong><p style={{ color: '#64748b' }}>Review headlines, descriptions, final URLs, sitelinks, and callouts.</p></div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recent leads</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Name</th><th style={thTdStyle}>Phone</th><th style={thTdStyle}>City</th><th style={thTdStyle}>Theme</th><th style={thTdStyle}>Status</th></tr></thead>
          <tbody>{leads.slice(0, 4).map((lead) => <tr key={lead.phone}><td style={thTdStyle}>{lead.name}</td><td style={thTdStyle}>{lead.phone}</td><td style={thTdStyle}>{lead.city}</td><td style={thTdStyle}>{lead.theme}</td><td style={thTdStyle}>{lead.status}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}

function MetaHomeDashboard() {
  const { selectedAccount } = useActiveAccount();
  const watchCreatives = metaCreatives.filter((creative) => creative.fatigue !== 'Good').length;
  const bestCampaign = metaCampaigns[0];

  return (
    <>
      <section style={{ ...cardStyle, border: '1px solid #fed7aa', background: '#fff7ed' }}>
        <strong>Meta Ads dashboard summary</strong>
        <p style={{ color: '#9a3412', marginBottom: 0 }}>The summary below is mock-only for {selectedAccount.name}. DynLander does not pull live Meta data or change Meta ads yet.</p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mock spend</div><strong style={{ fontSize: 34 }}>{metaSummary.spend}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mock leads</div><strong style={{ fontSize: 34 }}>{metaSummary.leads}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Cost per lead</div><strong style={{ fontSize: 34 }}>{metaSummary.costPerLead}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Creatives to watch</div><strong style={{ fontSize: 34 }}>{watchCreatives}</strong></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta campaign summary</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Reach</th><th style={thTdStyle}>Frequency</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>AI note</th></tr></thead>
          <tbody>{metaCampaigns.map((row) => <tr key={row.campaign}><td style={thTdStyle}>{row.campaign}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.reach}</td><td style={thTdStyle}>{row.frequency}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}>{row.aiNote}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recommended next action</h2>
        <div style={gridStyle}>
          <div><strong>Review {bestCampaign.campaign}</strong><p style={{ color: '#64748b' }}>This is the strongest mock Meta campaign by lead volume.</p></div>
          <div><strong>Refresh watched creatives</strong><p style={{ color: '#64748b' }}>{watchCreatives} creative rows are marked Watch or Needs refresh.</p></div>
          <div><strong>Open Meta Snapshot Preview</strong><p style={{ color: '#64748b' }}>Save a Meta mock snapshot, save a changed snapshot, then detect Meta changes.</p></div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta creative status</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Type</th><th style={thTdStyle}>Frequency</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>Fatigue</th></tr></thead>
          <tbody>{metaCreatives.map((row) => <tr key={row.ad}><td style={thTdStyle}>{row.ad}</td><td style={thTdStyle}>{row.creativeType}</td><td style={thTdStyle}>{row.frequency}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}>{row.fatigue}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}

export default function AdminHomeDashboard() {
  const { platform } = useActivePlatform();
  return platform === 'meta_ads' ? <MetaHomeDashboard /> : <GoogleHomeDashboard />;
}
