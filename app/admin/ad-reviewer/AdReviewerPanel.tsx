'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import { useMetaDataMode } from '../_components/useMetaDataMode';

type Targeting = { ageMin: string; ageMax: string; genders: string; countries: string; regions: string; cities: string; customAudienceCount: number; customAudiences: string[]; excludedCustomAudienceCount: number; excludedCustomAudiences: string[]; publisherPlatforms: string; rawReturned: boolean };
type SetupAd = { id: string; name: string; status: string; effectiveStatus: string; campaign: { id: string; name: string; objective: string; status: string }; adSet: { id: string; name: string; status: string; dailyBudget: string; lifetimeBudget: string; optimizationGoal: string; billingEvent: string; bidStrategy: string; targeting: Targeting }; creative: { primaryText: string; headline: string; description: string; cta: string; destinationUrl: string; imageUrl: string; format: string } };
type ApiData = { ok: boolean; source: string; ads: SetupAd[]; error?: string };

type Rec = { area: string; current: string; recommendation: string; reason: string };

function missing(value?: string) { return !value || value === '—' || value === 'Not returned by Meta'; }

function buildSetupRecommendations(ad: SetupAd): Rec[] {
  const recs: Rec[] = [];
  if (ad.effectiveStatus !== 'ACTIVE') recs.push({ area: 'Delivery', current: ad.effectiveStatus || ad.status, recommendation: 'Confirm whether this ad should remain inactive or be replaced with a new active test.', reason: 'Inactive ads cannot create new learning.' });
  if (missing(ad.creative.primaryText)) recs.push({ area: 'Primary text', current: ad.creative.primaryText, recommendation: 'Add or test clearer primary text that states the offer and who it is for.', reason: 'The first text is usually the main hook.' });
  if (missing(ad.creative.headline)) recs.push({ area: 'Headline', current: ad.creative.headline, recommendation: 'Test a clear benefit-driven headline.', reason: 'The headline should quickly explain why someone should click.' });
  if (missing(ad.creative.cta)) recs.push({ area: 'CTA', current: ad.creative.cta, recommendation: 'Use a CTA that matches the landing page action.', reason: 'CTA mismatch can lower conversion rate.' });
  if (missing(ad.creative.destinationUrl)) recs.push({ area: 'Destination URL', current: ad.creative.destinationUrl, recommendation: 'Confirm the ad sends people to the correct landing page.', reason: 'Landing page mismatch can waste clicks.' });
  if (!ad.creative.imageUrl) recs.push({ area: 'Image / creative', current: 'Image not returned by Meta', recommendation: 'Review the image manually and test a second visual variation.', reason: 'The image is often the first thing people notice.' });
  if (ad.adSet.targeting.customAudienceCount === 0) recs.push({ area: 'Audience', current: 'No custom audiences returned', recommendation: 'Consider whether a warm custom audience or retargeting audience should be tested.', reason: 'Warm audiences can perform differently than cold targeting.' });
  if (!ad.adSet.targeting.rawReturned) recs.push({ area: 'Targeting', current: 'Targeting details not returned', recommendation: 'Check Meta targeting manually before making scaling decisions.', reason: 'The API did not return enough targeting detail to judge audience quality.' });
  if (ad.adSet.dailyBudget === '—' && ad.adSet.lifetimeBudget === '—') recs.push({ area: 'Budget', current: 'Budget not returned', recommendation: 'Review ad set budget manually.', reason: 'Budget controls how fast the ad can learn.' });
  if (recs.length === 0) recs.push({ area: 'Overall setup', current: 'No obvious setup gaps returned', recommendation: 'Review image quality, offer clarity, and landing page match before changing budget.', reason: 'The visible setup fields look complete from the API data returned.' });
  return recs;
}

