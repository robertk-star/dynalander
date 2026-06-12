'use client';

import { useState } from 'react';
import { blueButtonStyle, cardStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type PreviewRow = {
  campaign?: { id?: string; name?: string; status?: string };
  adGroup?: { id?: string; name?: string };
  adGroupAd?: { ad?: { id?: string; finalUrls?: string[] } };
};

type ApiResponse = {
  ok: boolean;
  source: string;
  liveRequested: boolean;
  readOnly: boolean;
  saveEnabled: boolean;
  query: string;
  rows: PreviewRow[];
  error?: string | null;
  note: string;
  checkedAt: string;
};

export default function LiveQueryPreviewPanel() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadPreview(live: boolean) {
    setLoading(true);
    try {
      const response = await fetch(`/api/google-ads/read-only/setup-preview${live ? '?live=1' : ''}`, { cache: 'no-store' });
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section style={{ ...cardStyle, border: '2px solid #16a34a', background: '#f0fdf4' }}>
        <h2 style={{ marginTop: 0 }}>Read-only live query preview</h2>
        <p style={{ color: '#166534', fontWeight: 800, lineHeight: 1.6 }}>
          This page can test the Google Ads read-only query path. It does not save data and it does not change Google Ads.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" style={blueButtonStyle} onClick={() => loadPreview(false)} disabled={loading}>{loading ? 'Loading...' : 'Load Mock Preview'}</button>
          <button type="button" style={{ ...blueButtonStyle, background: '#334155' }} onClick={() => loadPreview(true)} disabled={loading}>{loading ? 'Loading...' : 'Try Live Read-Only Query'}</button>
        </div>
      </section>

      {data ? (
        <>
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Result</h2>
            <p><strong>Source:</strong> {data.source}</p>
            <p><strong>Read only:</strong> {data.readOnly ? 'Yes' : 'No'}</p>
            <p><strong>Save enabled:</strong> {data.saveEnabled ? 'Yes' : 'No'}</p>
            <p><strong>Note:</strong> {data.note}</p>
            {data.error ? <p style={{ color: '#9a3412' }}><strong>Error:</strong> {data.error}</p> : null}
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Rows returned</h2>
            <table style={tableStyle}>
              <thead><tr><th style={thTdStyle}>Campaign</th><th style={thTdStyle}>Ad group</th><th style={thTdStyle}>Ad ID</th><th style={thTdStyle}>Final URL</th></tr></thead>
              <tbody>{data.rows.map((row, index) => <tr key={index}><td style={thTdStyle}>{row.campaign?.name || '—'}</td><td style={thTdStyle}>{row.adGroup?.name || '—'}</td><td style={thTdStyle}>{row.adGroupAd?.ad?.id || '—'}</td><td style={thTdStyle}>{row.adGroupAd?.ad?.finalUrls?.[0] || '—'}</td></tr>)}</tbody>
            </table>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>GAQL query</h2>
            <pre style={{ whiteSpace: 'pre-wrap', color: '#334155' }}>{data.query}</pre>
          </section>
        </>
      ) : null}
    </>
  );
}
