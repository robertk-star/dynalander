'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type HealthResponse = { ok: boolean; configured: boolean; env: { hasUrl: boolean; hasAnonKey: boolean; hasAdminKey: boolean }; checkedAt: string };
type ClientsResponse = { ok: boolean; source: string; clients: Array<{ id: string; name: string; market?: string; status?: string }> };
type TableResponse = { ok: boolean; configured: boolean; tables: Array<{ table: string; ok: boolean; count: number | null; error: string | null }>; checkedAt: string };
type GoogleAdsHealth = { ok: boolean; configured: boolean; mode: string; env: { hasClientId: boolean; hasClientSecret: boolean; hasDeveloperToken: boolean; hasRefreshToken: boolean; hasLoginCustomerId: boolean; hasCustomerId: boolean }; checkedAt: string };
type MetaStatus = { ok: boolean; configured: boolean; mode: string; checkedAt: string };

function findTable(tables: TableResponse | null, name: string) {
  return tables?.tables.find((item) => item.table === name);
}

export default function DataHealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [clients, setClients] = useState<ClientsResponse | null>(null);
  const [tables, setTables] = useState<TableResponse | null>(null);
  const [googleAds, setGoogleAds] = useState<GoogleAdsHealth | null>(null);
  const [metaStatus, setMetaStatus] = useState<MetaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    setLoading(true);
    try {
      const [healthResponse, clientsResponse, tablesResponse, googleAdsResponse, metaResponse] = await Promise.all([
        fetch('/api/health/database', { cache: 'no-store' }),
        fetch('/api/admin/clients', { cache: 'no-store' }),
        fetch('/api/health/platform-tables', { cache: 'no-store' }),
        fetch('/api/google-ads/health', { cache: 'no-store' }),
        fetch('/api/meta-ads/status', { cache: 'no-store' })
      ]);
      setHealth(await healthResponse.json());
      setClients(await clientsResponse.json());
      setTables(await tablesResponse.json());
      setGoogleAds(await googleAdsResponse.json());
      setMetaStatus(await metaResponse.json());
    } catch {
      setHealth(null);
      setClients(null);
      setTables(null);
      setGoogleAds(null);
      setMetaStatus(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStatus(); }, []);

  const readyTables = tables?.tables.filter((item) => item.ok).length ?? 0;
  const totalTables = tables?.tables.length ?? 0;
  const seedReady = clients?.source === 'database' && (clients?.clients.length ?? 0) >= 3;

  const cards = [
    { label: 'Database ENV', value: health?.configured ? 'Configured' : 'Missing', note: health ? `Checked ${new Date(health.checkedAt).toLocaleString()}` : 'Waiting for health check.' },
    { label: 'Tables ready', value: `${readyTables}/${totalTables}`, note: tables?.ok ? 'Checked tables found.' : 'Run missing migrations if tables are missing.' },
    { label: 'Seed data', value: seedReady ? 'Loaded' : 'Missing', note: seedReady ? 'Demo clients found.' : 'Run migration 002 to add demo records.' },
    { label: 'Google Ads mode', value: googleAds?.configured ? 'Ready' : 'Mock', note: googleAds?.mode || 'Waiting for Google Ads check.' },
    { label: 'Meta Ads mode', value: metaStatus?.configured ? 'Ready' : 'Mock', note: metaStatus?.mode || 'Meta is mock-only right now.' },
    { label: 'AI directions', value: findTable(tables, 'ai_directions')?.ok ? 'Ready' : 'Check', note: 'Platform-aware after migration 004.' }
  ];

  return (
    <>
      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 28 }}>{loading ? 'Checking...' : card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Google Ads readiness</h2>
        <table style={tableStyle}>
          <tbody>
            <tr><td style={thTdStyle}>Connection mode</td><td style={thTdStyle}>{googleAds?.mode || 'Waiting for check'}</td></tr>
            <tr><td style={thTdStyle}>ad_snapshots</td><td style={thTdStyle}>{findTable(tables, 'ad_snapshots')?.ok ? 'Ready' : 'Missing / Error'}</td></tr>
            <tr><td style={thTdStyle}>ad_change_log</td><td style={thTdStyle}>{findTable(tables, 'ad_change_log')?.ok ? 'Ready' : 'Missing / Error'}</td></tr>
            <tr><td style={thTdStyle}>ad_performance_snapshots</td><td style={thTdStyle}>{findTable(tables, 'ad_performance_snapshots')?.ok ? 'Ready' : 'Missing / Error'}</td></tr>
          </tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Meta Ads readiness</h2>
        <table style={tableStyle}>
          <tbody>
            <tr><td style={thTdStyle}>Connection mode</td><td style={thTdStyle}>{metaStatus?.mode || 'mock_only'}</td></tr>
            <tr><td style={thTdStyle}>meta_ad_snapshots</td><td style={thTdStyle}>{findTable(tables, 'meta_ad_snapshots')?.ok ? 'Ready' : 'Missing / Error'}</td></tr>
            <tr><td style={thTdStyle}>meta_change_log</td><td style={thTdStyle}>{findTable(tables, 'meta_change_log')?.ok ? 'Ready' : 'Missing / Error'}</td></tr>
            <tr><td style={thTdStyle}>meta_performance_snapshots</td><td style={thTdStyle}>{findTable(tables, 'meta_performance_snapshots')?.ok ? 'Ready' : 'Missing / Error'}</td></tr>
          </tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Table-level checks</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Table</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Rows</th><th style={thTdStyle}>Error</th></tr></thead>
          <tbody>{(tables?.tables ?? []).map((row) => <tr key={row.table}><td style={thTdStyle}>{row.table}</td><td style={thTdStyle}>{row.ok ? 'Ready' : 'Missing / Error'}</td><td style={thTdStyle}>{row.count ?? '—'}</td><td style={thTdStyle}>{row.error || '—'}</td></tr>)}</tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Client records</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Name</th><th style={thTdStyle}>Market</th><th style={thTdStyle}>Status</th><th style={thTdStyle}>Source</th></tr></thead>
          <tbody>{(clients?.clients ?? []).map((client) => <tr key={client.id}><td style={thTdStyle}>{client.name}</td><td style={thTdStyle}>{client.market || '—'}</td><td style={thTdStyle}>{client.status || '—'}</td><td style={thTdStyle}>{clients?.source || 'unknown'}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
