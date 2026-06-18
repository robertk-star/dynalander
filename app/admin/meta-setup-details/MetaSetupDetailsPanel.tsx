'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';

type DetailRow = [string, string];
type SetupItem = { id: string; name: string; campaignName?: string; adSetName?: string; details: DetailRow[] };
type ApiData = { ok: boolean; error?: string; campaigns: SetupItem[]; adSets: SetupItem[]; ads: SetupItem[]; counts?: { campaigns: number; adSets: number; ads: number }; checkedAt?: string };
type TabKey = 'campaigns' | 'adSets' | 'ads';

function cdt(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function DetailsBlock({ item }: { item: SetupItem }) {
  return (
    <section style={cardStyle}>
      <h3 style={{ marginTop: 0 }}>{item.name}</h3>
      {item.campaignName ? <p style={{ color: '#64748b', fontWeight: 800 }}>Campaign: {item.campaignName}</p> : null}
      {item.adSetName ? <p style={{ color: '#64748b', fontWeight: 800 }}>Ad set: {item.adSetName}</p> : null}
      <table style={{ ...tableStyle, minWidth: 620 }}>
        <tbody>
          {item.details.map(([label, value]) => (
            <tr key={`${item.id}-${label}`}>
              <td style={{ ...thTdStyle, width: 220, fontWeight: 900 }}>{label}</td>
              <td style={thTdStyle}><pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{value}</pre></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function MetaSetupDetailsPanel() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const [tab, setTab] = useState<TabKey>('campaigns');
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ accountKey: selectedAccount.customerId });
      const response = await fetch(`/api/meta-ads/setup-details?${params.toString()}`, { cache: 'no-store' });
      setData(await response.json());
    } catch {
      setData({ ok: false, error: 'Setup details request failed.', campaigns: [], adSets: [], ads: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (platform === 'meta_ads') loadData(); }, [platform, selectedAccount.customerId]);

  if (platform !== 'meta_ads') {
    return <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Meta Setup Details</h2><p style={{ color: '#64748b' }}>Select Facebook / Meta Ads from the left sidebar to view setup details.</p></section>;
  }

  const rows = tab === 'campaigns' ? data?.campaigns || [] : tab === 'adSets' ? data?.adSets || [] : data?.ads || [];

  return (
    <>
      <section style={{ ...cardStyle, border: data?.ok ? '2px solid #0f766e' : '2px solid #f97316', background: data?.ok ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta Setup Details</h2>
            <p style={{ color: data?.ok ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
              {data?.ok ? `Showing live setup details for ${selectedAccount.name}.` : data?.error || 'Waiting for Meta setup details.'}
            </p>
            <p style={{ color: '#64748b', marginBottom: 0 }}>Last checked: {cdt(data?.checkedAt)}</p>
          </div>
          <button type="button" onClick={loadData} style={blueButtonStyle}>{loading ? 'Refreshing...' : 'Refresh setup details'}</button>
        </div>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Campaigns</div><strong style={{ fontSize: 30 }}>{data?.counts?.campaigns ?? '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ad sets</div><strong style={{ fontSize: 30 }}>{data?.counts?.adSets ?? '—'}</strong></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ads</div><strong style={{ fontSize: 30 }}>{data?.counts?.ads ?? '—'}</strong></div>
      </div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Setup tabs</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setTab('campaigns')} style={{ ...blueButtonStyle, background: tab === 'campaigns' ? '#2563eb' : '#334155' }}>Campaigns</button>
          <button type="button" onClick={() => setTab('adSets')} style={{ ...blueButtonStyle, background: tab === 'adSets' ? '#2563eb' : '#334155' }}>Ad sets</button>
          <button type="button" onClick={() => setTab('ads')} style={{ ...blueButtonStyle, background: tab === 'ads' ? '#2563eb' : '#334155' }}>Ads</button>
        </div>
      </section>

      <section style={{ ...cardStyle, border: '2px solid #f97316', background: '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Placement and device warning</h2>
        <p style={{ color: '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>For ad sets, check Publisher platforms, Facebook positions, Instagram positions, Device platforms, User OS, and User device. If Meta expanded your setup, it should show there when Meta returns the field.</p>
      </section>

      {rows.map((item) => <DetailsBlock key={`${tab}-${item.id}`} item={item} />)}
      {!loading && rows.length === 0 ? <section style={cardStyle}><p style={{ color: '#64748b' }}>No rows returned for this tab.</p></section> : null}
    </>
  );
}
