'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';

const storageKeyBase = 'dynlander-ai-directions';

const defaultDirections = {
  monthlyBudget: '1000',
  targetCpl: '100',
  approvalRequired: 'Budget increases, bid strategy changes, and pausing campaigns require human approval before changes are made.',
  leadQuality: 'Prioritize qualified seller leads over form volume. Strong leads include property city, reason for selling, timeline, and working phone number.',
  recommendationRules: 'All recommendations must stay within the monthly budget. Do not recommend a budget increase unless another campaign budget is reduced. Explain tradeoffs in plain English.',
  restrictedLanguage: 'Do not promise foreclosure results, guaranteed cash offers, or guaranteed closing timelines.',
  clientNotes: 'Home buyer campaigns should focus on as-is sellers, inherited houses, tired landlords, and sellers needing speed without using pushy language.'
};

type Directions = typeof defaultDirections;

function storageKey(accountId: string) {
  return `${storageKeyBase}:${accountId}`;
}

export default function AiDirectionsForm() {
  const { accountId, selectedAccount } = useActiveAccount();
  const [directions, setDirections] = useState<Directions>(defaultDirections);
  const [saved, setSaved] = useState(false);
  const [source, setSource] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadDirections() {
      setSaved(false);
      setMessage('');
      try {
        const response = await fetch(`/api/admin/ai-directions?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' });
        const result = await response.json();
        if (result.ok && result.directions) {
          setDirections({ ...defaultDirections, ...result.directions });
          setSource(result.source || 'database');
          return;
        }
      } catch {
        // fall back below
      }

      const savedValue = window.localStorage.getItem(storageKey(accountId));
      if (savedValue) {
        try {
          setDirections({ ...defaultDirections, ...JSON.parse(savedValue) });
          setSource('local');
          return;
        } catch {
          setDirections(defaultDirections);
        }
      } else {
        setDirections(defaultDirections);
      }
      setSource('default');
    }

    loadDirections();
  }, [accountId]);

  function updateField(field: keyof Directions, value: string) {
    setDirections((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setMessage('');
  }

  async function saveDirections() {
    window.localStorage.setItem(storageKey(accountId), JSON.stringify(directions));

    try {
      const response = await fetch('/api/admin/ai-directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey: accountId, ...directions })
      });
      const result = await response.json();
      if (result.ok) {
        setSource(result.source || 'database');
        setMessage(`Saved to ${result.source || 'database'} for ${selectedAccount.name}.`);
      } else {
        setSource('local');
        setMessage(`Saved locally. Database save unavailable: ${result.error || 'not configured'}`);
      }
    } catch {
      setSource('local');
      setMessage('Saved locally. Database save request failed.');
    }

    setSaved(true);
  }

  function resetDirections() {
    setDirections(defaultDirections);
    window.localStorage.setItem(storageKey(accountId), JSON.stringify(defaultDirections));
    setSaved(true);
    setSource('local');
    setMessage(`Reset locally for ${selectedAccount.name}. Click Save AI Directions to sync to database if connected.`);
  }

  return (
    <>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>AI guardrails for {selectedAccount.name}</h2>
        <p style={{ color: '#64748b', lineHeight: 1.5 }}>
          These directions now load through the API. If Supabase is connected, they save to the database. If not, they fall back to browser storage.
        </p>
        <p style={{ color: '#64748b' }}><strong>Current source:</strong> {source}</p>
        <div style={gridStyle}>
          <label style={labelStyle}>
            Max monthly ad budget
            <input style={inputStyle} value={directions.monthlyBudget} onChange={(event) => updateField('monthlyBudget', event.target.value)} />
          </label>
          <label style={labelStyle}>
            Target cost per lead
            <input style={inputStyle} value={directions.targetCpl} onChange={(event) => updateField('targetCpl', event.target.value)} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={saveDirections} style={blueButtonStyle}>Save AI Directions</button>
          <button type="button" onClick={resetDirections} style={{ ...blueButtonStyle, background: '#334155' }}>Reset Demo Defaults</button>
        </div>
        {saved ? <p style={{ color: '#166534', fontWeight: 800 }}>{message || `Saved for ${selectedAccount.name}.`}</p> : null}
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}>
          <label style={labelStyle}>
            Approval rules
            <textarea style={{ ...inputStyle, minHeight: 120 }} value={directions.approvalRequired} onChange={(event) => updateField('approvalRequired', event.target.value)} />
          </label>
        </div>
        <div style={cardStyle}>
          <label style={labelStyle}>
            Lead quality priority
            <textarea style={{ ...inputStyle, minHeight: 120 }} value={directions.leadQuality} onChange={(event) => updateField('leadQuality', event.target.value)} />
          </label>
        </div>
        <div style={cardStyle}>
          <label style={labelStyle}>
            Recommendation rules
            <textarea style={{ ...inputStyle, minHeight: 140 }} value={directions.recommendationRules} onChange={(event) => updateField('recommendationRules', event.target.value)} />
          </label>
        </div>
        <div style={cardStyle}>
          <label style={labelStyle}>
            Restricted language / compliance rules
            <textarea style={{ ...inputStyle, minHeight: 140 }} value={directions.restrictedLanguage} onChange={(event) => updateField('restrictedLanguage', event.target.value)} />
          </label>
        </div>
      </section>

      <section style={cardStyle}>
        <label style={labelStyle}>
          Client-specific notes
          <textarea style={{ ...inputStyle, minHeight: 140 }} value={directions.clientNotes} onChange={(event) => updateField('clientNotes', event.target.value)} />
        </label>
      </section>
    </>
  );
}
