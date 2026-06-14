'use client';

import { useEffect, useState } from 'react';
import { cardStyle } from './adminStyles';
import { useActivePlatform } from './useActivePlatform';
import { useMetaDataMode } from './useMetaDataMode';

type AdsHealth = { configured?: boolean; mode?: string };
type DbHealth = { configured?: boolean };

export default function ModeSafetyBanner() {
  const { platform, platformLabel } = useActivePlatform();
  const { mode } = useMetaDataMode();
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

  const googleReady = Boolean(adsHealth?.configured);
  const isMeta = platform === 'meta_ads';
  const metaLive = isMeta && mode === 'live';
  const liveReady = isMeta ? metaLive : googleReady;
  const databaseReady = Boolean(dbHealth?.configured);
  const modeLabel = isMeta ? (metaLive ? 'Meta Live Read-Only Mode' : 'Meta Demo / Mock Mode') : liveReady ? 'Google Live Read-Only Ready' : 'Google Mock / Test Mode';
  const writeLabel = isMeta ? 'Meta writes: Disabled' : 'Google Ads writes: Disabled';
  const livePreviewLabel = isMeta ? (metaLive ? 'Available' : 'Demo only') : liveReady ? 'Available' : 'Not connected';

  return (
    <section style={{ ...cardStyle, border: liveReady ? '2px solid #0f766e' : '2px solid #f97316', background: liveReady ? '#f0fdfa' : '#fff7ed', marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <strong style={{ fontSize: 18 }}>Platform: {platformLabel} · Mode: {modeLabel}</strong>
          <p style={{ color: '#475569', marginBottom: 0, lineHeight: 1.5 }}>
            Database: {databaseReady ? 'Ready' : 'Not ready'} · Live preview: {livePreviewLabel} · Save live data: Disabled · {writeLabel}
          </p>
        </div>
        <div style={{ fontWeight: 800, color: liveReady ? '#0f766e' : '#9a3412' }}>
          Preview required before save
        </div>
      </div>
    </section>
  );
}
