'use client';

import { useEffect, useState } from 'react';
import { googleAdsAccounts } from '../_data/dynlanderAdminData';
import { activeAccountStorageKey, defaultGoogleLiveAccount, defaultMetaAccount, getAccountById, type AdminAccountOption } from './AdminAccountSelector';
import { useActivePlatform } from './useActivePlatform';
import { useMetaDataMode } from './useMetaDataMode';

export function useActiveAccount() {
  const { platform } = useActivePlatform();
  const { mode } = useMetaDataMode();
  const isMetaLive = platform === 'meta_ads' && mode === 'live';
  const isGoogle = platform === 'google_ads';
  const [accountId, setAccountId] = useState(googleAdsAccounts[0].id);
  const [metaAccount, setMetaAccount] = useState<AdminAccountOption>(defaultMetaAccount);
  const [googleLiveAccount, setGoogleLiveAccount] = useState<AdminAccountOption>(defaultGoogleLiveAccount);
  const accountOptions = isMetaLive ? [metaAccount] : isGoogle ? [googleLiveAccount] : (googleAdsAccounts as AdminAccountOption[]);

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

    async function loadGoogleAccount() {
      try {
        const response = await fetch('/api/google-ads/status', { cache: 'no-store' });
        const result = await response.json();
        const liveId = result?.customerId || 'GOOGLE_ADS_CUSTOMER_ID';
        const liveName = result?.account?.name || `Google Ads ${liveId}`;
        const market = result?.loginCustomerId ? `Google Ads · Manager ${result.loginCustomerId}` : 'Google Ads · Direct account';
        const nextAccount = { id: 'google-connected-account', name: liveName, customerId: liveId, market, source: 'google_live' as const };
        setGoogleLiveAccount(nextAccount);
        setAccountId(nextAccount.id);
        return;
      } catch {
        setGoogleLiveAccount(defaultGoogleLiveAccount);
        setAccountId(defaultGoogleLiveAccount.id);
      }
    }

    if (isMetaLive) {
      loadMetaAccount();
      return;
    }

    if (isGoogle) {
      loadGoogleAccount();
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
  }, [isMetaLive, isGoogle]);

  return {
    accountId,
    selectedAccount: getAccountById(accountId, accountOptions)
  };
}
