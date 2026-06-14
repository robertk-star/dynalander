'use client';

import { useMemo, useState } from 'react';
import { cardStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';
import MetaLiveAdRows from '../creative-review/MetaLiveAdRows';
import { adReviewGroups, getAdReviewSetup, mockChangeHistory, reviewDescription, reviewHeadline } from './adReviewData';

export default function AdReviewDashboard() {
  const { platform } = useActivePlatform();
  const { accountId, selectedAccount } = useActiveAccount();
  const [adGroupId, setAdGroupId] = useState(accountId === 'probate-home-demo' ? 'inherited' : 'repairs');
  const [accepted, setAccepted] = useState<string[]>([]);
  const setup = useMemo(() => getAdReviewSetup(selectedAccount.name, selectedAccount.market, adGroupId), [selectedAccount.name, selectedAccount.market, adGroupId]);
  const score = adGroupId === 'inherited' ? '86' : adGroupId === 'foreclosure' ? '74' : '82';
  const headlineUsed = new Set<string>();
  const descriptionUsed = new Set<string>();

  function markAccepted(label: string) {
    setAccepted((current) => current.includes(label) ? current : [...current, label]);
  }

  if (platform === 'meta_ads') {
    return <MetaLiveAdRows />;
  }

  return (
    <>
      <section style={cardStyle}>
        <div style={twoColumnStyle}>
          <label style={labelStyle}>Select Google ad group / theme<select style={inputStyle} value={adGroupId} onChange={(event) => setAdGroupId(event.target.value)}>{adReviewGroups.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <div><div style={{ color: '#64748b', fontWeight: 800, fontSize: 13 }}>Google ad setup score</div><strong style={{ fontSize: 36 }}>{score} / 100</strong><p style={{ color: '#64748b', margin: 0 }}>Mock score based on message match, local relevance, CTA strength, and page alignment.</p></div>
        </div>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
        <h2 style={{ marginTop: 0 }}>Google change tracking workflow</h2>
        <p style={{ color: '#475569', lineHeight: 1.6 }}>AI recommendations are not enough by themselves. When a person uses a recommendation, DynLander should create a change record with the old text, new text, date, active account, campaign, ad group, and baseline performance. After enough time or clicks, AI compares before and after performance and can recommend keeping the change or going back to the older version.</p>
        <p style={{ color: '#475569', marginBottom: 0 }}><strong>Unique rule:</strong> headline suggestions and description suggestions should not repeat inside the same ad review.</p>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Current Google setup</h2><p><strong>Campaign:</strong> {setup.campaign}</p><p><strong>Ad group:</strong> {setup.adGroup}</p><p><strong>Final URL:</strong> {setup.finalUrl}</p><p><strong>Active account:</strong> {setup.accountName}</p></div>
        <div style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}><h2 style={{ marginTop: 0 }}>Top fixes</h2><ol style={{ lineHeight: 1.7 }}><li><strong>Replace broad headlines</strong> with seller-intent wording.</li><li><strong>Make the CTA match</strong> the landing page theme.</li><li><strong>Confirm final URL theme</strong> before copying into the ad platform.</li></ol></div>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Headlines currently used</h2><table style={tableStyle}><thead><tr><th style={thTdStyle}>#</th><th style={thTdStyle}>Headline</th></tr></thead><tbody>{setup.headlines.map((headline, index) => <tr key={headline + index}><td style={thTdStyle}>Headline {index + 1}</td><td style={thTdStyle}>{headline}</td></tr>)}</tbody></table></div>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>AI headline review</h2><table style={tableStyle}><thead><tr><th style={thTdStyle}>#</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Unique suggestion</th><th style={thTdStyle}>Reason</th><th style={thTdStyle}>Track</th></tr></thead><tbody>{setup.headlines.map((headline, index) => { const label = `Headline ${index + 1}`; const review = reviewHeadline(headline, index, adGroupId, headlineUsed); return <tr key={headline + index}><td style={thTdStyle}>{label}</td><td style={thTdStyle}>{review.status}</td><td style={thTdStyle}>{review.suggestion}</td><td style={thTdStyle}>{review.reason}</td><td style={thTdStyle}>{review.status === 'Good' ? '—' : <button type="button" onClick={() => markAccepted(label)}>{accepted.includes(label) ? 'Accepted' : 'Use change'}</button>}</td></tr>; })}</tbody></table></div>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Descriptions currently used</h2><table style={tableStyle}><tbody>{setup.descriptions.map((description, index) => <tr key={description + index}><td style={thTdStyle}>Description {index + 1}</td><td style={thTdStyle}>{description}</td></tr>)}</tbody></table></div>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>AI description review</h2><table style={tableStyle}><thead><tr><th style={thTdStyle}>#</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Unique suggestion</th><th style={thTdStyle}>Reason</th><th style={thTdStyle}>Track</th></tr></thead><tbody>{setup.descriptions.map((description, index) => { const label = `Description ${index + 1}`; const review = reviewDescription(description, index, adGroupId, descriptionUsed); return <tr key={description + index}><td style={thTdStyle}>{label}</td><td style={thTdStyle}>{review.status}</td><td style={thTdStyle}>{review.suggestion}</td><td style={thTdStyle}>{review.reason}</td><td style={thTdStyle}>{review.status === 'Good' ? '—' : <button type="button" onClick={() => markAccepted(label)}>{accepted.includes(label) ? 'Accepted' : 'Use change'}</button>}</td></tr>; })}</tbody></table></div>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Sitelinks and callouts</h2><h3>Sitelinks</h3><ul>{setup.sitelinks.map((item) => <li key={item}>{item}</li>)}</ul><h3>Callouts</h3><ul>{setup.callouts.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>AI extension review</h2><table style={tableStyle}><tbody><tr><td style={thTdStyle}>Sitelinks</td><td style={thTdStyle}>Good, but make sure the first sitelink matches the selected ad group theme.</td></tr><tr><td style={thTdStyle}>Callouts</td><td style={thTdStyle}>Keep No Repairs Needed and No Realtor Fees. Test a stronger local trust callout.</td></tr><tr><td style={thTdStyle}>Structured snippets</td><td style={thTdStyle}>Add seller situations that match this account.</td></tr></tbody></table></div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Tracked recommendation history</h2>
        <table style={tableStyle}><thead><tr><th style={thTdStyle}>Date</th><th style={thTdStyle}>Item</th><th style={thTdStyle}>Before</th><th style={thTdStyle}>After</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Result</th></tr></thead><tbody>{mockChangeHistory.map((row) => <tr key={row.date + row.item}><td style={thTdStyle}>{row.date}</td><td style={thTdStyle}>{row.item}</td><td style={thTdStyle}>{row.before}</td><td style={thTdStyle}>{row.after}</td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>{row.result}</td></tr>)}</tbody></table>
        {accepted.length > 0 ? <p style={{ color: '#166534', fontWeight: 800 }}>Accepted in this demo: {accepted.join(', ')}. In production this creates a change log record tied to the active account and ad ID.</p> : null}
      </section>
    </>
  );
}
