import { getDatabaseClient } from '../../../../lib/supabase/server';
import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

function normalizeAdAccountId(value: string | null) { if (!value) return null; return value.startsWith('act_') ? value : `act_${value}`; }

function chicagoDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return { year: Number(parts.find((part) => part.type === 'year')?.value || '0'), month: Number(parts.find((part) => part.type === 'month')?.value || '0'), day: Number(parts.find((part) => part.type === 'day')?.value || '0') };
}

function shiftDate(parts: { year: number; month: number; day: number }, days: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days, 12));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

function dateText(parts: { year: number; month: number; day: number }) { return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`; }

function performanceRanges(detectedAt: string) {
  const detected = chicagoDateParts(new Date(detectedAt));
  return { before: { since: dateText(shiftDate(detected, -7)), until: dateText(shiftDate(detected, -1)) }, after: { since: dateText(shiftDate(detected, 1)), until: dateText(shiftDate(detected, 7)) } };
}

function leadCount(row: any) {
  const actions = Array.isArray(row?.actions) ? row.actions : [];
  return actions.filter((action: any) => action.action_type === 'lead').reduce((sum: number, action: any) => sum + Number(action.value || 0), 0);
}

function money(value: number) { return `$${Number(value || 0).toFixed(2)}`; }
function numberText(value: number) { return Number(value || 0).toLocaleString(); }
function percent(value: number) { return `${Number(value || 0).toFixed(2)}%`; }

function summarize(row: any, range: { since: string; until: string }) {
  const spend = Number(row?.spend || 0);
  const impressions = Number(row?.impressions || 0);
  const clicks = Number(row?.clicks || 0);
  const results = leadCount(row);
  const costPerResultNumber = results ? spend / results : null;
  return { since: range.since, until: range.until, spend: money(spend), spendNumber: spend, results: numberText(results), resultsNumber: results, costPerResult: costPerResultNumber === null ? '—' : money(costPerResultNumber), costPerResultNumber, impressions: numberText(impressions), clicks: numberText(clicks), clicksNumber: clicks, ctr: percent(Number(row?.ctr || 0)), ctrNumber: Number(row?.ctr || 0), cpc: money(Number(row?.cpc || 0)), cpm: money(Number(row?.cpm || 0)) };
}

function verdict(performance: any) {
  const before = performance?.before;
  const after = performance?.after;
  if (!before || !after) return { verdict: 'Not enough data', reason: 'Performance window was not returned by Meta.' };
  if (after.spendNumber === 0 && after.resultsNumber === 0 && after.clicksNumber === 0) return { verdict: 'Keep watching', reason: 'The after window does not have enough activity yet.' };
  if (before.resultsNumber === 0 && after.resultsNumber > 0) return { verdict: 'Helped', reason: 'Leads appeared after the change when the before window had none.' };
  if (before.resultsNumber > 0 && after.resultsNumber === 0 && after.spendNumber > 0) return { verdict: 'Hurt', reason: 'The after window spent money but produced no leads.' };
  if (before.costPerResultNumber && after.costPerResultNumber) {
    const improvement = (before.costPerResultNumber - after.costPerResultNumber) / before.costPerResultNumber;
    const leadChange = after.resultsNumber - before.resultsNumber;
    if (improvement >= 0.15 && leadChange >= 0) return { verdict: 'Helped', reason: 'Cost per lead improved by at least 15% and lead volume did not drop.' };
    if (improvement <= -0.15 && after.spendNumber > 0) return { verdict: 'Hurt', reason: 'Cost per lead worsened by at least 15% after the change.' };
  }
  if (after.resultsNumber > before.resultsNumber && after.spendNumber >= before.spendNumber * 0.8) return { verdict: 'Helped', reason: 'Lead volume increased without a major spend drop.' };
  return { verdict: 'Keep watching', reason: 'The before/after data is mixed or too close to call.' };
}

async function metaGet(path: string, params: Record<string, string>) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const token = process.env[env.requiredNames.accessToken];
  const url = new URL(`https://graph.facebook.com/${context.apiVersion}/${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  if (token) url.searchParams.set('access_token', token);
  const response = await fetch(url.toString(), { cache: 'no-store' });
  const json = await response.json().catch(() => ({}));
  return { response, json };
}

