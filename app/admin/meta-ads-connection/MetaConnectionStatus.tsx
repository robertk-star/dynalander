'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type CheckRow = {
  name: string;
  ok: boolean;
  status: string;
  detail?: string;
};

type MetaStatus = {
  ok: boolean;
  configured: boolean;
  mode: string;
  adAccountId?: string | null;
  apiVersion?: string;
  checkedAt?: string;
  account?: { id?: string; name?: string; account_status?: number; currency?: string; timezone_name?: string } | null;
  checks?: CheckRow[];
};

const fallbackRows: CheckRow[] = [
  { name: 'Meta API connection', ok: false, status: 'Not checked yet' },
  { name: 'Access mode', ok: true, status: 'Read only planned' },
  { name: 'Live data saving', ok: false, status: 'Disabled' },
  { name: 'Meta write actions', ok: false, status: 'Disabled' }
];

export default function MetaConnectionStatus() {
  const [status, setStatus] = useState<MetaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadStatus() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/meta-ads/status', { cache: 'no-store' });
      const result = await response.json();
      setStatus(result);
    } catch {
      setError('Could not load Meta readiness status.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const checks = status?.checks || fallbackRows;
  const account = status?.account;

  return (
    <>
      <section style={{ ...cardStyle, border: status?.ok ? '2px solid #16a34a' : '2px solid #f97316', background: status?.ok ? '#f0fdf4' : '#fff7ed' }}>
        <h2 style={{ marginTop: 0 }}>Meta connection readiness</h2>
        <p style={{ color: status?.ok ? '#166534' : '#9a3412', fontWeight: 800, lineHeight: 1.6 }}>
          {status?.ok ? 'Meta read-only connection is working.' : 'Meta is not fully connected yet. DynLander will not make Meta changes.'}
        </p>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Mode: {status?.mode || 'loading'} · API: {status?.apiVersion || 'not set'} · Ad account: {status?.adAccountId || 'not set'}
        </p>
      </section>

      <div style={gridStyle}>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Meta connection</div><strong style={{ fontSize: 28 }}>{status?.ok ? 'Connected' : 'Not ready'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{loading ? 'Checking...' : status?.configured ? 'Credentials found.' : 'Missing required ENV.'}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Access mode</div><strong style={{ fontSize: 28 }}>Read only</strong><p style={{ color: '#64748b', marginBottom: 0 }}>No write routes are enabled.</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Ad account</div><strong style={{ fontSize: 28 }}>{account?.name || 'Not readable yet'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{account?.currency || 'Currency not loaded'} {account?.timezone_name || ''}</p></div>
        <div style={cardStyle}><div style={{ color: '#64748b' }}>Last checked</div><strong style={{ fontSize: 28 }}>{status?.checkedAt ? new Date(status.checkedAt).toLocaleTimeString() : '—'}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{error || 'Refresh to re-check.'}</p></div>
      </div>

      <section style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Meta readiness checklist</h2>
          <button type="button" style={blueButtonStyle} onClick={loadStatus}>Refresh check</button>
        </div>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Item</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Detail</th></tr></thead>
          <tbody>{checks.map((row) => <tr key={row.name}><td style={thTdStyle}>{row.name}</td><td style={thTdStyle}>{row.ok ? '✅ ' : '⚠️ '}{row.status}</td><td style={thTdStyle}>{row.detail || '—'}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Safety lock</h2>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 0 }}>
          This page only checks read access. DynLander still does not create campaigns, edit budgets, change ads, change audiences, or publish anything to Meta.
        </p>
      </section>
    </>
  );
}
