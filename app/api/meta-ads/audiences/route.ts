import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

type AudienceUsage = {
  adSetId: string;
  adSetName: string;
  campaignId: string;
  campaignName: string;
  status: string;
  effectiveStatus: string;
  useType: string;
};

function normalizeAdAccountId(value: string | null) {
  if (!value) return null;
  return value.startsWith('act_') ? value : `act_${value}`;
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

function statusRawValue(value: any) {
  if (!value) return null;
  if (typeof value === 'object') return value.code ?? value.status ?? value.description ?? JSON.stringify(value);
  return value;
}

function normalizeAudienceStatus(value: any) {
  const raw = statusRawValue(value);
  const text = raw === null || raw === undefined || raw === '' ? '—' : String(raw);
  if (text === '200') return { label: 'Ready', tone: 'ready', raw: text };
  if (text === '300') return { label: 'Blocked', tone: 'blocked', raw: text };
  if (text.toLowerCase().includes('ready')) return { label: 'Ready', tone: 'ready', raw: text };
  if (text.toLowerCase().includes('block') || text.toLowerCase().includes('disable') || text.toLowerCase().includes('error')) return { label: 'Blocked', tone: 'blocked', raw: text };
  return { label: text, tone: 'neutral', raw: text };
}

function audienceStatus(row: any) {
  const delivery = normalizeAudienceStatus(row.delivery_status);
  if (delivery.label !== '—') return delivery;

  const operation = normalizeAudienceStatus(row.operation_status);
  if (operation.label !== '—') return operation;

  return normalizeAudienceStatus(row.status);
}

function formatSize(row: any) {
  const size = row.size;
  if (size === undefined || size === null || size === '') return 'Not returned by Meta';
  return Number(size || 0).toLocaleString();
}

function collectAudienceRefs(value: any, useType: string, output: Array<{ id: string; useType: string }>) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectAudienceRefs(item, useType, output));
    return;
  }
  if (typeof value !== 'object') return;

  if (value.id) output.push({ id: String(value.id), useType });
  if (value.audience_id) output.push({ id: String(value.audience_id), useType });

  Object.entries(value).forEach(([key, nested]) => {
    if (key === 'custom_audiences') collectAudienceRefs(nested, 'Included custom audience', output);
    if (key === 'excluded_custom_audiences') collectAudienceRefs(nested, 'Excluded custom audience', output);
    if (key === 'lookalike_audiences') collectAudienceRefs(nested, 'Lookalike audience', output);
    if (key === 'flexible_spec') collectAudienceRefs(nested, 'Included flexible targeting', output);
    if (key === 'exclusions') collectAudienceRefs(nested, 'Excluded targeting', output);
  });
}

function mapAudiences(rows: any[], type: string, usageById: Map<string, AudienceUsage[]>) {
  return rows.map((row) => {
    const status = audienceStatus(row);
    return {
      id: row.id || '—',
      name: row.name || '—',
      type,
      subtype: row.subtype || row.audience_subtype || '—',
      status: status.label,
      statusTone: status.tone,
      statusRaw: status.raw,
      size: formatSize(row),
      description: row.description || '—',
      created: row.creation_time || '—',
      updated: row.update_time || '—',
      retentionDays: row.retention_days || '—',
      source: row.customer_file_source || row.data_source?.type || row.data_source?.sub_type || '—',
      usage: usageById.get(String(row.id)) || []
    };
  });
}

export async function GET(request: Request) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const url = new URL(request.url);
  const selected = normalizeAdAccountId(url.searchParams.get('accountKey') || url.searchParams.get('adAccountId'));
  const configured = normalizeAdAccountId(context.adAccountId);

  if (!env.configured || !configured) {
    return Response.json({ ok: false, error: 'Meta ENV is not configured.', audiences: [], checkedAt: new Date().toISOString() });
  }

  if (selected && selected !== configured && selected !== 'act_meta-connected-account') {
    return Response.json({ ok: false, error: 'Selected active account does not match connected Meta account.', selected, configured, audiences: [], checkedAt: new Date().toISOString() });
  }

  const adSetFields = 'id,name,status,effective_status,campaign_id,campaign{name},targeting';
  const audienceFields = 'id,name,subtype,description,delivery_status,operation_status,permission_for_actions,customer_file_source,data_source,retention_days,creation_time,update_time';
  const savedAudienceFields = 'id,name,subtype,description,delivery_status,operation_status,permission_for_actions,creation_time,update_time';

  const [customAudienceResult, savedAudienceResult, adSetResult] = await Promise.all([
    metaGet(`${configured}/customaudiences`, { fields: audienceFields, limit: '500' }),
    metaGet(`${configured}/saved_audiences`, { fields: savedAudienceFields, limit: '500' }),
    metaGet(`${configured}/adsets`, { fields: adSetFields, limit: '500' })
  ]);

  const usageById = new Map<string, AudienceUsage[]>();
  const adSets = adSetResult.json?.data || [];
  adSets.forEach((adSet: any) => {
    const refs: Array<{ id: string; useType: string }> = [];
    collectAudienceRefs(adSet.targeting, 'Targeting', refs);
    refs.forEach((ref) => {
      const list = usageById.get(ref.id) || [];
      list.push({
        adSetId: adSet.id || '—',
        adSetName: adSet.name || '—',
        campaignId: adSet.campaign_id || '—',
        campaignName: adSet.campaign?.name || '—',
        status: adSet.status || '—',
        effectiveStatus: adSet.effective_status || '—',
        useType: ref.useType
      });
      usageById.set(ref.id, list);
    });
  });

  const customAudiences = customAudienceResult.response.ok ? mapAudiences(customAudienceResult.json?.data || [], 'Custom / Lookalike Audience', usageById) : [];
  const savedAudiences = savedAudienceResult.response.ok ? mapAudiences(savedAudienceResult.json?.data || [], 'Saved Audience', usageById) : [];

  return Response.json({
    ok: customAudienceResult.response.ok || savedAudienceResult.response.ok,
    adAccountId: configured,
    audiences: [...customAudiences, ...savedAudiences],
    adSetUsageRowsRead: adSets.length,
    warnings: {
      customAudiences: customAudienceResult.response.ok ? null : customAudienceResult.json?.error?.message || 'Could not read custom audiences.',
      savedAudiences: savedAudienceResult.response.ok ? null : savedAudienceResult.json?.error?.message || 'Could not read saved audiences.',
      adSets: adSetResult.response.ok ? null : adSetResult.json?.error?.message || 'Could not read ad set targeting usage.'
    },
    checkedAt: new Date().toISOString()
  });
}
