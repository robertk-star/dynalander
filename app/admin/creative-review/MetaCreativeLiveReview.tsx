'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { metaCreatives } from '../_data/metaMockData';

type LiveCreative = {
  id: string;
  ad: string;
  status: string;
  effectiveStatus: string;
  creativeType: string;
  primaryText: string;
  headline: string;
  description: string;
  cta: string;
  destinationUrl: string;
  frequency: string;
  ctr: string;
  cpc: string;
  cpm: string;
  spend: string;
  impressions: string;
  clicks: string;
  fatigue: string;
  recommendation: string;
};

type ReviewData = {
  ok: boolean;
  source: string;
  creatives: LiveCreative[];
  checkedAt?: string;
};

function normalizeMockRows(): LiveCreative[] {
  return metaCreatives.map((row) => ({
    id: row.ad,
    ad: row.ad,
    status: 'Mock',
    effectiveStatus: 'Mock',
    creativeType: row.creativeType,
    primaryText: row.primaryText,
    headline: row.headline,
    description: row.description,
    cta: row.cta,
    destinationUrl: row.destinationUrl,
    frequency: row.frequency,
    ctr: row.ctr,
    cpc: '—',
    cpm: '—',
    spend: '—',
    impressions: '—',
    clicks: '—',
    fatigue: row.fatigue,
    recommendation: row.recommendation
  }));
}

export default function MetaCreativeLiveReview() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading Meta ad review data...');

  async function loadReview() {
    setLoading(true);
    setMessage('Loading Meta ad review data...');
    try {
      const response = await fetch('/api/meta-ads/ad-review-data', { cache: 'no-store' });
      const result = await response.json();
      setData(result);
      setMessage(result.ok ? 'Showing live Meta read-only ad review data.' : 'Showing mock fallback because live ad review data is not readable yet.');
    } catch {
      setData(null);
      setMessage('Showing mock fallback because the read-only request failed.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReview();
  }, []);

  const isLive = Boolean(data?.ok && data.creatives?.length);
  const rows = isLive ? data?.creatives || [] : normalizeMockRows();
  const watchCount = rows.filter((row) => row.fatigue !== 'Good').length;
  const goodCount = rows.filter((row) => row.fatigue === 'Good').length;

  return (
    <>
      <section style={{ ...cardStyle, border: isLive ? '1px solid #16a34a' : '1px solid #f97316', background: isLive ? '#f0fdf4' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta creative review</h2>
            <p style={{ color: isLive ? '#166534' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{message}</p>
          </div>
          <button type="button" style={blueButtonStyle} onClick={loadReview}>{loading ? 'Checking...' : 'Refresh review'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 28 }}>{isLive ? 'Live read only' : 'Mock fallback'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{data?.source || 'mock_fallback'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ads reviewed</div><strong style={{ fontSize: 28 }}>{rows.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Readable ads.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Needs review</div><strong style={{ fontSize: 28 }}>{watchCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Fatigue or low CTR watch list.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Good</div><strong style={{ fontSize: 28 }}>{goodCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Currently okay.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>{isLive ? 'Live ad copy review' : 'Mock ad copy review'}</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Type</th><th style={thTdStyle}>Primary text</th><th style={thTdStyle}>Headline</th><th style={thTdStyle}>Description</th><th style={thTdStyle}>CTA</th><th style={thTdStyle}>URL</th><th style={thTdStyle}>Frequency</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Fatigue</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.ad}</td><td style={thTdStyle}>{row.effectiveStatus || row.status}</td><td style={thTdStyle}>{row.creativeType}</td><td style={thTdStyle}>{row.primaryText}</td><td style={thTdStyle}>{row.headline}</td><td style={thTdStyle}>{row.description}</td><td style={thTdStyle}>{row.cta}</td><td style={thTdStyle}>{row.destinationUrl}</td><td style={thTdStyle}>{row.frequency}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.fatigue}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Creative recommendations</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Recommendation</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.ad}</td><td style={thTdStyle}>{row.recommendation}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Safety lock</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>This page uses read-only Meta API calls only. It does not edit ads, creatives, copy, URLs, CTAs, or budgets.</p>
      </section>
    </>
  );
}
