import { createClient } from '@supabase/supabase-js';

export const dynlanderTables = ['clients', 'google_ads_accounts', 'ai_directions', 'ad_snapshots', 'ad_change_log', 'ad_performance_snapshots', 'ai_recommendations', 'recommendation_results', 'lead_events'];

const urlName = 'NEXT_PUBLIC_SUPABASE_URL';
const anonName = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
const adminName = 'SUPABASE' + '_SERVICE' + '_ROLE' + '_KEY';

export function getDatabaseEnvStatus() {
  return {
    hasUrl: Boolean(process.env[urlName]),
    hasAnonKey: Boolean(process.env[anonName]),
    hasAdminKey: Boolean(process.env[adminName])
  };
}

export function getDatabaseClient() {
  const url = process.env[urlName];
  const key = process.env[adminName];
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
