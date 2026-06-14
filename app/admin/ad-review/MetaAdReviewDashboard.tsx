'use client';

import { useEffect, useMemo, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useMetaDataMode } from '../_components/useMetaDataMode';
import { metaCreatives } from '../_data/metaMockData';

type CreativeRow = {
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

type ReviewData = { ok: boolean; source: string; creatives: CreativeRow[]; error?: string };

function mockRows(): CreativeRow[] {
  return metaCreatives.map((row) => ({ id: row.ad, ad: row.ad, status: 'Demo', effectiveStatus: 'Demo', creativeType: row.creativeType, primaryText: row.primaryText, headline: row.headline, description: row.description, cta: row.cta, destinationUrl: row.destinationUrl, frequency: row.frequency, ctr: row.ctr, cpc: '—', cpm: '—', spend: '—', impressions: '—', clicks: '—', fatigue: row.fatigue, recommendation: row.recommendation }));
}

export default function MetaAdReviewDashboard() {
  const { selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading Meta ad review data...');

  async function loadReview() {
    if (isDemoMode) {
      setData(null);
      setLoading(false);
      setMessage('Demo/mock mode is selected. Switch Meta Data Mode to Connected Live Meta Account to read the active account.');
      return;
    }

    setLoading(true);
    setMessage(`Loading Meta ad review data for ${selectedAccount.name}...`);
    try {
      const response = await fetch(`/api/meta-ads/ad-review-data?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' });
      const result = await response.json();
      setData(result);
      setMessage(result.ok ? `Showing live Meta ad review data for ${selectedAccount.name}.` : `Live Meta ad review data is not readable for ${selectedAccount.name}.`);
    } catch {
      setData(null);
      setMessage(`Meta ad review request failed for ${selectedAccount.name}.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReview(); }, [isDemoMode, selectedAccount.customerId]);

  const isLive = Boolean(!isDemoMode && data?.ok && data.creatives?.length);
  const rows = useMemo(() => isLive ? data?.creatives || [] : mockRows(), [isLive, data]);
  const watchCount = rows.filter((row) => row.fatigue !== 'Good').length;
  const activeCount = rows.filter((row) => row.effectiveStatus === 'ACTIVE' || row.status === 'ACTIVE').length;

  return (
    <>
      <section style={{ ...cardStyle, border: isLive ? '2px solid #0f766e' : '2px solid #f97316', background: isLive ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div><h2 style={{ marginTop: 0 }}>Meta ad review</h2><p style={{ color: isLive ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{message}</p></div>
          <button type="button" onClick={loadReview} style={blueButtonStyle}>{loading ? 'Checking...' : isDemoMode ? 'Demo mode active' : 'Refresh active account review'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Active account</div><strong style={{ fontSize: 26 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 26 }}>{isLive ? 'Live read-only' : isDemoMode ? 'Demo / Mock' : 'Not live for active account'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{isLive ? data?.source : 'No live changes.'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ads reviewed</div><strong style={{ fontSize: 26 }}>{rows.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Rows for active account when live.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Active ads</div><strong style={{ fontSize: 26 }}>{activeCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Returned as active by Meta.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Needs review</div><strong style={{ fontSize: 26 }}>{watchCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Fatigue or weak signals.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>{isLive ? 'Live active-account ad review rows' : 'Demo or unavailable ad review rows'}</h2>
        <table style={tableStyle}><thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Type</th><th style={thTdStyle}>Primary text</th><th style={thTdStyle}>Headline</th><th style={thTdStyle}>CTA</th><th style={thTdStyle}>URL</th><th style={thTdStyle}>Frequency</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Recommendation</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.ad}</td><td style={thTdStyle}>{row.effectiveStatus || row.status}</td><td style={thTdStyle}>{row.creativeType}</td><td style={thTdStyle}>{row.primaryText}</td><td style={thTdStyle}>{row.headline}</td><td style={thTdStyle}>{row.cta}</td><td style={thTdStyle}>{row.destinationUrl}</td><td style={thTdStyle}>{row.frequency}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.recommendation}</td></tr>)}</tbody></table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Read-only lock</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>Every card on this page is scoped through the active account first. Meta changes remain disabled.</p>
      </section>
    </>
  );
}
