'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useMetaDataMode } from '../_components/useMetaDataMode';
import { metaCreatives } from '../_data/metaMockData';

type LiveCreative = { id: string; ad: string; status: string; effectiveStatus: string; creativeType: string; primaryText: string; headline: string; description: string; cta: string; destinationUrl: string; frequency: string; ctr: string; cpc: string; cpm: string; spend: string; impressions: string; clicks: string; fatigue: string; recommendation: string };
type ReviewData = { ok: boolean; source: string; creatives: LiveCreative[]; checkedAt?: string };

function normalizeMockRows(): LiveCreative[] {
  return metaCreatives.map((row) => ({ id: row.ad, ad: row.ad, status: 'Demo', effectiveStatus: 'Demo', creativeType: row.creativeType, primaryText: row.primaryText, headline: row.headline, description: row.description, cta: row.cta, destinationUrl: row.destinationUrl, frequency: row.frequency, ctr: row.ctr, cpc: '—', cpm: '—', spend: '—', impressions: '—', clicks: '—', fatigue: row.fatigue, recommendation: row.recommendation }));
}

export default function MetaCreativeLiveReview() {
  const { selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading Meta review data...');

  async function loadReview() {
    if (isDemoMode) {
      setData(null);
      setLoading(false);
      setMessage('Demo mode is selected. Switch to the connected account mode to read the active account.');
      return;
    }
    setLoading(true);
    setMessage(`Loading review data for ${selectedAccount.name}...`);
    try {
      const response = await fetch(`/api/meta-ads/ad-review-data?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' });
      const result = await response.json();
      setData(result);
      setMessage(result.ok ? `Showing live review data for ${selectedAccount.name}.` : `Live review data is not readable for ${selectedAccount.name}.`);
    } catch {
      setData(null);
      setMessage(`Live review request failed for ${selectedAccount.name}.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReview(); }, [isDemoMode, selectedAccount.customerId]);

  const isLive = Boolean(!isDemoMode && data?.ok && data.creatives?.length);
  const rows = isLive ? data?.creatives || [] : normalizeMockRows();
  const watchCount = rows.filter((row) => row.fatigue !== 'Good').length;
  const goodCount = rows.filter((row) => row.fatigue === 'Good').length;

  return (
    <>
      <section style={{ ...cardStyle, border: isLive ? '1px solid #16a34a' : '1px solid #f97316', background: isLive ? '#f0fdf4' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div><h2 style={{ marginTop: 0 }}>Meta creative review</h2><p style={{ color: isLive ? '#166534' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{message}</p></div>
          <button type="button" style={blueButtonStyle} onClick={loadReview}>{isDemoMode ? 'Demo mode active' : loading ? 'Checking...' : 'Refresh active account review'}</button>
        </div>
      </section>
      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Active account</div><strong style={{ fontSize: 28 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 28 }}>{isLive ? 'Live read only' : isDemoMode ? 'Demo' : 'Not live for active account'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{isDemoMode ? 'demo_mode' : data?.source || 'not_live'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Reviewed</div><strong style={{ fontSize: 28 }}>{rows.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Rows for the active account when live.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Needs review</div><strong style={{ fontSize: 28 }}>{watchCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Watch list.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Good</div><strong style={{ fontSize: 28 }}>{goodCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Currently okay.</p></div>
      </div>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>{isLive ? 'Live active-account review rows' : 'Demo or unavailable review rows'}</h2>
        <table style={tableStyle}><thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Type</th><th style={thTdStyle}>Primary text</th><th style={thTdStyle}>Headline</th><th style={thTdStyle}>Description</th><th style={thTdStyle}>CTA</th><th style={thTdStyle}>URL</th><th style={thTdStyle}>Frequency</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Fatigue</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.ad}</td><td style={thTdStyle}>{row.effectiveStatus || row.status}</td><td style={thTdStyle}>{row.creativeType}</td><td style={thTdStyle}>{row.primaryText}</td><td style={thTdStyle}>{row.headline}</td><td style={thTdStyle}>{row.description}</td><td style={thTdStyle}>{row.cta}</td><td style={thTdStyle}>{row.destinationUrl}</td><td style={thTdStyle}>{row.frequency}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.fatigue}</td></tr>)}</tbody></table>
      </section>
    </>
  );
}
