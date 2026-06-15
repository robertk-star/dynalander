'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaLeadEvent() {
  useEffect(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: 'DynLander seller lead',
        content_category: 'Seller lead form'
      });
    }
  }, []);

  return null;
}
