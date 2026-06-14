'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useMetaDataMode } from '../_components/useMetaDataMode';

type AdRow = { id: string; name: string; status: string; effective_status: string; campaign_id: string; adset_id: string };
type InsightRow = { ad_id?: string; spend?: string; impressions?: string; clicks?: string; ctr?: string; cpc?: string; cpm?: string; frequency?: string };
type PreviewData = { ok: boolean; source: string; ads: AdRow[]; insights: InsightRow[]; error?: string; insightsError?: string | null };

function money(value?: string) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function pct(value?: string) {
  return `${Number(value || 0).toFixed(2)}%`;
}

export default function MetaLiveAdRows() {
  const { selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadRows() {
    if (isDemoMode) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/meta-ads/live-ad-rows?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' });
      setData(await response.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRows(); }, [isDemoMode, selectedAccount.customerId]);

  const insightMap = new Map((data?.insights || []).map((row) => [row.ad_id || '', row]));
  const rows = (data?.ads || []).map((ad) => ({ ad, insight: insightMap.get(ad.id) || {} }));
  const liveReady = Boolean(!isDemoMode && data?.ok && rows.length > 0);

  return (
    <>
      <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta live ad review</h2>
            <p style={{ color: liveReady ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
              {liveReady ? `Showing live ad rows for ${selectedAccount.name}.` : data?.error || `Live ad rows are not available for ${selectedAccount.name}.`}
            </p>
          </div>
          <button type="button" onClick={loadRows} style={blueButtonStyle}>{loading ? 'Checking...' : isDemoMode ? 'Demo mode active' : 'Refresh live rows'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Active account</div><strong style={{ fontSize: 28 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 28 }}>{liveReady ? 'Live read only' : isDemoMode ? 'Demo' : 'Not live'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{data?.source || 'No live rows loaded.'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ads returned</div><strong style={{ fontSize: 28 }}>{rows.length}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>From the active account.</p></div>
      </div>

      {data?.insightsError ? <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}><strong>Insight warning</strong><p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>{data.insightsError}</p></section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live active-account ad rows</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Campaign ID</th><th style={thTdStyle}>Ad set ID</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th><th style={thTdStyle}>Frequency</th></tr></thead>
          <tbody>{rows.map(({ ad, insight }) => <tr key={ad.id}><td style={thTdStyle}>{ad.name}</td><td style={thTdStyle}>{ad.effective_status || ad.status}</td><td style={thTdStyle}>{ad.campaign_id || '—'}</td><td style={thTdStyle}>{ad.adset_id || '—'}</td><td style={thTdStyle}>{money(insight.spend)}</td><td style={thTdStyle}>{Number(insight.impressions || 0).toLocaleString()}</td><td style={thTdStyle}>{Number(insight.clicks || 0).toLocaleString()}</td><td style={thTdStyle}>{pct(insight.ctr)}</td><td style={thTdStyle}>{money(insight.cpc)}</td><td style={thTdStyle}>{money(insight.cpm)}</td><td style={thTdStyle}>{insight.frequency || '0'}</td></tr>)}</tbody>
        </table>
        {!loading && rows.length === 0 ? <p style={{ color: '#64748b' }}>No live ad rows were returned for this active account.</p> : null}
      </section>
    </>
  );
}
