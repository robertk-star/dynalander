'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type HealthResponse = {
  ok: boolean;
  configured: boolean;
  env: {
    hasUrl: boolean;
    hasAnonKey: boolean;
    hasAdminKey: boolean;
  };
  checkedAt: string;
};

type ClientsResponse = {
  ok: boolean;
  source: string;
  clients: Array<{ id: string; name: string; market?: string; status?: string }>;
};

export default function DataHealthStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [clients, setClients] = useState<ClientsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    setLoading(true);
    try {
      const [healthResponse, clientsResponse] = await Promise.all([
        fetch('/api/health/database', { cache: 'no-store' }),
        fetch('/api/admin/clients', { cache: 'no-store' })
      ]);
      setHealth(await healthResponse.json());
      setClients(await clientsResponse.json());
    } catch {
      setHealth(null);
      setClients(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  const cards = [
    { label: 'Database ENV', value: health?.configured ? 'Configured' : 'Missing', note: health ? `Checked ${new Date(health.checkedAt).toLocaleString()}` : 'Waiting for health check.' },
    { label: 'Supabase URL', value: health?.env.hasUrl ? 'Found' : 'Missing', note: 'NEXT_PUBLIC_SUPABASE_URL' },
    { label: 'Anon key', value: health?.env.hasAnonKey ? 'Found' : 'Missing', note: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' },
    { label: 'Server admin key', value: health?.env.hasAdminKey ? 'Found' : 'Missing', note: 'Server-side only key check.' },
    { label: 'Client source', value: clients?.source || 'Unknown', note: clients?.ok ? 'Reading clients from database.' : 'Using mock fallback or unavailable.' },
    { label: 'Clients found', value: String(clients?.clients.length ?? 0), note: loading ? 'Loading...' : 'Client/account records available.' }
  ];

  return (
    <>
      <div style={gridStyle}>
        {cards.map((card) => (
          <div key={card.label} style={cardStyle}>
            <div style={{ color: '#64748b' }}>{card.label}</div>
            <strong style={{ fontSize: 28 }}>{loading ? 'Checking...' : card.value}</strong>
            <p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p>
          </div>
        ))}
      </div>

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
