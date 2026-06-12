'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type HealthResponse = { ok: boolean; configured: boolean; env: { hasUrl: boolean; hasAnonKey: boolean; hasAdminKey: boolean }; checkedAt: string };
type ClientsResponse = { ok: boolean; source: string; clients: Array<{ id: string; name: string; market?: string; status?: string }> };
type TableResponse = { ok: boolean; configured: boolean; tables: Array<{ table: string; ok: boolean; count: number | null; error: string | null }>; checkedAt: string };

export default function DataHealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [clients, setClients] = useState<ClientsResponse | null>(null);
  const [tables, setTables] = useState<TableResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    setLoading(true);
    try {
      const [healthResponse, clientsResponse, tablesResponse] = await Promise.all([
        fetch('/api/health/database', { cache: 'no-store' }),
        fetch('/api/admin/clients', { cache: 'no-store' }),
        fetch('/api/health/database/tables', { cache: 'no-store' })
      ]);
      setHealth(await healthResponse.json());
      setClients(await clientsResponse.json());
      setTables(await tablesResponse.json());
    } catch {
      setHealth(null);
      setClients(null);
      setTables(null);
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
    { label: 'URL configured', value: health?.env.hasUrl ? 'Found' : 'Missing', note: 'Project database URL setting.' },
    { label: 'Anon key', value: health?.env.hasAnonKey ? 'Found' : 'Missing', note: 'Public database client key.' },
    { label: 'Server key', value: health?.env.hasAdminKey ? 'Found' : 'Missing', note: 'Server-only database key.' },
    { label: 'Tables ready', value: `${readyTables}/${totalTables}`, note: tables?.ok ? 'All required tables found.' : 'Run migration 001 if tables are missing.' },
    { label: 'Seed data', value: seedReady ? 'Loaded' : 'Missing', note: seedReady ? 'Demo clients found.' : 'Run migration 002 to add demo records.' }
  ];

  return (
    <>
      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 28 }}>{loading ? 'Checking...' : card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

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
