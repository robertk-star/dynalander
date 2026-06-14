'use client';

import { useEffect, useState } from 'react';
import { googleAdsAccounts } from '../_data/dynlanderAdminData';
import { activeAccountStorageKey, defaultMetaAccount, getAccountById, type AdminAccountOption } from './AdminAccountSelector';
import { useActivePlatform } from './useActivePlatform';

export function useActiveAccount() {
  const { platform } = useActivePlatform();
  const isMeta = platform === 'meta_ads';
  const [accountId, setAccountId] = useState(googleAdsAccounts[0].id);
  const [metaAccount, setMetaAccount] = useState<AdminAccountOption>(defaultMetaAccount);
  const accountOptions = isMeta ? [metaAccount] : (googleAdsAccounts as AdminAccountOption[]);

  useEffect(() => {
    async function loadMetaAccount() {
      try {
        const response = await fetch('/api/meta-ads/status', { cache: 'no-store' });
        const result = await response.json();
        const liveName = result?.account?.name || 'Connected Meta Account';
        const liveId = result?.adAccountId || 'META_AD_ACCOUNT_ID';
        const currency = result?.account?.currency || 'Meta Ads';
        const timezone = result?.account?.timezone_name || '';
        const nextAccount = { id: 'meta-connected-account', name: liveName, customerId: liveId, market: `${currency}${timezone ? ` · ${timezone}` : ''}`, source: 'meta_live' as const };
        setMetaAccount(nextAccount);
        setAccountId(nextAccount.id);
        return;
      } catch {
        setMetaAccount(defaultMetaAccount);
        setAccountId(defaultMetaAccount.id);
      }
    }

    if (isMeta) {
      loadMetaAccount();
      return;
    }

    const savedAccount = window.localStorage.getItem(activeAccountStorageKey);
    if (savedAccount && googleAdsAccounts.some((account) => account.id === savedAccount)) {
      setAccountId(savedAccount);
    } else {
      setAccountId(googleAdsAccounts[0].id);
    }

    function handleAccountChange(event: Event) {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail) {
        setAccountId(customEvent.detail);
      }
    }

    window.addEventListener('dynlander-active-account-change', handleAccountChange);
    return () => window.removeEventListener('dynlander-active-account-change', handleAccountChange);
  }, [isMeta]);

  return {
    accountId,
    selectedAccount: getAccountById(accountId, accountOptions)
  };
}
