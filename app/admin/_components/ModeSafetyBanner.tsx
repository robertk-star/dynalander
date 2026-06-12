'use client';

import { useEffect, useState } from 'react';
import { cardStyle } from './adminStyles';

type AdsHealth = { configured?: boolean; mode?: string };
type DbHealth = { configured?: boolean };

export default function ModeSafetyBanner() {
  const [adsHealth, setAdsHealth] = useState<AdsHealth | null>(null);
  const [dbHealth, setDbHealth] = useState<DbHealth | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/google-ads/health', { cache: 'no-store' }).then((response) => response.json()).catch(() => null),
      fetch('/api/health/database', { cache: 'no-store' }).then((response) => response.json()).catch(() => null)
    ]).then(([ads, db]) => {
      setAdsHealth(ads);
      setDbHealth(db);
    });
  }, []);

  const liveReady = Boolean(adsHealth?.configured);
  const databaseReady = Boolean(dbHealth?.configured);

  return (
    <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed', marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <strong style={{ fontSize: 18 }}>Mode: {liveReady ? 'Live Read-Only Ready' : 'Mock / Test Mode'}</strong>
          <p style={{ color: '#475569', marginBottom: 0, lineHeight: 1.5 }}>
            Database: {databaseReady ? 'Ready' : 'Not ready'} · Live preview: {liveReady ? 'Available' : 'Not connected'} · Save live data: Disabled · Google Ads writes: Disabled
          </p>
        </div>
        <div style={{ fontWeight: 800, color: liveReady ? '#0f766e' : '#9a3412' }}>
          Preview required before save
        </div>
      </div>
    </section>
  );
}