export default function AdReviewerPanel() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAdId, setSelectedAdId] = useState('');

  async function loadAds() {
    if (platform !== 'meta_ads' || isDemoMode) { setData(null); setLoading(false); return; }
    setLoading(true);
    try {
      const response = await fetch(`/api/meta-ads/ad-reviewer-setup?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' });
      const result = await response.json();
      setData(result);
      if (!selectedAdId && result?.ads?.[0]?.id) setSelectedAdId(result.ads[0].id);
    } catch { setData(null); } finally { setLoading(false); }
  }

  useEffect(() => { loadAds(); }, [platform, isDemoMode, selectedAccount.customerId]);

  if (platform !== 'meta_ads') return <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Ad Reviewer</h2><p style={{ color: '#64748b' }}>Select Facebook / Meta Ads to review live Meta ads.</p></section>;

  const ads = data?.ads || [];
  const selected = ads.find((ad) => ad.id === selectedAdId) || ads[0];
  const recs = selected ? buildSetupRecommendations(selected) : [];
  const liveReady = Boolean(!isDemoMode && data?.ok && ads.length > 0);

  return (
    <>
      <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div><h2 style={{ marginTop: 0 }}>Ad Reviewer</h2><p style={{ color: liveReady ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{liveReady ? `Loaded live ad setup details for ${selectedAccount.name}.` : data?.error || `No live ad setup details loaded for ${selectedAccount.name}.`}</p></div>
          <button type="button" onClick={loadAds} style={blueButtonStyle}>{loading ? 'Refreshing...' : 'Refresh ads'}</button>
        </div>
      </section>
      <section style={cardStyle}><div style={twoColumnStyle}><label style={labelStyle}>Select ad to review<select style={inputStyle} value={selected?.id || ''} onChange={(event) => setSelectedAdId(event.target.value)}>{ads.map((ad) => <option key={ad.id} value={ad.id}>{ad.name || ad.id}</option>)}</select></label><div><div style={{ color: '#64748b', fontWeight: 800 }}>Active account</div><strong style={{ fontSize: 26 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div></div></section>
      {selected ? <section style={twoColumnStyle}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Current ad setup</h2>
          {selected.creative.imageUrl ? <img src={selected.creative.imageUrl} alt="Ad creative" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 12 }} /> : <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, color: '#64748b', marginBottom: 12 }}>Image not returned by Meta.</div>}
          <table style={tableStyle}><tbody>
            <tr><td style={thTdStyle}>Ad</td><td style={thTdStyle}>{selected.name}</td></tr>
            <tr><td style={thTdStyle}>Status</td><td style={thTdStyle}>{selected.effectiveStatus || selected.status}</td></tr>
            <tr><td style={thTdStyle}>Campaign</td><td style={thTdStyle}>{selected.campaign.name}</td></tr>
            <tr><td style={thTdStyle}>Ad set</td><td style={thTdStyle}>{selected.adSet.name}</td></tr>
            <tr><td style={thTdStyle}>Primary text</td><td style={thTdStyle}>{selected.creative.primaryText}</td></tr>
            <tr><td style={thTdStyle}>Headline</td><td style={thTdStyle}>{selected.creative.headline}</td></tr>
            <tr><td style={thTdStyle}>Description</td><td style={thTdStyle}>{selected.creative.description}</td></tr>
            <tr><td style={thTdStyle}>CTA</td><td style={thTdStyle}>{selected.creative.cta}</td></tr>
            <tr><td style={thTdStyle}>Destination URL</td><td style={thTdStyle}>{selected.creative.destinationUrl}</td></tr>
            <tr><td style={thTdStyle}>Format</td><td style={thTdStyle}>{selected.creative.format}</td></tr>
            <tr><td style={thTdStyle}>Daily budget</td><td style={thTdStyle}>{selected.adSet.dailyBudget}</td></tr>
            <tr><td style={thTdStyle}>Optimization goal</td><td style={thTdStyle}>{selected.adSet.optimizationGoal}</td></tr>
            <tr><td style={thTdStyle}>Bid strategy</td><td style={thTdStyle}>{selected.adSet.bidStrategy}</td></tr>
            <tr><td style={thTdStyle}>Target ages</td><td style={thTdStyle}>{selected.adSet.targeting.ageMin} - {selected.adSet.targeting.ageMax}</td></tr>
            <tr><td style={thTdStyle}>Locations</td><td style={thTdStyle}>{selected.adSet.targeting.countries || selected.adSet.targeting.regions || selected.adSet.targeting.cities || 'Not returned by Meta'}</td></tr>
            <tr><td style={thTdStyle}>Custom audiences</td><td style={thTdStyle}>{selected.adSet.targeting.customAudienceCount ? selected.adSet.targeting.customAudiences.join(', ') : 'None returned'}</td></tr>
          </tbody></table>
        </div>
        <div style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
          <h2 style={{ marginTop: 0 }}>Recommended improvements</h2>
          <table style={tableStyle}><thead><tr><th style={thTdStyle}>Area</th><th style={thTdStyle}>Current</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Reason</th></tr></thead><tbody>{recs.map((item) => <tr key={item.area}><td style={thTdStyle}>{item.area}</td><td style={thTdStyle}>{item.current}</td><td style={thTdStyle}>{item.recommendation}</td><td style={thTdStyle}>{item.reason}</td></tr>)}</tbody></table>
        </div>
      </section> : <section style={cardStyle}><p style={{ color: '#64748b' }}>No ads are available to review.</p></section>}
    </>
  );
}
