'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useMetaDataMode } from '../_components/useMetaDataMode';

type LivePreview = {
  ok: boolean;
  source: string;
  summary: null | {
    campaignCount: number;
    adSetCount: number;
    adCount: number;
    spend: string;
    impressions: string;
    clicks: string;
    ctr: string;
  };
  error?: string;
};

export default function MetaActiveAccountStatus() {
  const { selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [livePreview, setLivePreview] = useState<LivePreview | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadLiveStatus() {
    if (isDemoMode) {
      setLivePreview(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/meta-ads/read-only-preview?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' });
      setLivePreview(await response.json());
    } catch {
      setLivePreview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLiveStatus(); }, [isDemoMode, selectedAccount.customerId]);

  const liveReady = Boolean(!isDemoMode && livePreview?.ok && livePreview.summary);

  return (
    <>
      <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta account activity</h2>
            <p style={{ color: liveReady ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
              {liveReady ? `Showing live read status for ${selectedAccount.name}.` : `Live read status is not available for ${selectedAccount.name}.`}
            </p>
          </div>
          <button type="button" onClick={loadLiveStatus} style={blueButtonStyle}>{loading ? 'Checking...' : isDemoMode ? 'Demo mode active' : 'Refresh active account status'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Active account</div><strong style={{ fontSize: 28 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Mode</div><strong style={{ fontSize: 28 }}>{liveReady ? 'Live read connected' : isDemoMode ? 'Demo' : 'Not live for active account'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{liveReady ? livePreview?.source : livePreview?.error || 'No live account data loaded.'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Campaigns</div><strong style={{ fontSize: 28 }}>{liveReady ? livePreview?.summary?.campaignCount : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>From the active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ad sets</div><strong style={{ fontSize: 28 }}>{liveReady ? livePreview?.summary?.adSetCount : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>From the active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ads</div><strong style={{ fontSize: 28 }}>{liveReady ? livePreview?.summary?.adCount : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>From the active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Spend</div><strong style={{ fontSize: 28 }}>{liveReady ? livePreview?.summary?.spend : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Last 7 days when available.</p></div>
      </div>

      <section style={{ ...cardStyle, border: '1px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>No separate live inquiry feed connected</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>This page now rolls up from the active Meta account only. A separate live inquiry feed can be added later as its own connection.</p>
      </section>
    </>
  );
}
