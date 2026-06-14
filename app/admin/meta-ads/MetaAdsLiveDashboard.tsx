'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useMetaDataMode } from '../_components/useMetaDataMode';
import { metaAdSets, metaCampaigns, metaSummary } from '../_data/metaMockData';

type PreviewData = {
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
  checkedAt?: string;
  readiness?: { mode?: string; account?: { name?: string }; requestedAdAccountId?: string; configuredAdAccountId?: string };
};

export default function MetaAdsLiveDashboard() {
  const { selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading Meta read-only data...');

  async function loadPreview() {
    if (isDemoMode) {
      setData(null);
      setLoading(false);
      setMessage('Demo/mock mode is selected. Switch Meta Data Mode to Connected Live Meta Account to read the active account.');
      return;
    }

    setLoading(true);
    setMessage(`Loading Meta read-only data for ${selectedAccount.name}...`);
    try {
      const response = await fetch(`/api/meta-ads/read-only-preview?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' });
      const result = await response.json();
      setData(result);
      setMessage(result.ok ? `Showing live Meta read-only data for ${selectedAccount.name}.` : `Live Meta data is not readable for ${selectedAccount.name}.`);
    } catch {
      setData(null);
      setMessage(`Live Meta request failed for ${selectedAccount.name}.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPreview();
  }, [isDemoMode, selectedAccount.customerId]);

  const summary = data?.summary;
  const liveCampaigns = data?.campaigns || [];
  const liveAdSets = data?.adSets || [];
  const liveAds = data?.ads || [];
  const liveInsights = data?.insights || [];
  const isLive = Boolean(!isDemoMode && data?.ok && summary);

  return (
    <>
      <section style={{ ...cardStyle, border: isLive ? '1px solid #16a34a' : '1px solid #f97316', background: isLive ? '#f0fdf4' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta Ads Intelligence</h2>
            <p style={{ color: isLive ? '#166534' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{message}</p>
          </div>
          <button type="button" style={blueButtonStyle} onClick={loadPreview}>{isDemoMode ? 'Demo mode active' : loading ? 'Checking...' : 'Refresh active account data'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Active account</div><strong style={{ fontSize: 28 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 28 }}>{isLive ? 'Live read only' : isDemoMode ? 'Demo / Mock' : 'Not live for active account'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{isDemoMode ? 'demo_mode' : data?.source || data?.readiness?.mode || 'not_live'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 28 }}>{summary?.spend || metaSummary.spend}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Rolled up from active account when live.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Impressions</div><strong style={{ fontSize: 28 }}>{summary?.impressions || metaSummary.impressions}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Active account impressions.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Clicks</div><strong style={{ fontSize: 28 }}>{summary?.clicks || '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Active account clicks.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 28 }}>{summary?.ctr || metaSummary.ctr}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Active account click-through rate.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CPC / CPM</div><strong style={{ fontSize: 28 }}>{summary ? `${summary.cpc} / ${summary.cpm}` : `${metaSummary.cpc} / ${metaSummary.cpm}`}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Active account traffic cost.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Campaigns</div><strong style={{ fontSize: 28 }}>{summary?.campaignCount ?? metaCampaigns.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Readable campaigns for active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ad sets / Ads</div><strong style={{ fontSize: 28 }}>{summary ? `${summary.adSetCount} / ${summary.adCount}` : `${metaAdSets.length} / —`}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Readable ad sets and ads for active account.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>{isLive ? 'Live active-account campaign review' : 'Demo or unavailable campaign review'}</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Objective</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>ID</th></tr></thead>
          <tbody>{isLive ? liveCampaigns.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.objective || '—'}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.id}</td></tr>) : metaCampaigns.map((row) => <tr key={row.campaign}><td style={thTdStyle}>{row.campaign}</td><td style={thTdStyle}>{row.objective}</td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>Demo</td><td style={thTdStyle}>—</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>{isLive ? 'Live active-account ad set review' : 'Demo or unavailable ad set review'}</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>Daily budget</th><th style={thTdStyle}>Lifetime budget</th></tr></thead>
          <tbody>{isLive ? liveAdSets.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.daily_budget || '—'}</td><td style={thTdStyle}>{row.lifetime_budget || '—'}</td></tr>) : metaAdSets.map((row) => <tr key={row.adSet}><td style={thTdStyle}>{row.adSet}</td><td style={thTdStyle}>Demo</td><td style={thTdStyle}>Demo</td><td style={thTdStyle}>{row.budget}</td><td style={thTdStyle}>—</td></tr>)}</tbody>
        </table>
      </section>

      {isLive ? <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live active-account ads</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>Campaign ID</th><th style={thTdStyle}>Ad set ID</th></tr></thead>
          <tbody>{liveAds.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.campaign_id || '—'}</td><td style={thTdStyle}>{row.adset_id || '—'}</td></tr>)}</tbody>
        </table>
      </section> : null}

      {isLive ? <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live active-account insight rows</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Date start</th><th style={thTdStyle}>Date stop</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
          <tbody>{liveInsights.map((row, index) => <tr key={`${row.date_start}-${index}`}><td style={thTdStyle}>{row.date_start || '—'}</td><td style={thTdStyle}>{row.date_stop || '—'}</td><td style={thTdStyle}>{row.spend || '0'}</td><td style={thTdStyle}>{row.impressions || '0'}</td><td style={thTdStyle}>{row.clicks || '0'}</td><td style={thTdStyle}>{row.ctr || '0'}</td><td style={thTdStyle}>{row.cpc || '0'}</td><td style={thTdStyle}>{row.cpm || '0'}</td></tr>)}</tbody>
        </table>
      </section> : null}

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Safety lock</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>Every card on this page is scoped through the active account first. Meta writes remain disabled.</p>
      </section>
    </>
  );
}
