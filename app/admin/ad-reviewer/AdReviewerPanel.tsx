'use client';

import { useEffect, useMemo, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import { useMetaDataMode } from '../_components/useMetaDataMode';

type AdRow = { id: string; name: string; status: string; effective_status: string; campaign_id: string; adset_id: string };
type InsightRow = { ad_id?: string; spend?: string; impressions?: string; clicks?: string; ctr?: string; cpc?: string; cpm?: string; frequency?: string };
type ApiData = { ok: boolean; source: string; ads: AdRow[]; insights: InsightRow[]; error?: string; insightsError?: string | null };

type ReviewRow = { ad: AdRow; insight: InsightRow };

function money(value?: string) { return `$${Number(value || 0).toFixed(2)}`; }
function pct(value?: string) { return `${Number(value || 0).toFixed(2)}%`; }
function num(value?: string) { return Number(value || 0).toLocaleString(); }

function buildRecommendations(row: ReviewRow) {
  const ctr = Number(row.insight.ctr || 0);
  const cpc = Number(row.insight.cpc || 0);
  const frequency = Number(row.insight.frequency || 0);
  const clicks = Number(row.insight.clicks || 0);
  const impressions = Number(row.insight.impressions || 0);
  const items: Array<{ area: string; current: string; recommendation: string; reason: string }> = [];

  if (row.ad.effective_status !== 'ACTIVE') items.push({ area: 'Delivery status', current: row.ad.effective_status || row.ad.status || 'Unknown', recommendation: 'Confirm whether this ad should stay paused or be replaced by a new test.', reason: 'Paused or inactive ads do not produce new learning.' });
  if (impressions < 500) items.push({ area: 'Data volume', current: `${impressions.toLocaleString()} impressions`, recommendation: 'Do not judge this ad too strongly yet.', reason: 'The ad may not have enough delivery for a reliable decision.' });
  if (ctr > 0 && ctr < 1) items.push({ area: 'CTR', current: pct(row.insight.ctr), recommendation: 'Test a stronger hook or clearer first line.', reason: 'Low CTR can mean the creative or message is not earning enough attention.' });
  if (cpc > 2) items.push({ area: 'CPC', current: money(row.insight.cpc), recommendation: 'Review audience, placement, and message match before scaling.', reason: 'Higher CPC can increase cost before the lead quality is proven.' });
  if (frequency >= 2) items.push({ area: 'Frequency', current: String(row.insight.frequency || '0'), recommendation: 'Prepare a creative refresh or second variation.', reason: 'Higher frequency can lead to ad fatigue.' });
  if (clicks > 0 && ctr >= 1 && cpc <= 2 && frequency < 2) items.push({ area: 'Overall', current: 'Healthy early signals', recommendation: 'Keep monitoring before making a major change.', reason: 'The ad is not showing an obvious issue from the current metrics.' });
  if (items.length === 0) items.push({ area: 'Overall', current: 'Limited data', recommendation: 'Keep watching until more impressions and clicks come in.', reason: 'There is not enough data to make a strong recommendation yet.' });

  return items;
}

export default function AdReviewerPanel() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAdId, setSelectedAdId] = useState('');

  async function loadRows() {
    if (platform !== 'meta_ads' || isDemoMode) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/meta-ads/live-ad-rows?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' });
      const result = await response.json();
      setData(result);
      if (!selectedAdId && result?.ads?.[0]?.id) setSelectedAdId(result.ads[0].id);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRows(); }, [platform, isDemoMode, selectedAccount.customerId]);

  const rows: ReviewRow[] = useMemo(() => {
    const insightMap = new Map((data?.insights || []).map((item) => [item.ad_id || '', item]));
    return (data?.ads || []).map((ad) => ({ ad, insight: insightMap.get(ad.id) || {} }));
  }, [data]);

  const selected = rows.find((row) => row.ad.id === selectedAdId) || rows[0];
  const recommendations = selected ? buildRecommendations(selected) : [];
  const liveReady = Boolean(platform === 'meta_ads' && !isDemoMode && data?.ok && rows.length > 0);

  if (platform !== 'meta_ads') return <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Ad Reviewer</h2><p style={{ color: '#64748b' }}>Select Facebook / Meta Ads to review live Meta ads.</p></section>;

  return (
    <>
      <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div><h2 style={{ marginTop: 0 }}>Ad Reviewer</h2><p style={{ color: liveReady ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{liveReady ? `Loaded live ads for ${selectedAccount.name}.` : data?.error || `No live ads loaded for ${selectedAccount.name}.`}</p></div>
          <button type="button" onClick={loadRows} style={blueButtonStyle}>{loading ? 'Refreshing...' : 'Refresh ads'}</button>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={twoColumnStyle}>
          <label style={labelStyle}>Select ad to review<select style={inputStyle} value={selected?.ad.id || ''} onChange={(event) => setSelectedAdId(event.target.value)}>{rows.map((row) => <option key={row.ad.id} value={row.ad.id}>{row.ad.name || row.ad.id}</option>)}</select></label>
          <div><div style={{ color: '#64748b', fontWeight: 800 }}>Active account</div><strong style={{ fontSize: 26 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div>
        </div>
      </section>

      {selected ? <section style={twoColumnStyle}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Current live ad details</h2>
          <table style={tableStyle}><tbody>
            <tr><td style={thTdStyle}>Ad</td><td style={thTdStyle}>{selected.ad.name}</td></tr>
            <tr><td style={thTdStyle}>Ad ID</td><td style={thTdStyle}>{selected.ad.id}</td></tr>
            <tr><td style={thTdStyle}>Status</td><td style={thTdStyle}>{selected.ad.effective_status || selected.ad.status}</td></tr>
            <tr><td style={thTdStyle}>Campaign ID</td><td style={thTdStyle}>{selected.ad.campaign_id || '—'}</td></tr>
            <tr><td style={thTdStyle}>Ad set ID</td><td style={thTdStyle}>{selected.ad.adset_id || '—'}</td></tr>
            <tr><td style={thTdStyle}>Spend</td><td style={thTdStyle}>{money(selected.insight.spend)}</td></tr>
            <tr><td style={thTdStyle}>Impressions</td><td style={thTdStyle}>{num(selected.insight.impressions)}</td></tr>
            <tr><td style={thTdStyle}>Clicks</td><td style={thTdStyle}>{num(selected.insight.clicks)}</td></tr>
            <tr><td style={thTdStyle}>CTR</td><td style={thTdStyle}>{pct(selected.insight.ctr)}</td></tr>
            <tr><td style={thTdStyle}>CPC</td><td style={thTdStyle}>{money(selected.insight.cpc)}</td></tr>
            <tr><td style={thTdStyle}>CPM</td><td style={thTdStyle}>{money(selected.insight.cpm)}</td></tr>
            <tr><td style={thTdStyle}>Frequency</td><td style={thTdStyle}>{selected.insight.frequency || '0'}</td></tr>
          </tbody></table>
        </div>
        <div style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
          <h2 style={{ marginTop: 0 }}>Recommended improvements</h2>
          <table style={tableStyle}><thead><tr><th style={thTdStyle}>Area</th><th style={thTdStyle}>Current</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Reason</th></tr></thead><tbody>{recommendations.map((item) => <tr key={item.area}><td style={thTdStyle}>{item.area}</td><td style={thTdStyle}>{item.current}</td><td style={thTdStyle}>{item.recommendation}</td><td style={thTdStyle}>{item.reason}</td></tr>)}</tbody></table>
        </div>
      </section> : <section style={cardStyle}><p style={{ color: '#64748b' }}>No ads are available to review.</p></section>}
    </>
  );
}
