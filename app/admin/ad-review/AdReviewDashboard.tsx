'use client';

import { useMemo, useState } from 'react';
import { cardStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { adReviewGroups, getAdReviewSetup, reviewDescription, reviewHeadline } from './adReviewData';

export default function AdReviewDashboard() {
  const { accountId, selectedAccount } = useActiveAccount();
  const [adGroupId, setAdGroupId] = useState(accountId === 'probate-home-demo' ? 'inherited' : 'repairs');
  const setup = useMemo(() => getAdReviewSetup(selectedAccount.name, selectedAccount.market, adGroupId), [selectedAccount.name, selectedAccount.market, adGroupId]);
  const score = adGroupId === 'inherited' ? '86' : adGroupId === 'foreclosure' ? '74' : '82';

  return (
    <>
      <section style={cardStyle}>
        <div style={twoColumnStyle}>
          <label style={labelStyle}>Select ad group / theme<select style={inputStyle} value={adGroupId} onChange={(event) => setAdGroupId(event.target.value)}>{adReviewGroups.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <div><div style={{ color: '#64748b', fontWeight: 800, fontSize: 13 }}>Ad setup score</div><strong style={{ fontSize: 36 }}>{score} / 100</strong><p style={{ color: '#64748b', margin: 0 }}>Mock score based on message match, local relevance, CTA strength, and page alignment.</p></div>
        </div>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Current setup</h2><p><strong>Campaign:</strong> {setup.campaign}</p><p><strong>Ad group:</strong> {setup.adGroup}</p><p><strong>Final URL:</strong> {setup.finalUrl}</p><p><strong>Active account:</strong> {setup.accountName}</p></div>
        <div style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}><h2 style={{ marginTop: 0 }}>Top fixes</h2><ol style={{ lineHeight: 1.7 }}><li><strong>Replace broad headlines</strong> with seller-intent wording.</li><li><strong>Make the CTA match</strong> the landing page theme.</li><li><strong>Confirm final URL theme</strong> before copying into Google Ads.</li></ol></div>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Headlines currently used</h2><table style={tableStyle}><thead><tr><th style={thTdStyle}>#</th><th style={thTdStyle}>Headline</th></tr></thead><tbody>{setup.headlines.map((headline, index) => <tr key={headline + index}><td style={thTdStyle}>Headline {index + 1}</td><td style={thTdStyle}>{headline}</td></tr>)}</tbody></table></div>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>AI headline review</h2><table style={tableStyle}><thead><tr><th style={thTdStyle}>#</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Suggestion</th><th style={thTdStyle}>Reason</th></tr></thead><tbody>{setup.headlines.map((headline, index) => { const review = reviewHeadline(headline, index, adGroupId); return <tr key={headline + index}><td style={thTdStyle}>Headline {index + 1}</td><td style={thTdStyle}>{review.status}</td><td style={thTdStyle}>{review.suggestion}</td><td style={thTdStyle}>{review.reason}</td></tr>; })}</tbody></table></div>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Descriptions currently used</h2><table style={tableStyle}><tbody>{setup.descriptions.map((description, index) => <tr key={description + index}><td style={thTdStyle}>Description {index + 1}</td><td style={thTdStyle}>{description}</td></tr>)}</tbody></table></div>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>AI description review</h2><table style={tableStyle}><thead><tr><th style={thTdStyle}>#</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Suggestion</th><th style={thTdStyle}>Reason</th></tr></thead><tbody>{setup.descriptions.map((description, index) => { const review = reviewDescription(description, index, adGroupId); return <tr key={description + index}><td style={thTdStyle}>Description {index + 1}</td><td style={thTdStyle}>{review.status}</td><td style={thTdStyle}>{review.suggestion}</td><td style={thTdStyle}>{review.reason}</td></tr>; })}</tbody></table></div>
      </section>

      <section style={twoColumnStyle}>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>Sitelinks and callouts</h2><h3>Sitelinks</h3><ul>{setup.sitelinks.map((item) => <li key={item}>{item}</li>)}</ul><h3>Callouts</h3><ul>{setup.callouts.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div style={cardStyle}><h2 style={{ marginTop: 0 }}>AI extension review</h2><table style={tableStyle}><tbody><tr><td style={thTdStyle}>Sitelinks</td><td style={thTdStyle}>Good, but make sure the first sitelink matches the selected ad group theme.</td></tr><tr><td style={thTdStyle}>Callouts</td><td style={thTdStyle}>Keep No Repairs Needed and No Realtor Fees. Test a stronger local trust callout.</td></tr><tr><td style={thTdStyle}>Structured snippets</td><td style={thTdStyle}>Add seller situations that match this account.</td></tr></tbody></table></div>
      </section>
    </>
  );
}
