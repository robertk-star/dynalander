import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type PlacementSummary = { placement: string; results: string; costPerResult: string; spend: string; impressions: string; clicks: string; ctr: string; cpc: string; cpm: string };
type PlacementRow = PlacementSummary & { id: string; rawPlatform: string; rawPosition: string; adName: string; adSetName: string; campaignName: string };

export default function PlacementDetailsSection({ summaryRows, detailRows, warning }: { summaryRows: PlacementSummary[]; detailRows: PlacementRow[]; warning?: string | null }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Meta placement details</h2>
      <p style={{ color: '#64748b' }}>Breakdown by publisher platform and platform position.</p>
      {warning ? <p style={{ color: '#9a3412', fontWeight: 800 }}>{warning}</p> : null}
      <div style={gridStyle}>
        {summaryRows.map((row) => (
          <div key={row.placement} style={cardStyle}>
            <div style={{ color: '#64748b' }}>{row.placement}</div>
            <strong style={{ fontSize: 30 }}>{row.results}</strong>
            <p style={{ marginBottom: 0 }}>Results · {row.spend} spend · {row.costPerResult} per result</p>
          </div>
        ))}
      </div>
      <table style={tableStyle}>
        <thead><tr><th style={thTdStyle}>Placement</th><th style={thTdStyle}>Ad</th><th style={thTdStyle}>Ad set</th><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Results</th><th style={thTdStyle}>Cost/result</th><th style={thTdStyle}>Spend</th><th style={thTdStyle}>Impressions</th><th style={thTdStyle}>Clicks</th><th style={thTdStyle}>CTR</th><th style={thTdStyle}>CPC</th><th style={thTdStyle}>CPM</th></tr></thead>
        <tbody>{detailRows.map((row) => <tr key={row.id}><td style={thTdStyle}>{row.placement}<div style={{ color: '#64748b', fontSize: 12 }}>{row.rawPlatform} / {row.rawPosition}</div></td><td style={thTdStyle}>{row.adName}</td><td style={thTdStyle}>{row.adSetName}</td><td style={thTdStyle}>{row.campaignName}</td><td style={thTdStyle}>{row.results}</td><td style={thTdStyle}>{row.costPerResult}</td><td style={thTdStyle}>{row.spend}</td><td style={thTdStyle}>{row.impressions}</td><td style={thTdStyle}>{row.clicks}</td><td style={thTdStyle}>{row.ctr}</td><td style={thTdStyle}>{row.cpc}</td><td style={thTdStyle}>{row.cpm}</td></tr>)}</tbody>
      </table>
      {summaryRows.length === 0 ? <p style={{ color: '#64748b' }}>No placement rows returned for this date range.</p> : null}
    </section>
  );
}
