'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useMetaDataMode } from '../_components/useMetaDataMode';
import { getMetaLeadSummary, metaLeadRows } from '../_data/metaLeadMockData';

type LivePreview = {
  ok: boolean;
  source: string;
  summary: null | { campaignCount: number; adSetCount: number; adCount: number; spend: string; impressions: string; clicks: string; ctr: string };
  error?: string;
};

export default function MetaLeadsDashboard() {
  const { selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [livePreview, setLivePreview] = useState<LivePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const summary = getMetaLeadSummary();

  async function loadLiveStatus() {
    if (isDemoMode) {
      setLivePreview(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/meta-ads/read-only-preview', { cache: 'no-store' });
      setLivePreview(await response.json());
    } catch {
      setLivePreview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLiveStatus(); }, [isDemoMode]);

  const liveReady = Boolean(!isDemoMode && livePreview?.ok && livePreview.summary);

  return (
    <>
      <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta lead attribution</h2>
            <p style={{ color: liveReady ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
              {liveReady ? 'Live Meta campaign/ad read access is connected. Live Meta lead form records are not connected yet, so lead rows below remain internal/mock only.' : 'Showing internal/mock Meta lead rows. Live Meta lead form records are not connected yet.'}
            </p>
          </div>
          <button type="button" onClick={loadLiveStatus} style={blueButtonStyle}>{loading ? 'Checking...' : isDemoMode ? 'Demo mode active' : 'Refresh live read status'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Meta data mode</div><strong style={{ fontSize: 28 }}>{liveReady ? 'Live read connected' : isDemoMode ? 'Demo / Mock' : 'Live lead access not connected'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Leads remain internal/mock only.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Live campaigns</div><strong style={{ fontSize: 28 }}>{liveReady ? livePreview?.summary?.campaignCount : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Read from Meta in live mode.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Live ads</div><strong style={{ fontSize: 28 }}>{liveReady ? livePreview?.summary?.adCount : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Read from Meta in live mode.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Internal/mock leads</div><strong style={{ fontSize: 28 }}>{summary.total}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Not live Meta lead form data.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>High quality</div><strong style={{ fontSize: 28 }}>{summary.highQuality}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Marked high quality in internal/mock data.</p></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Internal/mock Meta seller inquiries</h2>
        <p style={{ color: '#64748b', lineHeight: 1.6 }}>These rows are not live Meta lead form submissions. Live lead form access can be added later only if the Meta token has the needed lead permissions.</p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Name</th>
              <th style={thTdStyle}>Contact</th>
              <th style={thTdStyle}>City</th>
              <th style={thTdStyle}>Campaign</th>
              <th style={thTdStyle}>Ad set</th>
              <th style={thTdStyle}>Ad</th>
              <th style={thTdStyle}>Source</th>
              <th style={thTdStyle}>Quality</th>
              <th style={thTdStyle}>Status</th>
              <th style={thTdStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {metaLeadRows.map((row) => (
              <tr key={row.phone}>
                <td style={thTdStyle}>{row.name}</td>
                <td style={thTdStyle}>{row.phone}</td>
                <td style={thTdStyle}>{row.city}</td>
                <td style={thTdStyle}>{row.campaign}</td>
                <td style={thTdStyle}>{row.adSet}</td>
                <td style={thTdStyle}>{row.ad}</td>
                <td style={thTdStyle}>{row.source}</td>
                <td style={thTdStyle}>{row.quality}</td>
                <td style={thTdStyle}>{row.status}</td>
                <td style={thTdStyle}>{row.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Live lead form access not enabled</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>DynLander is currently reading Meta campaign/ad performance data, not live Meta lead form submissions.</p>
      </section>
    </>
  );
}
