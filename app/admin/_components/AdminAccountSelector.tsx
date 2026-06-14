'use client';

import { useEffect, useMemo, useState } from 'react';
import { googleAdsAccounts } from '../_data/dynlanderAdminData';
import { useActivePlatform } from './useActivePlatform';
import { useMetaDataMode } from './useMetaDataMode';

export const activeAccountStorageKey = 'dynlander-active-account';

export type AdminAccountOption = {
  id: string;
  name: string;
  customerId: string;
  market: string;
  source?: 'google_demo' | 'meta_live' | 'meta_demo';
};

export const defaultMetaAccount: AdminAccountOption = {
  id: 'meta-connected-account',
  name: 'Connected Meta Account',
  customerId: 'META_AD_ACCOUNT_ID',
  market: 'Facebook / Meta Ads',
  source: 'meta_live'
};

export function getAccountById(accountId: string, accounts: AdminAccountOption[] = googleAdsAccounts as AdminAccountOption[]) {
  return accounts.find((account) => account.id === accountId) || accounts[0] || defaultMetaAccount;
}

export default function AdminAccountSelector() {
  const { platform } = useActivePlatform();
  const { mode } = useMetaDataMode();
  const isMeta = platform === 'meta_ads';
  const isMetaLive = isMeta && mode === 'live';
  const [metaAccount, setMetaAccount] = useState<AdminAccountOption>(defaultMetaAccount);
  const demoOptions = googleAdsAccounts as AdminAccountOption[];
  const accountOptions = useMemo(() => isMetaLive ? [metaAccount] : demoOptions, [isMetaLive, metaAccount, demoOptions]);
  const [accountId, setAccountId] = useState(accountOptions[0].id);
  const selectedAccount = getAccountById(accountId, accountOptions);

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
        window.localStorage.setItem(activeAccountStorageKey, nextAccount.id);
        window.dispatchEvent(new CustomEvent('dynlander-active-account-change', { detail: nextAccount.id }));
      } catch {
        setMetaAccount(defaultMetaAccount);
        setAccountId(defaultMetaAccount.id);
      }
    }

    if (isMetaLive) {
      loadMetaAccount();
      return;
    }

    const savedValue = window.localStorage.getItem(activeAccountStorageKey);
    if (savedValue && demoOptions.some((account) => account.id === savedValue)) {
      setAccountId(savedValue);
    } else {
      setAccountId(demoOptions[0].id);
    }
  }, [isMetaLive, demoOptions]);

  function updateAccount(nextAccountId: string) {
    setAccountId(nextAccountId);
    window.localStorage.setItem(activeAccountStorageKey, nextAccountId);
    window.dispatchEvent(new CustomEvent('dynlander-active-account-change', { detail: nextAccountId }));
  }

  return (
    <div style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: 12, marginBottom: 18, background: 'rgba(255,255,255,0.06)' }}>
      <label style={{ display: 'grid', gap: 8, color: '#dbeafe', fontSize: 12, fontWeight: 800 }}>
        Active Client Account
        <select
          value={accountId}
          onChange={(event) => updateAccount(event.target.value)}
          style={{ width: '100%', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 9px', background: '#fff', color: '#172033', fontWeight: 700 }}
        >
          {accountOptions.map((account) => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>
      </label>
      <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.4, marginTop: 9 }}>
        <strong style={{ color: '#fff' }}>{selectedAccount.customerId}</strong><br />
        {selectedAccount.market}
      </div>
    </div>
  );
}
