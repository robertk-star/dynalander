'use client';

import { useEffect, useState } from 'react';
import { googleAdsAccounts } from '../_data/dynlanderAdminData';
import { activeAccountStorageKey, getAccountById } from './AdminAccountSelector';

export default function ActiveAccountBanner() {
  const [accountId, setAccountId] = useState(googleAdsAccounts[0].id);
  const selectedAccount = getAccountById(accountId);

  useEffect(() => {
    const savedAccount = window.localStorage.getItem(activeAccountStorageKey);
    if (savedAccount && googleAdsAccounts.some((account) => account.id === savedAccount)) {
      setAccountId(savedAccount);
    }

    function handleAccountChange(event: Event) {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) {
        setAccountId(customEvent.detail);
      }
    }

    window.addEventListener('dynlander-active-account-change', handleAccountChange);
    return () => window.removeEventListener('dynlander-active-account-change', handleAccountChange);
  }, []);

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
          Market: {selectedAccount.market} | Google Ads ID: {selectedAccount.customerId}
        </div>
      </div>
      <div style={{ color: '#1d4ed8', fontWeight: 800, fontSize: 13 }}>
        Change client from the left sidebar
      </div>
    </div>
  );
}