async function readPerformance(entityId: string, detectedAt: string) {
  const ranges = performanceRanges(detectedAt);
  const fields = 'spend,impressions,clicks,cpc,cpm,ctr,actions';
  const [beforeResult, afterResult] = await Promise.all([metaGet(`${entityId}/insights`, { fields, time_range: JSON.stringify(ranges.before) }), metaGet(`${entityId}/insights`, { fields, time_range: JSON.stringify(ranges.after) })]);
  const beforeRow = beforeResult.json?.data?.[0] || null;
  const afterRow = afterResult.json?.data?.[0] || null;
  const performance = { before: summarize(beforeRow, ranges.before), after: summarize(afterRow, ranges.after), warning: beforeResult.response.ok && afterResult.response.ok ? null : beforeResult.json?.error?.message || afterResult.json?.error?.message || 'Could not read performance window.' };
  return { ...performance, verdict: verdict(performance) };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const accountKey = url.searchParams.get('accountKey') || 'act_meta-connected-account';
  const configured = normalizeAdAccountId(getMetaAdsAccountContext().adAccountId);
  const selected = normalizeAdAccountId(accountKey);
  const db = getDatabaseClient();
  const env = getMetaAdsEnvStatus();

  if (!env.configured || !configured) return Response.json({ ok: false, error: 'Meta ENV is not configured.', changes: [], snapshotCount: 0, lastSnapshotAt: null });
  if (selected && selected !== configured && selected !== 'act_meta-connected-account') return Response.json({ ok: false, error: 'Selected active account does not match connected Meta account.', changes: [], snapshotCount: 0, lastSnapshotAt: null });
  if (!db) return Response.json({ ok: false, error: 'Database is not configured.', changes: [], snapshotCount: 0, lastSnapshotAt: null });

  const [{ data: changes, error: changesError }, { count, error: countError }, { data: latest, error: latestError }] = await Promise.all([
    db.from('meta_live_change_events').select('id,entity_level,entity_id,entity_name,parent_campaign_name,parent_ad_set_name,field_name,old_value,new_value,change_importance,change_source,detected_at,snapshot_run_id').eq('account_key', accountKey).order('detected_at', { ascending: false }).limit(50),
    db.from('meta_live_snapshots').select('id', { count: 'exact', head: true }).eq('account_key', accountKey),
    db.from('meta_live_snapshots').select('snapshot_at').eq('account_key', accountKey).order('snapshot_at', { ascending: false }).limit(1)
  ]);

  const error = changesError || countError || latestError;
  if (error) return Response.json({ ok: false, error: error.message, changes: [], snapshotCount: 0, lastSnapshotAt: null }, { status: 500 });

  const rows = changes || [];
  const withPerformance = await Promise.all(rows.map(async (row: any, index: number) => {
    if (index >= 20) return { ...row, performance: null, performanceWarning: 'Performance window shown for the 20 most recent changes only.', verdict: { verdict: 'Not enough data', reason: 'Performance window not loaded for this older change.' } };
    try {
      const performance = await readPerformance(row.entity_id, row.detected_at);
      return { ...row, performance, verdict: performance.verdict };
    } catch (performanceError: any) {
      return { ...row, performance: null, performanceWarning: performanceError?.message || 'Could not read performance window.', verdict: { verdict: 'Not enough data', reason: performanceError?.message || 'Could not read performance window.' } };
    }
  }));

  return Response.json({ ok: true, source: 'live_meta_change_history_phase_4', changes: withPerformance, snapshotCount: count || 0, lastSnapshotAt: latest?.[0]?.snapshot_at || null });
}
