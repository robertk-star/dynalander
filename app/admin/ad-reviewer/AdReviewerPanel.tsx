'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import { useMetaDataMode } from '../_components/useMetaDataMode';

type Targeting = { ageMin: string; ageMax: string; genders: string; countries: string; regions: string; cities: string; customAudienceCount: number; customAudiences: string[]; excludedCustomAudienceCount: number; excludedCustomAudiences: string[]; publisherPlatforms: string; rawReturned: boolean };
type FieldSources = { primaryText?: string; headline?: string; description?: string; cta?: string; destinationUrl?: string; imageUrl?: string };
type Creative = { primaryText: string; headline: string; description: string; cta: string; destinationUrl: string; imageUrl: string; format: string; objectStoryId?: string; urlTags?: string; readSource?: string; fieldSources?: FieldSources };
type SetupAd = { id: string; name: string; status: string; effectiveStatus: string; campaign: { id: string; name: string; objective: string; status: string }; adSet: { id: string; name: string; status: string; dailyBudget: string; lifetimeBudget: string; optimizationGoal: string; billingEvent: string; bidStrategy: string; targeting: Targeting }; creative: Creative };
type ApiData = { ok: boolean; source: string; creativeMode?: string; creativeWarning?: string | null; ads: SetupAd[]; error?: string };
type Rec = { area: string; current: string; recommendation: string; reason: string };

function missing(value?: string) { return !value || value === '—' || value === 'Not returned by Meta'; }
function isImageBasedAd(ad: SetupAd) { return Boolean(ad.creative.imageUrl && missing(ad.creative.primaryText) && missing(ad.creative.headline)); }
function sourceLabel(source?: string) { return !source || source === 'not_found' ? 'Not found in Meta fields checked' : source; }

function buildSetupRecommendations(ad: SetupAd): Rec[] {
  const recs: Rec[] = [];
  const imageBased = isImageBasedAd(ad);
  if (ad.effectiveStatus !== 'ACTIVE') recs.push({ area: 'Delivery', current: ad.effectiveStatus || ad.status, recommendation: 'Confirm whether this ad should remain inactive or be replaced with a new active test.', reason: 'Inactive ads cannot create new learning.' });
  if (imageBased) {
    recs.push({ area: 'Creative type', current: 'Image-based copy', recommendation: 'Review the image as the main message, not just separate Meta text fields.', reason: 'Meta returned the image, but did not return separate primary text or headline fields.' });
    recs.push({ area: 'Image readability', current: 'Text appears inside image', recommendation: 'Test a simpler image with fewer words and larger text.', reason: 'Small text inside images can be hard to read on mobile.' });
    recs.push({ area: 'Offer clarity', current: 'Disability benefits message is visible', recommendation: 'Test one version with a clearer top headline and one direct CTA.', reason: 'A cleaner message can help people understand the offer faster.' });
    recs.push({ area: 'Creative testing', current: 'One visible image variation', recommendation: 'Create a second image variation with a different hook or less crowded layout.', reason: 'A second variation helps compare creative fatigue and message match.' });
  } else {
    if (missing(ad.creative.primaryText)) recs.push({ area: 'Primary text', current: ad.creative.primaryText, recommendation: 'Check dynamic creative assets or the page post text inside Meta. Test clearer primary text that states the offer and who it is for.', reason: 'The first text is usually the main hook.' });
    if (missing(ad.creative.headline)) recs.push({ area: 'Headline', current: ad.creative.headline, recommendation: 'Check dynamic creative assets or post headline. Test a clear benefit-driven headline.', reason: 'The headline should quickly explain why someone should click.' });
  }
  if (missing(ad.creative.cta) && !imageBased) recs.push({ area: 'CTA', current: ad.creative.cta, recommendation: 'Use a CTA that matches the landing page action.', reason: 'CTA mismatch can lower conversion rate.' });
  if (missing(ad.creative.destinationUrl)) recs.push({ area: 'Destination URL', current: ad.creative.destinationUrl, recommendation: 'Confirm the ad sends people to the correct landing page.', reason: 'Landing page mismatch can waste clicks.' });
  if (!ad.creative.imageUrl) recs.push({ area: 'Image / creative', current: 'Image not returned by Meta', recommendation: 'Review the image manually and test a second visual variation.', reason: 'The image is often the first thing people notice.' });
  if (ad.creative.readSource === 'limited') recs.push({ area: 'Creative read', current: 'Limited fields returned', recommendation: 'Use Meta Ads Manager to confirm whether this is dynamic creative, a boosted post, or a format with restricted text fields.', reason: 'Meta did not expose enough creative text fields through the current API read.' });
  if (ad.adSet.targeting.customAudienceCount === 0) recs.push({ area: 'Audience', current: 'No custom audiences returned', recommendation: 'Consider whether a warm custom audience or retargeting audience should be tested.', reason: 'Warm audiences can perform differently than cold targeting.' });
  if (!ad.adSet.targeting.rawReturned) recs.push({ area: 'Targeting', current: 'Targeting details not returned', recommendation: 'Check Meta targeting manually before making scaling decisions.', reason: 'The API did not return enough targeting detail to judge audience quality.' });
  if (ad.adSet.dailyBudget === '—' && ad.adSet.lifetimeBudget === '—') recs.push({ area: 'Budget', current: 'Budget not returned', recommendation: 'Review ad set budget manually.', reason: 'Budget controls how fast the ad can learn.' });
  if (recs.length === 0) recs.push({ area: 'Overall setup', current: 'No obvious setup gaps returned', recommendation: 'Review image quality, offer clarity, and landing page match before changing budget.', reason: 'The visible setup fields look complete from the API data returned.' });
  return recs;
}

