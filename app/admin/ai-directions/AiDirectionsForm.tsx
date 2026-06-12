'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, twoColumnStyle } from '../_components/adminStyles';

const storageKey = 'dynlander-ai-directions';

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

export default function AiDirectionsForm() {
  const [directions, setDirections] = useState<Directions>(defaultDirections);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(storageKey);
    if (savedValue) {
      try {
        setDirections({ ...defaultDirections, ...JSON.parse(savedValue) });
      } catch {
        setDirections(defaultDirections);
      }
    }
  }, []);

  function updateField(field: keyof Directions, value: string) {
    setDirections((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveDirections() {
    window.localStorage.setItem(storageKey, JSON.stringify(directions));
    setSaved(true);
  }

  function resetDirections() {
    setDirections(defaultDirections);
    window.localStorage.setItem(storageKey, JSON.stringify(defaultDirections));
    setSaved(true);
  }

  return (
    <>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>AI guardrails</h2>
        <p style={{ color: '#64748b', lineHeight: 1.5 }}>
          These are the instructions DynLander should read before creating recommendations. In this demo they save in your browser. Later they should save per client account in the database.
        </p>
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
        {saved ? <p style={{ color: '#166534', fontWeight: 800 }}>Saved. The Google Ads dashboard will now show these guardrails.</p> : null}
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
