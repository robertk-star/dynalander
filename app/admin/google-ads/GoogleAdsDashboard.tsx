'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { googleAdsDateRanges } from '../_data/dynlanderAdminData';
import {
  getAccountAdMessages,
  getAccountBudgetReview,
  getAccountCampaigns,
  getAccountExtensions,
  getAccountGoogleAdsSummary,
  getAccountKeywords,
  getAccountPriorityItems,
  getAccountSearchTerms
} from '../_data/accountScopedData';

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
  const { accountId, selectedAccount } = useActiveAccount();
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [directions, setDirections] = useState<Directions>(defaultDirections);

  const summary = getAccountGoogleAdsSummary(accountId);
  const priorityItems = getAccountPriorityItems(accountId);
  const campaigns = getAccountCampaigns(accountId);
  const adMessages = getAccountAdMessages(accountId);
  const keywords = getAccountKeywords(accountId);
  const searchTerms = getAccountSearchTerms(accountId);
  const extensions = getAccountExtensions(accountId);
  const budgetReview = getAccountBudgetReview(accountId);

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

  return (
    <>
      <section style={cardStyle}>
        <div style={twoColumnStyle}>
          <div>
            <div style={{ color: '#64748b', fontWeight: 800, fontSize: 13, marginBottom: 7 }}>Active client account</div>
            <strong style={{ fontSize: 22 }}>{selectedAccount.name}</strong>
            <p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.market} | Google Ads ID: {selectedAccount.customerId}</p>
          </div>
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
          Account-scoped mock data is loaded for <strong>{selectedAccount.name}</strong>. Selected range: <strong>{dateRange}</strong>.
        </p>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #fde68a', background: '#fffbeb' }}>
        <SectionTitle title="AI directions being applied" description="These guardrails come from the AI Directions page. The recommendation engine should read these before creating advice." />
        <div style={gridStyle}>
          <div><strong>Max monthly budget</strong><p style={{ color: '#475569' }}>${directions.monthlyBudget}</p></div>
          <div><strong>Target CPL</strong><p style={{ color: '#475569' }}>${directions.targetCpl}</p></div>
          <div><strong>Approval rules</strong><p style={{ color: '#475569' }}>{directions.approvalRequired}</p></div>
          <div><strong>Recommendation rule</strong><p style={{ color: '#475569' }}>{directions.recommendationRules}</p></div>
        </div>
        <a href="/admin/ai-directions" style={{ color: '#1d4ed8', fontWeight: 800 }}>Edit AI directions</a>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 34 }}>{summary.spend}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Impressions</div><strong style={{ fontSize: 34 }}>{summary.impressions}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Clicks</div><strong style={{ fontSize: 34 }}>{summary.clicks}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 34 }}>{summary.ctr}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Avg CPC</div><strong style={{ fontSize: 34 }}>{summary.avgCpc}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Leads</div><strong style={{ fontSize: 34 }}>{summary.leads}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Cost per lead</div><strong style={{ fontSize: 34 }}>{summary.cpl}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Cost per qualified lead</div><strong style={{ fontSize: 34 }}>{summary.costPerQualifiedLead}</strong></div>
      </div>

      <section style={{ ...cardStyle, border: '1px solid #bfdbfe', background: '#eff6ff' }}>
        <SectionTitle title="Needs attention today" description="This is the main action list the account manager should review first." />
        <div style={gridStyle}>
          {priorityItems.map((item) => (
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
          <tbody>{campaigns.map((row) => <tr key={row.name}><td style={thTdStyle}><strong>{row.name}</strong><br /><span style={badgeStyle}>{row.quality}</span></td><td style={thTdStyle}>{row.status}</td><td style={thTdStyle}>{row.bidStrategy}</td><td style={thTdStyle}>{row.budget}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}>{row.aiRead}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <SectionTitle title="Ad message to landing page match" description="This connects the ad angle to the matching seller-intent page and lead result." />
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Ad theme</th><th style={thTdStyle}>Headline angle</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>Landing page</th><th style={thTdStyle}>Read</th></tr></thead>
          <tbody>{adMessages.map((row) => <tr key={row.theme}><td style={thTdStyle}>{row.theme}</td><td style={thTdStyle}>{row.angle}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}><a href={'/sell?theme=' + row.landingPage + '&city=Plano'}>theme={row.landingPage}</a></td><td style={thTdStyle}>{row.aiRead}</td></tr>)}</tbody>
        </table>
      </section>

      <div style={twoColumnStyle}>
        <section style={cardStyle}>
          <SectionTitle title="Keyword review" description="Labels which keywords should scale, be watched, or tightened." />
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Keyword</th><th style={thTdStyle}>Match</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>Intent</th><th style={thTdStyle}>Action</th></tr></thead>
            <tbody>{keywords.map((row) => <tr key={row.keyword}><td style={thTdStyle}>{row.keyword}</td><td style={thTdStyle}>{row.matchType}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}><span style={badgeStyle}>{row.intent}</span></td><td style={thTdStyle}>{row.action}</td></tr>)}</tbody>
          </table>
        </section>

        <section style={cardStyle}>
          <SectionTitle title="Search term waste" description="Find searches that spent money but do not match seller intent." />
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Search term</th><th style={thTdStyle}>Matched keyword</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>Action</th></tr></thead>
            <tbody>{searchTerms.map((row) => <tr key={row.term}><td style={thTdStyle}>{row.term}</td><td style={thTdStyle}>{row.matchedKeyword}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.action}</td></tr>)}</tbody>
          </table>
        </section>
      </div>

      <section style={cardStyle}>
        <SectionTitle title="Sitelinks, callouts, and structured snippets" description="Review extension wording and whether it supports the seller intent themes." />
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Type</th><th style={thTdStyle}>Text</th><th style={thTdStyle}>Destination</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>Note</th></tr></thead>
          <tbody>{extensions.map((row) => <tr key={row.type + row.text}><td style={thTdStyle}>{row.type}</td><td style={thTdStyle}>{row.text}</td><td style={thTdStyle}>{row.destination}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.note}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <SectionTitle title="Budget and bid strategy review" description="Mock recommendations for budget movement, bidding approach, and tracking cautions." />
        <div style={gridStyle}>{budgetReview.map((row) => <div key={row.area} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}><h3 style={{ marginTop: 0 }}>{row.area}</h3><p style={{ color: '#475569', lineHeight: 1.5, marginBottom: 0 }}>{row.note}</p></div>)}</div>
      </section>
    </>
  );
}
