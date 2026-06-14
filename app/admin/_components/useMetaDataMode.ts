'use client';

import { useEffect, useState } from 'react';

export type MetaDataMode = 'live' | 'demo';

export const metaDataModeStorageKey = 'dynlander-meta-data-mode';

export function useMetaDataMode() {
  const [mode, setModeState] = useState<MetaDataMode>('live');

  useEffect(() => {
    const saved = window.localStorage.getItem(metaDataModeStorageKey) as MetaDataMode | null;
    if (saved === 'live' || saved === 'demo') setModeState(saved);

    function handleChange(event: Event) {
      const next = (event as CustomEvent<MetaDataMode>).detail;
      if (next === 'live' || next === 'demo') setModeState(next);
    }

    window.addEventListener('dynlander-meta-data-mode-change', handleChange);
    return () => window.removeEventListener('dynlander-meta-data-mode-change', handleChange);
  }, []);

  function setMode(next: MetaDataMode) {
    setModeState(next);
    window.localStorage.setItem(metaDataModeStorageKey, next);
    window.dispatchEvent(new CustomEvent('dynlander-meta-data-mode-change', { detail: next }));
  }

  return { mode, isLive: mode === 'live', isDemo: mode === 'demo', setMode };
}
