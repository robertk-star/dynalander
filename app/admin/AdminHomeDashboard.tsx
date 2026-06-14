'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from './_components/adminStyles';
import { useActiveAccount } from './_components/useActiveAccount';
import { useActivePlatform } from './_components/useActivePlatform';
import { useMetaDataMode } from './_components/useMetaDataMode';
import { getAccountBestTheme, getAccountLeads, getAccountThemePerformance } from './_data/accountScopedData';

type MetaPreview = {
  ok: boolean;
  source: string;
  summary: null | {
    spend: string;
    impressions: string;
    clicks: string;
    ctr: string;
    cpc: string;
    cpm: string;
    campaignCount: number;
    adSetCount: number;
    adCount: number;
  };
  campaigns: any[];
  adSets: any[];
  ads: any[];
  insights: any[];
  readiness?: { mode?: string; error?: string };
};

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
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [data, setData] = useState<MetaPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading active account Meta data...');

  async function loadData() {
    if (isDemoMode) {
      setData(null);
      setLoading(false);
      setMessage('Demo mode is selected. Switch to Connected Live Meta Account to load active account data.');
      return;
    }

    setLoading(true);
    setMessage(`Loading live Meta data for ${selectedAccount.name}...`);
    try {
      const response = await fetch(`/api/meta-ads/read-only-preview?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' });
      const result = await response.json();
      setData(result);
      setMessage(result.ok ? `Showing live Meta data for ${selectedAccount.name}.` : `Live Meta data is not readable for ${selectedAccount.name}.`);
    } catch {
      setData(null);
      setMessage(`Live Meta request failed for ${selectedAccount.name}.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [isDemoMode, selectedAccount.customerId]);

  const isLive = Boolean(!isDemoMode && data?.ok && data.summary);
  const summary = data?.summary;
  const campaigns = data?.campaigns || [];
  const ads = data?.ads || [];
  const activeCampaigns = campaigns.filter((row) => row.effective_status === 'ACTIVE' || row.status === 'ACTIVE').length;
  const activeAds = ads.filter((row) => row.effective_status === 'ACTIVE' || row.status === 'ACTIVE').length;

  return (
    <>
      <section style={{ ...cardStyle, border: isLive ? '2px solid #0f766e' : '2px solid #f97316', background: isLive ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <strong>Meta Ads dashboard summary</strong>
            <p style={{ color: isLive ? '#0f766e' : '#9a3412', fontWeight: 800, marginBottom: 0, lineHeight: 1.6 }}>{message}</p>
          </div>
          <button type="button" onClick={loadData} style={blueButtonStyle}>{loading ? 'Checking...' : isDemoMode ? 'Demo mode active' : 'Refresh active account'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Active account</div><strong style={{ fontSize: 30 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 30 }}>{isLive ? 'Live read-only' : isDemoMode ? 'Demo' : 'Not live for active account'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{isLive ? data?.source : data?.readiness?.mode || 'not_live'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 34 }}>{summary?.spend || '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Rolled up from active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Impressions</div><strong style={{ fontSize: 34 }}>{summary?.impressions || '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Rolled up from active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Clicks</div><strong style={{ fontSize: 34 }}>{summary?.clicks || '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Rolled up from active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 34 }}>{summary?.ctr || '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Rolled up from active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Campaigns</div><strong style={{ fontSize: 34 }}>{summary?.campaignCount ?? '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{activeCampaigns} active.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ad sets / Ads</div><strong style={{ fontSize: 34 }}>{summary ? `${summary.adSetCount} / ${summary.adCount}` : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{activeAds} active ads.</p></div>
      </div>

      {isLive ? <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Active-account campaign summary</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Objective</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>ID</th></tr></thead>
          <tbody>{campaigns.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.objective || '—'}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.id}</td></tr>)}</tbody>
        </table>
      </section> : null}

      {isLive ? <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Active-account ads</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>Campaign ID</th><th style={thTdStyle}>Ad set ID</th></tr></thead>
          <tbody>{ads.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.campaign_id || '—'}</td><td style={thTdStyle}>{row.adset_id || '—'}</td></tr>)}</tbody>
        </table>
      </section> : null}

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Safety lock</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>This dashboard resolves the active account first. Meta writes remain disabled.</p>
      </section>
    </>
  );
}

export default function AdminHomeDashboard() {
  const { platform } = useActivePlatform();
  return platform === 'meta_ads' ? <MetaHomeDashboard /> : <GoogleHomeDashboard />;
}
