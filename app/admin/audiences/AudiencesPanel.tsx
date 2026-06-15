'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';

type Usage = {
  adSetId: string;
  adSetName: string;
  campaignId: string;
  campaignName: string;
  status: string;
  effectiveStatus: string;
  useType: string;
};

type Audience = {
  id: string;
  name: string;
  type: string;
  subtype: string;
  status: string;
  statusTone?: 'ready' | 'blocked' | 'neutral';
  statusRaw?: string;
  size: string;
  description: string;
  created: string;
  updated: string;
  retentionDays: string;
  source: string;
  usage: Usage[];
};

type ApiData = {
  ok: boolean;
  error?: string;
  adAccountId?: string;
  audiences: Audience[];
  adSetUsageRowsRead?: number;
  warnings?: Record<string, string | null>;
  checkedAt?: string;
};

function usageText(usage: Usage[]) {
  if (!usage.length) return 'Not found in active ad set targeting.';
  return usage.map((item) => `${item.useType}: ${item.campaignName} / ${item.adSetName} (${item.effectiveStatus || item.status})`).join('\n');
}

function StatusBadge({ audience }: { audience: Audience }) {
  const tone = audience.statusTone || 'neutral';
  const style = tone === 'ready'
    ? { background: '#dcfce7', color: '#166534', border: '1px solid #22c55e' }
    : tone === 'blocked'
      ? { background: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444' }
      : { background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' };

  return (
    <span style={{ ...style, display: 'inline-block', borderRadius: 999, padding: '6px 10px', fontWeight: 900 }} title={audience.statusRaw ? `Meta raw status: ${audience.statusRaw}` : undefined}>
      {audience.status}
    </span>
  );
}

export default function AudiencesPanel() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadAudiences() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ accountKey: selectedAccount.customerId });
      const response = await fetch(`/api/meta-ads/audiences?${params.toString()}`, { cache: 'no-store' });
      setData(await response.json());
    } catch {
      setData({ ok: false, error: 'Audience request failed.', audiences: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (platform === 'meta_ads') loadAudiences(); }, [platform, selectedAccount.customerId]);

  if (platform !== 'meta_ads') {
    return <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Audiences</h2><p style={{ color: '#64748b' }}>Select Facebook / Meta Ads from the left sidebar to view Meta audiences.</p></section>;
  }

  const warnings = data?.warnings || {};

  return (
    <>
      <section style={{ ...cardStyle, border: data?.ok ? '2px solid #0f766e' : '2px solid #f97316', background: data?.ok ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Meta Audiences</h2>
            <p style={{ color: data?.ok ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
              {data?.ok ? `Read ${data.audiences.length} audiences for ${selectedAccount.name}. Scanned ${data.adSetUsageRowsRead || 0} ad sets for usage.` : data?.error || `Not connected for ${selectedAccount.name}.`}
            </p>
          </div>
          <button type="button" onClick={loadAudiences} style={blueButtonStyle}>{loading ? 'Refreshing...' : 'Refresh audiences'}</button>
        </div>
      </section>

      {Object.values(warnings).filter(Boolean).length ? (
        <section style={{ ...cardStyle, borderColor: '#f97316', background: '#fff7ed' }}>
          <h3 style={{ marginTop: 0 }}>Warnings</h3>
          {Object.entries(warnings).map(([key, value]) => value ? <p key={key} style={{ color: '#9a3412', fontWeight: 700 }}>{key}: {value}</p> : null)}
        </section>
      ) : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Audience list</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Audience</th>
              <th style={thTdStyle}>Type</th>
              <th style={thTdStyle}>Status</th>
              <th style={thTdStyle}>Size</th>
              <th style={thTdStyle}>Source</th>
              <th style={thTdStyle}>Used where / how</th>
            </tr>
          </thead>
          <tbody>
            {(data?.audiences || []).map((audience) => (
              <tr key={`${audience.type}-${audience.id}`}>
                <td style={thTdStyle}>
                  <strong>{audience.name}</strong>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{audience.id}</div>
                  {audience.description !== '—' ? <div style={{ color: '#64748b', marginTop: 6 }}>{audience.description}</div> : null}
                </td>
                <td style={thTdStyle}>{audience.type}<div style={{ color: '#64748b', fontSize: 12 }}>{audience.subtype}</div></td>
                <td style={thTdStyle}><StatusBadge audience={audience} /></td>
                <td style={thTdStyle}>{audience.size}</td>
                <td style={thTdStyle}>{audience.source}</td>
                <td style={{ ...thTdStyle, whiteSpace: 'pre-line' }}>{usageText(audience.usage)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.audiences?.length === 0 ? <p style={{ color: '#64748b' }}>No audiences were returned for this account, or the connected token does not have permission to read them.</p> : null}
      </section>
    </>
  );
}
