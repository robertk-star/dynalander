'use client';

import { useState } from 'react';
import { cardStyle, gridStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import {
  googleAdsAccounts,
  googleAdsAdMessages,
  googleAdsBudgetReview,
  googleAdsCampaigns,
  googleAdsDateRanges,
  googleAdsExtensions,
  googleAdsKeywords,
  googleAdsPriorityItems,
  googleAdsSearchTerms,
  googleAdsSummary
} from '../_data/dynlanderAdminData';

const buttonStyle = (active: boolean) => ({
  border: active ? '1px solid #2563eb' : '1px solid #cbd5e1',
  background: active ? '#eff6ff' : '#fff',
  color: active ? '#1d4ed8' : '#334155',
  borderRadius: 999,
  padding: '9px 13px',
  fontWeight: 800,
  cursor: 'pointer'
});

const badgeStyle = {
  display: 'inline-flex',
  borderRadius: 999,
  padding: '5px 9px',
  fontSize: 12,
  fontWeight: 800,
  background: '#eff6ff',
  color: '#1d4ed8'
};

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      {description ? <p style={{ color: '#64748b', marginBottom: 0, lineHeight: 1.5 }}>{description}</p> : null}
    </div>
  );
}

export default function GoogleAdsDashboard() {
  const [accountId, setAccountId] = useState(googleAdsAccounts[0].id);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const selectedAccount = googleAdsAccounts.find((account) => account.id === accountId) || googleAdsAccounts[0];

  return (
    <>
      <section style={cardStyle}>
        <div style={twoColumnStyle}>
          <label style={labelStyle}>
            Client account
            <select style={inputStyle} value={accountId} onChange={(event) => setAccountId(event.target.value)}>
              {googleAdsAccounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name} - {account.customerId}</option>
              ))}
            </select>
          </label>
          <div>
            <div style={{ color: '#64748b', fontWeight: 800, fontSize: 13, marginBottom: 7 }}>Date range</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {googleAdsDateRanges.map((range) => (
                <button key={range} type="button" style={buttonStyle(range === dateRange)} onClick={() => setDateRange(range)}>{range}</button>
              ))}
            </div>
          </div>
        </div>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Viewing mock data for <strong>{selectedAccount.name}</strong> in <strong>{selectedAccount.market}</strong>. Selected range: <strong>{dateRange}</strong>.
        </p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.spend}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Impressions</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.impressions}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Clicks</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.clicks}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.ctr}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Avg CPC</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.avgCpc}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Leads</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.leads}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Cost per lead</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.cpl}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Cost per qualified lead</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.costPerQualifiedLead}</strong></div>
      </div>

      <section style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
        <SectionTitle title="Needs attention today" description="This is the main action list the account manager should review first." />
        <div style={gridStyle}>
          {googleAdsPriorityItems.map((item) => (
            <div key={item.title} style={{ background: '#fff', borderRadius: 14, border: '1px solid #dbeafe', padding: 16 }}>
              <span style={badgeStyle}>{item.level}</span>
              <h3 style={{ marginBottom: 6 }}>{item.title}</h3>
              <p style={{ color: '#475569', lineHeight: 1.5, marginBottom: 0 }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={cardStyle}>
        <SectionTitle title="Campaign performance" description="Campaign-level readout for budget, bidding, clicks, leads, CPL, and recommendations." />
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Bid strategy</th><th style={thTdStyle}>Budget</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>Read</th></tr></thead>
          <tbody>{googleAdsCampaigns.map((row) => <tr key={row.name}><td style={thTdStyle}><strong>{row.name}</strong><br /><span style={badgeStyle}>{row.quality}</span></td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>{row.bidStrategy}</td><td style={thTdStyle}>{row.budget}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}>{row.aiRead}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <SectionTitle title="Ad message to landing page match" description="This connects the ad angle to the matching seller-intent page and lead result." />
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad theme</th><th style={thTdStyle}>Headline angle</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>Landing page</th><th style={thTdStyle}>Read</th></tr></thead>
          <tbody>{googleAdsAdMessages.map((row) => <tr key={row.theme}><td style={thTdStyle}>{row.theme}</td><td style={thTdStyle}>{row.angle}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}><a href={'/sell?theme=' + row.landingPage + '&city=Plano'}>theme={row.landingPage}</a></td><td style={thTdStyle}>{row.aiRead}</td></tr>)}</tbody>
        </table>
      </section>

      <div style={twoColumnStyle}>
        <section style={cardStyle}>
          <SectionTitle title="Keyword review" description="Labels which keywords should scale, be watched, or tightened." />
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Keyword</th><th style={thTdStyle}>Match</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>Intent</th><th style={thTdStyle}>Action</th></tr></thead>
            <tbody>{googleAdsKeywords.map((row) => <tr key={row.keyword}><td style={thTdStyle}>{row.keyword}</td><td style={thTdStyle}>{row.matchType}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}><span style={badgeStyle}>{row.intent}</span></td><td style={thTdStyle}>{row.action}</td></tr>)}</tbody>
          </table>
        </section>

        <section style={cardStyle}>
          <SectionTitle title="Search term waste" description="Find searches that spent money but do not match seller intent." />
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Search term</th><th style={thTdStyle}>Matched keyword</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>Action</th></tr></thead>
            <tbody>{googleAdsSearchTerms.map((row) => <tr key={row.term}><td style={thTdStyle}>{row.term}</td><td style={thTdStyle}>{row.matchedKeyword}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.action}</td></tr>)}</tbody>
          </table>
        </section>
      </div>

      <section style={cardStyle}>
        <SectionTitle title="Sitelinks, callouts, and structured snippets" description="Review extension wording and whether it supports the seller intent themes." />
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Type</th><th style={thTdStyle}>Text</th><th style={thTdStyle}>Destination</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>Note</th></tr></thead>
          <tbody>{googleAdsExtensions.map((row) => <tr key={row.type + row.text}><td style={thTdStyle}>{row.type}</td><td style={thTdStyle}>{row.text}</td><td style={thTdStyle}>{row.destination}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.note}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <SectionTitle title="Budget and bid strategy review" description="Mock recommendations for budget movement, bidding approach, and tracking cautions." />
        <div style={gridStyle}>{googleAdsBudgetReview.map((row) => <div key={row.area} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}><h3 style={{ marginTop: 0 }}>{row.area}</h3><p style={{ color: '#475569', lineHeight: 1.5, marginBottom: 0 }}>{row.note}</p></div>)}</div>
      </section>
    </>
  );
}
