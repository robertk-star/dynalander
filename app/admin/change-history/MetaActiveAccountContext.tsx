'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useMetaDataMode } from '../_components/useMetaDataMode';

type CountResponse = { ok: boolean; changes?: unknown[]; error?: string };
type LivePreview = { ok: boolean; source: string; summary: null | { campaignCount: number; adSetCount: number; adCount: number; spend: string; impressions: string; clicks: string; ctr: string }; error?: string };

export default function MetaActiveAccountContext() {
  const { accountId, selectedAccount } = useActiveAccount();
  const { mode } = useMetaDataMode();
  const isDemoMode = mode === 'demo';
  const [countData, setCountData] = useState<CountResponse | null>(null);
  const [livePreview, setLivePreview] = useState<LivePreview | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [countResponse, liveResponse] = await Promise.all([
        fetch(`/api/meta-ads/changes?accountKey=${encodeURIComponent(accountId)}`, { cache: 'no-store' }),
        isDemoMode ? Promise.resolve(null) : fetch(`/api/meta-ads/read-only-preview?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' })
      ]);
      setCountData(await countResponse.json());
      setLivePreview(liveResponse ? await liveResponse.json() : null);
    } catch {
      setCountData(null);
      setLivePreview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [accountId, selectedAccount.customerId, isDemoMode]);

  const liveReady = Boolean(!isDemoMode && livePreview?.ok && livePreview.summary);
  const internalCount = Array.isArray(countData?.changes) ? countData.changes.length : 0;

  return (
    <>
      <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta active-account context</h2>
        <p style={{ color: liveReady ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
          {liveReady ? `Live read-only context is available for ${selectedAccount.name}.` : `Live read-only context is not available for ${selectedAccount.name}.`}
        </p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Active account</div><strong style={{ fontSize: 24 }}>{selectedAccount.name}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{selectedAccount.customerId}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Live context</div><strong style={{ fontSize: 24 }}>{loading ? 'Loading...' : liveReady ? 'Available' : isDemoMode ? 'Demo' : 'Not available'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{liveReady ? livePreview?.source : livePreview?.error || 'No live context loaded.'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Campaigns</div><strong style={{ fontSize: 24 }}>{loading ? 'Loading...' : liveReady ? livePreview?.summary?.campaignCount : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>From active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ad sets</div><strong style={{ fontSize: 24 }}>{loading ? 'Loading...' : liveReady ? livePreview?.summary?.adSetCount : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>From active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ads</div><strong style={{ fontSize: 24 }}>{loading ? 'Loading...' : liveReady ? livePreview?.summary?.adCount : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>From active account.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Internal rows</div><strong style={{ fontSize: 24 }}>{loading ? 'Loading...' : internalCount}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>Stored inside DynLander for the active account.</p></div>
      </div>
    </>
  );
}
