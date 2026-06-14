'use client';

import { useActivePlatform } from './useActivePlatform';
import ChangeHistoryPanel from '../change-history/ChangeHistoryPanel';
import MetaActiveAccountContext from '../change-history/MetaActiveAccountContext';

export default function PlatformHistoryRouter() {
  const { platform } = useActivePlatform();
  return platform === 'meta_ads' ? <MetaActiveAccountContext /> : <ChangeHistoryPanel />;
}
