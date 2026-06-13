'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform, platformLabels, type AdPlatform } from '../_components/useActivePlatform';

const storageKeyBase = 'dynlander-ai-directions';

const googleDirections = {
  monthlyBudget: '1000',
  targetCpl: '100',
  approvalRequired: 'Budget increases, bid strategy changes, and pausing campaigns require human approval before changes are made.',
  leadQuality: 'Prioritize qualified seller leads over form volume. Strong leads include property city, reason for selling, timeline, and working phone number.',
  recommendationRules: 'All Google Ads recommendations must stay within the monthly budget. Do not recommend a budget increase unless another campaign budget is reduced. Explain tradeoffs in plain English.',
  restrictedLanguage: 'Do not promise foreclosure results, guaranteed cash offers, or guaranteed closing timelines.',
  clientNotes: 'Google campaigns should focus on search intent, landing page match, ad group theme match, and clear final URL alignment.'
};

const metaDirections = {
  monthlyBudget: '1000',
  targetCpl: '100',
  approvalRequired: 'Budget increases, audience changes, placement changes, creative changes, and pausing campaigns require human approval before changes are made.',
  leadQuality: 'Prioritize seller intent and lead quality over form volume. Strong Meta leads include property city, reason for selling, timeline, condition, and working phone number.',
  recommendationRules: 'All Meta recommendations must watch frequency, creative fatigue, CTR, CPL, CTA match, and landing page match. Do not recommend scaling spend until creative fatigue and lead quality are reviewed.',
  restrictedLanguage: 'Do not promise guaranteed cash offers, guaranteed closing timelines, foreclosure outcomes, or pressure-based claims. Keep inherited and as-is seller language soft and helpful.',
  clientNotes: 'Meta campaigns should focus on creative fatigue, primary text clarity, CTA softness, audience fit, placement review, and destination URL match.'
};

const defaultsByPlatform = {
  google_ads: googleDirections,
  meta_ads: metaDirections
};

type Directions = typeof googleDirections;

function storageKey(accountId: string, platform: AdPlatform) {
  return `${storageKeyBase}:${accountId}:${platform}`;
}

export default function AiDirectionsForm() {
  const { accountId, selectedAccount } = useActiveAccount();
  const { platform, platformLabel } = useActivePlatform();
  const defaultDirections = defaultsByPlatform[platform];
  const [directions, setDirections] = useState<Directions>(defaultDirections);
  const [saved, setSaved] = useState(false);
  const [source, setSource] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadDirections() {
      const platformDefaults = defaultsByPlatform[platform];
      setSaved(false);
      setMessage('');
      try {
        const response = await fetch(`/api/admin/ai-directions?accountKey=${encodeURIComponent(accountId)}&adPlatform=${encodeURIComponent(platform)}`, { cache: 'no-store' });
        const result = await response.json();
        if (result.ok && result.directions) {
          setDirections({ ...platformDefaults, ...result.directions });
          setSource(result.source || 'database');
          return;
        }
      } catch {
        // fall back below
      }

      const savedValue = window.localStorage.getItem(storageKey(accountId, platform));
      if (savedValue) {
        try {
          setDirections({ ...platformDefaults, ...JSON.parse(savedValue) });
          setSource('local');
          return;
        } catch {
          setDirections(platformDefaults);
        }
      } else {
        setDirections(platformDefaults);
      }
      setSource('default');
    }

    loadDirections();
  }, [accountId, platform]);

  function updateField(field: keyof Directions, value: string) {
    setDirections((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setMessage('');
  }

  async function saveDirections() {
    window.localStorage.setItem(storageKey(accountId, platform), JSON.stringify(directions));

    try {
      const response = await fetch('/api/admin/ai-directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId, adPlatform: platform, ...directions })
      });
      const result = await response.json();
      if (result.ok) {
        setSource(result.source || 'database');
        setMessage(`Saved ${platformLabels[platform]} directions to ${result.source || 'database'} for ${selectedAccount.name}.`);
      } else {
        setSource('local');
        setMessage(`Saved ${platformLabels[platform]} directions locally. Database save unavailable: ${result.error || 'not configured'}`);
      }
    } catch {
      setSource('local');
      setMessage(`Saved ${platformLabels[platform]} directions locally. Database save request failed.`);
    }

    setSaved(true);
  }

  function resetDirections() {
    const platformDefaults = defaultsByPlatform[platform];
    setDirections(platformDefaults);
    window.localStorage.setItem(storageKey(accountId, platform), JSON.stringify(platformDefaults));
    setSaved(true);
    setSource('local');
    setMessage(`Reset ${platformLabels[platform]} directions locally for ${selectedAccount.name}. Click Save AI Directions to sync to database if connected.`);
  }

  return (
    <>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>{platformLabel} AI guardrails for {selectedAccount.name}</h2>
        <p style={{ color: '#64748b', lineHeight: 1.5 }}>
          These directions are now platform-aware. Google Ads and Facebook / Meta Ads can have separate budgets, rules, compliance notes, and recommendation guidance.
        </p>
        <p style={{ color: '#64748b' }}><strong>Current platform:</strong> {platformLabel} · <strong>Current source:</strong> {source}</p>
        <div style={gridStyle}>
          <label style={labelStyle}>Max monthly ad budget<input style={inputStyle} value={directions.monthlyBudget} onChange={(event) => updateField('monthlyBudget', event.target.value)} /></label>
          <label style={labelStyle}>Target cost per lead<input style={inputStyle} value={directions.targetCpl} onChange={(event) => updateField('targetCpl', event.target.value)} /></label>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={saveDirections} style={blueButtonStyle}>Save {platformLabel} AI Directions</button>
          <button type="button" onClick={resetDirections} style={{ ...blueButtonStyle, background: '#334155' }}>Reset {platformLabel} Defaults</button>
        </div>
        {saved ? <p style={{ color: '#166534', fontWeight: 800 }}>{message || `Saved for ${selectedAccount.name}.`}</p> : null}
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><label style={labelStyle}>Approval rules<textarea style={{ ...inputStyle, minHeight: 120 }} value={directions.approvalRequired} onChange={(event) => updateField('approvalRequired', event.target.value)} /></label></div>
        <div style={cardStyle}><label style={labelStyle}>Lead quality priority<textarea style={{ ...inputStyle, minHeight: 120 }} value={directions.leadQuality} onChange={(event) => updateField('leadQuality', event.target.value)} /></label></div>
        <div style={cardStyle}><label style={labelStyle}>Recommendation rules<textarea style={{ ...inputStyle, minHeight: 140 }} value={directions.recommendationRules} onChange={(event) => updateField('recommendationRules', event.target.value)} /></label></div>
        <div style={cardStyle}><label style={labelStyle}>Restricted language / compliance rules<textarea style={{ ...inputStyle, minHeight: 140 }} value={directions.restrictedLanguage} onChange={(event) => updateField('restrictedLanguage', event.target.value)} /></label></div>
      </section>

      <section style={cardStyle}>
        <label style={labelStyle}>Platform-specific client notes<textarea style={{ ...inputStyle, minHeight: 140 }} value={directions.clientNotes} onChange={(event) => updateField('clientNotes', event.target.value)} /></label>
      </section>
    </>
  );
}
