'use client';

import { useEffect, useState } from 'react';
import { googleAdsAccounts } from '../_data/dynlanderAdminData';
import { activeAccountStorageKey, getAccountById } from './AdminAccountSelector';

export function useActiveAccount() {
  const [accountId, setAccountId] = useState(googleAdsAccounts[0].id);

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

  return {
    accountId,
    selectedAccount: getAccountById(accountId)
  };
}