function buildImageReview(ad: SetupAd): Rec[] {
  if (!ad.creative.imageUrl) return [];
  return [
    { area: 'Visible message', current: 'Image creative is available', recommendation: 'Use the image as the main review target when Meta does not return text fields.', reason: 'The ad copy may be embedded in the image.' },
    { area: 'Mobile readability', current: 'Image contains multiple text areas', recommendation: 'Test a cleaner version with fewer bullet points and larger headline text.', reason: 'Mobile users may not read small text quickly.' },
    { area: 'CTA visibility', current: 'CTA appears inside the image', recommendation: 'Make sure the CTA is readable at small screen size and matches the landing page action.', reason: 'A visible CTA can improve click intent.' },
    { area: 'Trust / clarity', current: 'Benefit-focused image', recommendation: 'Test one version that makes the service/process clearer in plain language.', reason: 'People may need to quickly understand what happens after they click.' }
  ];
}

function FieldSourceDebug({ ad }: { ad: SetupAd }) {
  const sources = ad.creative.fieldSources || {};
  const rows = [
    { field: 'Primary text', value: ad.creative.primaryText, source: sources.primaryText },
    { field: 'Headline', value: ad.creative.headline, source: sources.headline },
    { field: 'Description', value: ad.creative.description, source: sources.description },
    { field: 'CTA', value: ad.creative.cta, source: sources.cta },
    { field: 'Destination URL', value: ad.creative.destinationUrl, source: sources.destinationUrl },
    { field: 'Image URL', value: ad.creative.imageUrl ? 'Returned' : 'Not returned by Meta', source: sources.imageUrl }
  ];
  return (
    <section style={{ ...cardStyle, marginTop: 16, border: '1px solid #f59e0b', background: '#fffbeb' }}>
      <h2 style={{ marginTop: 0 }}>Field Source Debug</h2>
      <p style={{ color: '#92400e', fontWeight: 800, lineHeight: 1.6 }}>This shows every Meta location DynLander checked for the selected ad fields. If the source says “Not found,” Meta did not return that field in the places currently checked.</p>
      <table style={tableStyle}>
        <thead><tr><th style={thTdStyle}>Field</th><th style={thTdStyle}>Value found</th><th style={thTdStyle}>Source</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.field}><td style={thTdStyle}>{row.field}</td><td style={thTdStyle}>{row.value || 'Not returned by Meta'}</td><td style={thTdStyle}>{sourceLabel(row.source)}</td></tr>)}</tbody>
      </table>
    </section>
  );
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
  const imageRecs = selected ? buildImageReview(selected) : [];
  const liveReady = Boolean(!isDemoMode && data?.ok && ads.length > 0);

  return (
    <>
      <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div><h2 style={{ marginTop: 0 }}>Ad Reviewer</h2><p style={{ color: liveReady ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>{liveReady ? `Loaded live ad setup details for ${selectedAccount.name}. Creative read: ${data?.creativeMode || 'standard'}.` : data?.error || `No live ad setup details loaded for ${selectedAccount.name}.`}</p>{data?.creativeWarning ? <p style={{ color: '#9a3412', fontWeight: 800, marginBottom: 0 }}>Creative warning: {data.creativeWarning}</p> : null}</div>
          <button type="button" onClick={loadAds} style={blueButtonStyle}>{loading ? 'Refreshing...' : 'Refresh ads'}</button>
        </div>
      </section>
      <section style={cardStyle}><div style={twoColumnStyle}><label style={labelStyle}>Select ad to review<select style={inputStyle} value={selected?.id || ''} onChange={(event) => setSelectedAdId(event.target.value)}>{ads.map((ad) => <option key={ad.id} value={ad.id}>{ad.name || ad.id}</option>)}</select></label><div><div style={{ color: '#64748b', fontWeight: 800 }}>Active account</div><strong style={{ fontSize: 26 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div></div></section>
      {selected ? <section style={twoColumnStyle}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Meta returned setup</h2>
          {selected.creative.imageUrl ? <img src={selected.creative.imageUrl} alt="Ad creative" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 12 }} /> : <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 14, color: '#64748b', marginBottom: 12 }}>Image not returned by Meta.</div>}
          {isImageBasedAd(selected) ? <div style={{ border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 12, color: '#1e3a8a', fontWeight: 800 }}>This appears to be an image-based ad. Meta returned the image, but not separate primary text/headline fields. Recommendations should focus on the visible image and setup details.</div> : null}
          <table style={tableStyle}><tbody>
            <tr><td style={thTdStyle}>Ad</td><td style={thTdStyle}>{selected.name}</td></tr>
            <tr><td style={thTdStyle}>Status</td><td style={thTdStyle}>{selected.effectiveStatus || selected.status}</td></tr>
            <tr><td style={thTdStyle}>Campaign</td><td style={thTdStyle}>{selected.campaign.name}</td></tr>
            <tr><td style={thTdStyle}>Campaign objective</td><td style={thTdStyle}>{selected.campaign.objective}</td></tr>
            <tr><td style={thTdStyle}>Ad set</td><td style={thTdStyle}>{selected.adSet.name}</td></tr>
            <tr><td style={thTdStyle}>Primary text returned by Meta</td><td style={thTdStyle}>{selected.creative.primaryText}</td></tr>
            <tr><td style={thTdStyle}>Headline returned by Meta</td><td style={thTdStyle}>{selected.creative.headline}</td></tr>
            <tr><td style={thTdStyle}>Description returned by Meta</td><td style={thTdStyle}>{selected.creative.description}</td></tr>
            <tr><td style={thTdStyle}>CTA returned by Meta</td><td style={thTdStyle}>{selected.creative.cta}</td></tr>
            <tr><td style={thTdStyle}>Destination URL returned by Meta</td><td style={thTdStyle}>{selected.creative.destinationUrl}</td></tr>
            <tr><td style={thTdStyle}>URL tags</td><td style={thTdStyle}>{selected.creative.urlTags || 'Not returned by Meta'}</td></tr>
            <tr><td style={thTdStyle}>Format</td><td style={thTdStyle}>{selected.creative.format}</td></tr>
            <tr><td style={thTdStyle}>Creative read source</td><td style={thTdStyle}>{selected.creative.readSource || 'standard'}</td></tr>
            <tr><td style={thTdStyle}>Object story ID</td><td style={thTdStyle}>{selected.creative.objectStoryId || 'Not returned by Meta'}</td></tr>
            <tr><td style={thTdStyle}>Daily budget</td><td style={thTdStyle}>{selected.adSet.dailyBudget}</td></tr>
            <tr><td style={thTdStyle}>Lifetime budget</td><td style={thTdStyle}>{selected.adSet.lifetimeBudget}</td></tr>
            <tr><td style={thTdStyle}>Optimization goal</td><td style={thTdStyle}>{selected.adSet.optimizationGoal}</td></tr>
            <tr><td style={thTdStyle}>Billing event</td><td style={thTdStyle}>{selected.adSet.billingEvent}</td></tr>
            <tr><td style={thTdStyle}>Bid strategy</td><td style={thTdStyle}>{selected.adSet.bidStrategy}</td></tr>
            <tr><td style={thTdStyle}>Target ages</td><td style={thTdStyle}>{selected.adSet.targeting.ageMin} - {selected.adSet.targeting.ageMax}</td></tr>
            <tr><td style={thTdStyle}>Genders</td><td style={thTdStyle}>{selected.adSet.targeting.genders}</td></tr>
            <tr><td style={thTdStyle}>Locations</td><td style={thTdStyle}>{selected.adSet.targeting.countries || selected.adSet.targeting.regions || selected.adSet.targeting.cities || 'Not returned by Meta'}</td></tr>
            <tr><td style={thTdStyle}>Placements</td><td style={thTdStyle}>{selected.adSet.targeting.publisherPlatforms}</td></tr>
            <tr><td style={thTdStyle}>Custom audiences</td><td style={thTdStyle}>{selected.adSet.targeting.customAudienceCount ? selected.adSet.targeting.customAudiences.join(', ') : 'None returned'}</td></tr>
            <tr><td style={thTdStyle}>Excluded custom audiences</td><td style={thTdStyle}>{selected.adSet.targeting.excludedCustomAudienceCount ? selected.adSet.targeting.excludedCustomAudiences.join(', ') : 'None returned'}</td></tr>
          </tbody></table>
          <FieldSourceDebug ad={selected} />
        </div>
        <div style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
          <h2 style={{ marginTop: 0 }}>Recommended improvements</h2>
          {imageRecs.length ? <><h3>Image / Creative Review</h3><table style={tableStyle}><thead><tr><th style={thTdStyle}>Area</th><th style={thTdStyle}>Current</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Reason</th></tr></thead><tbody>{imageRecs.map((item) => <tr key={item.area}><td style={thTdStyle}>{item.area}</td><td style={thTdStyle}>{item.current}</td><td style={thTdStyle}>{item.recommendation}</td><td style={thTdStyle}>{item.reason}</td></tr>)}</tbody></table></> : null}
          <h3>Setup Review</h3><table style={tableStyle}><thead><tr><th style={thTdStyle}>Area</th><th style={thTdStyle}>Current</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Reason</th></tr></thead><tbody>{recs.map((item) => <tr key={item.area}><td style={thTdStyle}>{item.area}</td><td style={thTdStyle}>{item.current}</td><td style={thTdStyle}>{item.recommendation}</td><td style={thTdStyle}>{item.reason}</td></tr>)}</tbody></table>
        </div>
      </section> : <section style={cardStyle}><p style={{ color: '#64748b' }}>No ads are available to review.</p></section>}
    </>
  );
}
