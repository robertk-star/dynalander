'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { metaAdSets, metaCampaigns, metaRecommendations, metaSummary } from '../_data/metaMockData';

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
};

export default function MetaAdsLiveDashboard() {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading Meta read-only data...');

  async function loadPreview() {
    setLoading(true);
    setMessage('Loading Meta read-only data...');
    try {
      const response = await fetch('/api/meta-ads/read-only-preview', { cache: 'no-store' });
      const result = await response.json();
      setData(result);
      setMessage(result.ok ? 'Showing live Meta read-only data.' : 'Showing mock fallback because live Meta data is not readable yet.');
    } catch {
      setData(null);
      setMessage('Showing mock fallback because the read-only request failed.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPreview();
  }, []);

  const summary = data?.summary;
  const liveCampaigns = data?.campaigns || [];
  const liveAdSets = data?.adSets || [];
  const liveAds = data?.ads || [];
  const liveInsights = data?.insights || [];
  const isLive = Boolean(data?.ok && summary);

  return (
    <>
      <section style={{ ...cardStyle, border: isLive ? '1px solid #16a34a' : '1px solid #f97316', background: isLive ? '#f0fdf4' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta Ads Intelligence</h2>
            <p style={{ color: isLive ? '#166534' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{message}</p>
          </div>
          <button type="button" style={blueButtonStyle} onClick={loadPreview}>{loading ? 'Checking...' : 'Refresh live data'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 28 }}>{isLive ? 'Live read only' : 'Mock fallback'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{data?.source || 'mock_fallback'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 28 }}>{summary?.spend || metaSummary.spend}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Last 7 days when live.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Impressions</div><strong style={{ fontSize: 28 }}>{summary?.impressions || metaSummary.impressions}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Meta impressions.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Clicks</div><strong style={{ fontSize: 28 }}>{summary?.clicks || '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Meta clicks.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 28 }}>{summary?.ctr || metaSummary.ctr}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Click-through rate.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CPC / CPM</div><strong style={{ fontSize: 28 }}>{summary ? `${summary.cpc} / ${summary.cpm}` : `${metaSummary.cpc} / ${metaSummary.cpm}`}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Traffic cost.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Campaigns</div><strong style={{ fontSize: 28 }}>{summary?.campaignCount ?? metaCampaigns.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Readable campaigns.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ad sets / Ads</div><strong style={{ fontSize: 28 }}>{summary ? `${summary.adSetCount} / ${summary.adCount}` : `${metaAdSets.length} / —`}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Readable ad sets and ads.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>{isLive ? 'Live campaign review' : 'Mock campaign review'}</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Objective</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>ID</th></tr></thead>
          <tbody>{isLive ? liveCampaigns.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.objective || '—'}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.id}</td></tr>) : metaCampaigns.map((row) => <tr key={row.campaign}><td style={thTdStyle}>{row.campaign}</td><td style={thTdStyle}>{row.objective}</td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>Mock</td><td style={thTdStyle}>—</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>{isLive ? 'Live ad set review' : 'Mock ad set review'}</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>Daily budget</th><th style={thTdStyle}>Lifetime budget</th></tr></thead>
          <tbody>{isLive ? liveAdSets.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.daily_budget || '—'}</td><td style={thTdStyle}>{row.lifetime_budget || '—'}</td></tr>) : metaAdSets.map((row) => <tr key={row.adSet}><td style={thTdStyle}>{row.adSet}</td><td style={thTdStyle}>Mock</td><td style={thTdStyle}>Mock</td><td style={thTdStyle}>{row.budget}</td><td style={thTdStyle}>—</td></tr>)}</tbody>
        </table>
      </section>

      {isLive ? <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live ads</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Effective status</th><th style={thTdStyle}>Campaign ID</th><th style={thTdStyle}>Ad set ID</th></tr></thead>
          <tbody>{liveAds.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.status || '—'}</td><td style={thTdStyle}>{row.effective_status || '—'}</td><td style={thTdStyle}>{row.campaign_id || '—'}</td><td style={thTdStyle}>{row.adset_id || '—'}</td></tr>)}</tbody>
        </table>
      </section> : null}

      {isLive ? <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live insight rows</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Date start</th><th style={thTdStyle}>Date stop</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
          <tbody>{liveInsights.map((row, index) => <tr key={`${row.date_start}-${index}`}><td style={thTdStyle}>{row.date_start || '—'}</td><td style={thTdStyle}>{row.date_stop || '—'}</td><td style={thTdStyle}>{row.spend || '0'}</td><td style={thTdStyle}>{row.impressions || '0'}</td><td style={thTdStyle}>{row.clicks || '0'}</td><td style={thTdStyle}>{row.ctr || '0'}</td><td style={thTdStyle}>{row.cpc || '0'}</td><td style={thTdStyle}>{row.cpm || '0'}</td></tr>)}</tbody>
        </table>
      </section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Recommendations</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Priority</th><th style={thTdStyle}>Area</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Reason</th></tr></thead>
          <tbody>{metaRecommendations.map((row) => <tr key={row.recommendation}><td style={thTdStyle}>{row.priority}</td><td style={thTdStyle}>{row.area}</td><td style={thTdStyle}>{row.recommendation}</td><td style={thTdStyle}>{row.reason}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Safety lock</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>This page uses read-only Meta API calls only. It does not save live Meta data or change Facebook ads.</p>
      </section>
    </>
  );
}
