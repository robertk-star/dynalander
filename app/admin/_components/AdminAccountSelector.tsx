'use client';

import { useEffect, useState } from 'react';
import { googleAdsAccounts } from '../_data/dynlanderAdminData';

export const activeAccountStorageKey = 'dynlander-active-account';

export function getAccountById(accountId: string) {
  return googleAdsAccounts.find((account) => account.id === accountId) || googleAdsAccounts[0];
}

export default function AdminAccountSelector() {
  const [accountId, setAccountId] = useState(googleAdsAccounts[0].id);
  const selectedAccount = getAccountById(accountId);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(activeAccountStorageKey);
    if (savedValue && googleAdsAccounts.some((account) => account.id === savedValue)) {
      setAccountId(savedValue);
    }
  }, []);

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
          {googleAdsAccounts.map((account) => (
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
