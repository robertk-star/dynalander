import AdminShell from '../_components/AdminShell';
import { cardStyle, gridStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import {
  googleAdsCampaigns,
  googleAdsExtensions,
  googleAdsKeywords,
  googleAdsRecommendations,
  googleAdsSearchTerms,
  googleAdsSummary
} from '../_data/dynlanderAdminData';

export default function GoogleAdsDashboardPage() {
  return (
    <AdminShell
      title="Google Ads Intelligence"
      subtitle="Phase 1 placeholder dashboard. This uses mock Google Ads data now. Phase 2 will connect server-side Google Ads API routes and secure Vercel environment variables."
    >
      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.spend}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Clicks</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.clicks}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>CTR</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.ctr}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Cost per lead</div><strong style={{ fontSize: 34 }}>{googleAdsSummary.cpl}</strong></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>AI action list</h2>
        <ol style={{ lineHeight: 1.7 }}>
          {googleAdsRecommendations.map((item) => (
            <li key={item}><strong>{item}</strong></li>
          ))}
        </ol>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Campaign performance</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Campaign</th>
              <th style={thTdStyle}>Bid strategy</th>
              <th style={thTdStyle}>Budget</th>
              <th style={thTdStyle}>Spend</th>
              <th style={thTdStyle}>Clicks</th>
              <th style={thTdStyle}>CTR</th>
              <th style={thTdStyle}>Leads</th>
              <th style={thTdStyle}>CPL</th>
              <th style={thTdStyle}>AI read</th>
            </tr>
          </thead>
          <tbody>
            {googleAdsCampaigns.map((row) => (
              <tr key={row.name}>
                <td style={thTdStyle}>{row.name}</td>
                <td style={thTdStyle}>{row.bidStrategy}</td>
                <td style={thTdStyle}>{row.budget}</td>
                <td style={thTdStyle}>{row.spend}</td>
                <td style={thTdStyle}>{row.clicks}</td>
                <td style={thTdStyle}>{row.ctr}</td>
                <td style={thTdStyle}>{row.leads}</td>
                <td style={thTdStyle}>{row.cpl}</td>
                <td style={thTdStyle}>{row.aiRead}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div style={twoColumnStyle}>
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Keyword review</h2>
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Keyword</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>CPL</th><th style={thTdStyle}>Action</th></tr></thead>
            <tbody>
              {googleAdsKeywords.map((row) => (
                <tr key={row.keyword}><td style={thTdStyle}>{row.keyword}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.cpl}</td><td style={thTdStyle}>{row.action}</td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Search term waste</h2>
          <table style={tableStyle}>
            <thead><tr><th style={thTdStyle}>Search term</th><th style={thTdStyle}>Cost</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>AI label</th></tr></thead>
            <tbody>
              {googleAdsSearchTerms.map((row) => (
                <tr key={row.term}><td style={thTdStyle}>{row.term}</td><td style={thTdStyle}>{row.cost}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.label}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Extensions: sitelinks, callouts, structured snippets</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Type</th><th style={thTdStyle}>Text</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>Leads</th><th style={thTdStyle}>AI note</th></tr></thead>
          <tbody>
            {googleAdsExtensions.map((row) => (
              <tr key={`${row.type}-${row.text}`}><td style={thTdStyle}>{row.type}</td><td style={thTdStyle}>{row.text}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.leads}</td><td style={thTdStyle}>{row.note}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
