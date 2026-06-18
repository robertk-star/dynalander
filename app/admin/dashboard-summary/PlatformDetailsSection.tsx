import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type PlatformSummary = {
  platform: string;
  results: string;
  costPerResult: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
};

type PlatformRow = PlatformSummary & {
  id: string;
  rawPlatform: string;
  adName: string;
  adSetName: string;
  campaignName: string;
};

export default function PlatformDetailsSection({ summaryRows, detailRows, warning }: { summaryRows: PlatformSummary[]; detailRows: PlatformRow[]; warning?: string | null }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Platform details</h2>
      <p style={{ color: '#64748b' }}>Shows which Meta platforms are spending money and generating leads. This uses Meta publisher platform breakdown.</p>
      {warning ? <p style={{ color: '#9a3412', fontWeight: 800 }}>{warning}</p> : null}

      <div style={gridStyle}>
        {summaryRows.map((row) => (
          <div key={`platform-card-${row.platform}`} style={cardStyle}>
            <div style={{ color: '#64748b' }}>{row.platform}</div>
            <strong style={{ fontSize: 30 }}>{row.results}</strong>
            <p style={{ marginBottom: 0, color: '#64748b' }}>Results</p>
            <p style={{ marginBottom: 0 }}><strong>{row.spend}</strong> spend</p>
            <p style={{ marginBottom: 0 }}>{row.costPerResult} per result</p>
          </div>
        ))}
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thTdStyle}>Platform</th>
            <th style={thTdStyle}>Ad</th>
            <th style={thTdStyle}>Ad set</th>
            <th style={thTdStyle}>Campaign</th>
            <th style={thTdStyle}>Results</th>
            <th style={thTdStyle}>Cost/result</th>
            <th style={thTdStyle}>Spend</th>
            <th style={thTdStyle}>Impressions</th>
            <th style={thTdStyle}>Clicks</th>
            <th style={thTdStyle}>CTR</th>
            <th style={thTdStyle}>CPC</th>
            <th style={thTdStyle}>CPM</th>
          </tr>
        </thead>
        <tbody>
          {detailRows.map((row) => (
            <tr key={row.id}>
              <td style={thTdStyle}>{row.platform}<div style={{ color: '#64748b', fontSize: 12 }}>{row.rawPlatform}</div></td>
              <td style={thTdStyle}>{row.adName}</td>
              <td style={thTdStyle}>{row.adSetName}</td>
              <td style={thTdStyle}>{row.campaignName}</td>
              <td style={thTdStyle}>{row.results}</td>
              <td style={thTdStyle}>{row.costPerResult}</td>
              <td style={thTdStyle}>{row.spend}</td>
              <td style={thTdStyle}>{row.impressions}</td>
              <td style={thTdStyle}>{row.clicks}</td>
              <td style={thTdStyle}>{row.ctr}</td>
              <td style={thTdStyle}>{row.cpc}</td>
              <td style={thTdStyle}>{row.cpm}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {summaryRows.length === 0 ? <p style={{ color: '#64748b' }}>No platform breakdown rows returned for the selected date range.</p> : null}
    </section>
  );
}
