'use client';

import { useActivePlatform } from './useActivePlatform';
import { useActiveAccount } from './useActiveAccount';

export default function ActiveAccountBanner() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const isMeta = platform === 'meta_ads';

  return (
    <div style={{
      border: '1px solid #bfdbfe',
      background: '#eff6ff',
      color: '#172033',
      borderRadius: 14,
      padding: '12px 14px',
      marginBottom: 18,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    }}>
      <div>
        <strong>Working in: {selectedAccount.name}</strong>
        <div style={{ color: '#475569', fontSize: 13, marginTop: 3 }}>
          {isMeta ? `Meta Ads Account: ${selectedAccount.customerId}` : `Market: ${selectedAccount.market} | Google Ads ID: ${selectedAccount.customerId}`}
        </div>
      </div>
      <div style={{ color: '#1d4ed8', fontWeight: 800, fontSize: 13 }}>
        Change client from the left sidebar
      </div>
    </div>
  );
}
