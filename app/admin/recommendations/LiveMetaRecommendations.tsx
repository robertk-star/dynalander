'use client';

import { useEffect, useMemo, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { metaRecommendations } from '../_data/metaMockData';

type LivePreview = {
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

type RecommendationRow = {
  priority: string;
  area: string;
  recommendation: string;
  reason: string;
};

function numberFromMoney(value?: string) {
  return Number(String(value || '0').replace(/[^0-9.-]+/g, '')) || 0;
}

function numberFromPercent(value?: string) {
  return Number(String(value || '0').replace('%', '')) || 0;
}

function buildLiveRecommendations(data: LivePreview | null): RecommendationRow[] {
  if (!data?.ok || !data.summary) {
    return metaRecommendations.map((row) => ({ priority: row.priority, area: row.area, recommendation: row.recommendation, reason: row.reason }));
  }

  const rows: RecommendationRow[] = [];
  const spend = numberFromMoney(data.summary.spend);
  const ctr = numberFromPercent(data.summary.ctr);
  const cpc = numberFromMoney(data.summary.cpc);
  const activeCampaigns = data.campaigns.filter((row) => row.effective_status === 'ACTIVE' || row.status === 'ACTIVE').length;
  const pausedAds = data.ads.filter((row) => row.effective_status === 'PAUSED' || row.status === 'PAUSED').length;
  const insight = data.insights[0] || {};
  const frequency = Number(insight.frequency || 0);

  if (ctr < 1 && spend > 0) rows.push({ priority: 'High', area: 'Click quality', recommendation: 'Review Meta ad creative and offer match.', reason: `Live CTR is ${data.summary.ctr}, which may show weak ad-to-audience fit.` });
  if (frequency >= 2) rows.push({ priority: 'High', area: 'Creative fatigue', recommendation: 'Refresh creative before adding more budget.', reason: `Live frequency is ${frequency.toFixed(2)}, which can indicate fatigue.` });
  if (cpc > 5) rows.push({ priority: 'Medium', area: 'Traffic cost', recommendation: 'Review targeting, placement mix, and message clarity.', reason: `Live CPC is ${data.summary.cpc}.` });
  if (activeCampaigns === 0) rows.push({ priority: 'High', area: 'Delivery', recommendation: 'Check campaign delivery before judging performance.', reason: 'No active campaigns were returned in the live preview.' });
  if (pausedAds > 0) rows.push({ priority: 'Medium', area: 'Ad status', recommendation: 'Review paused ads and confirm whether they should stay paused.', reason: `${pausedAds} paused ad(s) were returned by Meta.` });

  rows.push({ priority: 'Medium', area: 'Read-only review', recommendation: 'Compare live Meta performance against saved recommendation actions.', reason: 'DynLander can now read live Meta campaign, ad set, ad, and insight data.' });

  return rows;
}

export default function LiveMetaRecommendations() {
  const [data, setData] = useState<LivePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading live Meta recommendations...');

  async function loadData() {
    setLoading(true);
    setMessage('Loading live Meta recommendations...');
    try {
      const response = await fetch('/api/meta-ads/read-only-preview', { cache: 'no-store' });
      const result = await response.json();
      setData(result);
      setMessage(result.ok ? 'Showing live Meta recommendations from read-only data.' : 'Showing mock fallback because live Meta data is not readable yet.');
    } catch {
      setData(null);
      setMessage('Showing mock fallback because the live Meta request failed.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const recommendations = useMemo(() => buildLiveRecommendations(data), [data]);
  const isLive = Boolean(data?.ok && data.summary);

  return (
    <>
      <section style={{ ...cardStyle, border: isLive ? '1px solid #16a34a' : '1px solid #f97316', background: isLive ? '#f0fdf4' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>{isLive ? 'Live Meta recommendations' : 'Meta recommendations'}</h2>
            <p style={{ color: isLive ? '#166534' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{message}</p>
          </div>
          <button type="button" style={blueButtonStyle} onClick={loadData}>{loading ? 'Checking...' : 'Refresh recommendations'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 32 }}>{isLive ? 'Live read only' : 'Mock fallback'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 32 }}>{data?.summary?.spend || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 32 }}>{data?.summary?.ctr || '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Recommendations</div><strong style={{ fontSize: 32 }}>{recommendations.length}</strong></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Priority recommendations</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Priority</th><th style={thTdStyle}>Area</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Reason</th></tr></thead>
          <tbody>{recommendations.map((row) => <tr key={`${row.area}-${row.recommendation}`}><td style={thTdStyle}>{row.priority}</td><td style={thTdStyle}>{row.area}</td><td style={thTdStyle}>{row.recommendation}</td><td style={thTdStyle}>{row.reason}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Keep / watch / refresh logic</h2>
        <table style={tableStyle}>
          <tbody>
            <tr><td style={thTdStyle}><strong>Keep</strong></td><td style={thTdStyle}>Keep creatives or settings that maintain acceptable CTR, CPC, and delivery.</td></tr>
            <tr><td style={thTdStyle}><strong>Watch</strong></td><td style={thTdStyle}>Watch low-data rows, rising CPC, or borderline CTR before taking action.</td></tr>
            <tr><td style={thTdStyle}><strong>Refresh</strong></td><td style={thTdStyle}>Refresh ads with low CTR, high frequency, or weak offer match.</td></tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
