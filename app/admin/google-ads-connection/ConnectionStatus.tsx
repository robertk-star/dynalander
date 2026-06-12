'use client';

import { useEffect, useState } from 'react';
import { cardStyle, gridStyle, tableStyle, thTdStyle } from '../_components/adminStyles';

type GoogleAdsHealth = {
  ok: boolean;
  configured: boolean;
  mode: string;
  env: {
    hasClientId: boolean;
    hasClientSecret: boolean;
    hasDeveloperToken: boolean;
    hasRefreshToken: boolean;
    hasLoginCustomerId: boolean;
    hasCustomerId: boolean;
  };
  checkedAt: string;
};

type Readiness = {
  ok: boolean;
  mode: string;
  checks: Array<{ key: string; label: string; ok: boolean }>;
  counts: { clients: number; aiDirections: number };
  checkedAt: string;
};

export default function ConnectionStatus() {
  const [health, setHealth] = useState<GoogleAdsHealth | null>(null);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [healthResponse, readinessResponse] = await Promise.all([
        fetch('/api/google-ads/health', { cache: 'no-store' }),
        fetch('/api/google-ads/live-readiness', { cache: 'no-store' })
      ]);
      setHealth(await healthResponse.json());
      setReadiness(await readinessResponse.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const cards = [
    { label: 'Google Ads status', value: health?.configured ? 'Ready' : 'Not connected', note: health?.mode || 'Checking...' },
    { label: 'Access mode', value: 'Read only', note: 'DynLander will not change ads, budgets, keywords, or campaigns.' },
    { label: 'Live readiness', value: readiness?.ok ? 'Ready' : 'Not ready', note: readiness ? `Checked ${new Date(readiness.checkedAt).toLocaleString()}` : 'Checking...' },
    { label: 'Client records', value: String(readiness?.counts.clients ?? 0), note: 'Database client records available.' },
    { label: 'AI Directions', value: String(readiness?.counts.aiDirections ?? 0), note: 'Guardrail records available.' },
    { label: 'Write actions', value: 'Disabled', note: 'No Google Ads mutation endpoints exist in this phase.' }
  ];

  return (
    <>
      <section style={{ ...cardStyle, border: '2px solid #16a34a', background: '#f0fdf4' }}>
        <h2 style={{ marginTop: 0 }}>Read-only safety notice</h2>
        <p style={{ color: '#166534', fontWeight: 800, lineHeight: 1.6 }}>
          DynLander is currently READ ONLY. It will not change campaigns, ads, budgets, keywords, sitelinks, callouts, or bid strategies.
        </p>
      </section>

      <div style={gridStyle}>{cards.map((card) => <div key={card.label} style={cardStyle}><div style={{ color: '#64748b' }}>{card.label}</div><strong style={{ fontSize: 28 }}>{loading ? 'Checking...' : card.value}</strong><p style={{ color: '#64748b', marginBottom: 0 }}>{card.note}</p></div>)}</div>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Google Ads credential readiness</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Credential piece</th><th style={thTdStyle}>Status</th></tr></thead>
          <tbody>
            <tr><td style={thTdStyle}>Client ID</td><td style={thTdStyle}>{health?.env.hasClientId ? 'Found' : 'Missing'}</td></tr>
            <tr><td style={thTdStyle}>Client Secret</td><td style={thTdStyle}>{health?.env.hasClientSecret ? 'Found' : 'Missing'}</td></tr>
            <tr><td style={thTdStyle}>Developer Token</td><td style={thTdStyle}>{health?.env.hasDeveloperToken ? 'Found' : 'Missing'}</td></tr>
            <tr><td style={thTdStyle}>Refresh Token</td><td style={thTdStyle}>{health?.env.hasRefreshToken ? 'Found' : 'Missing'}</td></tr>
            <tr><td style={thTdStyle}>Login Customer ID</td><td style={thTdStyle}>{health?.env.hasLoginCustomerId ? 'Found' : 'Optional / Missing'}</td></tr>
            <tr><td style={thTdStyle}>Customer ID</td><td style={thTdStyle}>{health?.env.hasCustomerId ? 'Found' : 'Missing'}</td></tr>
          </tbody>
        </table>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Live readiness checklist</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thTdStyle}>Check</th><th style={thTdStyle}>Status</th></tr></thead>
          <tbody>{(readiness?.checks ?? []).map((check) => <tr key={check.key}><td style={thTdStyle}>{check.label}</td><td style={thTdStyle}>{check.ok ? 'Ready' : 'Needs attention'}</td></tr>)}</tbody>
        </table>
      </section>
    </>
  );
}
