'use client';

import { useEffect, useState } from 'react';

export type AdPlatform = 'google_ads' | 'meta_ads';

export const platformStorageKey = 'dynlander-active-platform';

export const platformLabels: Record<AdPlatform, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Facebook / Meta Ads'
};

export function useActivePlatform() {
  const [platform, setPlatformState] = useState<AdPlatform>('google_ads');

  useEffect(() => {
    const saved = window.localStorage.getItem(platformStorageKey) as AdPlatform | null;
    if (saved === 'google_ads' || saved === 'meta_ads') setPlatformState(saved);

    function handleChange(event: Event) {
      const next = (event as CustomEvent<AdPlatform>).detail;
      if (next === 'google_ads' || next === 'meta_ads') setPlatformState(next);
    }

    window.addEventListener('dynlander-platform-change', handleChange);
    return () => window.removeEventListener('dynlander-platform-change', handleChange);
  }, []);

  function setPlatform(next: AdPlatform) {
    setPlatformState(next);
    window.localStorage.setItem(platformStorageKey, next);
    window.dispatchEvent(new CustomEvent('dynlander-platform-change', { detail: next }));
  }

  return { platform, platformLabel: platformLabels[platform], setPlatform };
}
