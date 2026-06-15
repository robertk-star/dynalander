import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

type RangeKey = 'last_7d' | 'last_30d' | 'this_month' | 'last_month';

type AiReviewResult = { aiConfigured: boolean; aiError: string | null; review: any };

function normalizeAdAccountId(value: string | null) {
  if (!value) return null;
  return value.startsWith('act_') ? value : `act_${value}`;
}

function datePreset(range: RangeKey) {
  if (range === 'last_7d') return 'last_7d';
  if (range === 'this_month') return 'this_month';
  if (range === 'last_month') return 'last_month';
  return 'last_30d';
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

function leadCount(row: any) {
  const actions = Array.isArray(row.actions) ? row.actions : [];
  return actions.filter((a: any) => a.action_type === 'lead').reduce((sum: number, a: any) => sum + Number(a.value || 0), 0);
}

function moneyNumber(value: string | number | undefined) {
  return Number(value || 0);
}

function isActiveStatus(row: any) {
  return String(row.effective_status || row.status || '').toUpperCase() === 'ACTIVE';
}

function compactInsightRows(rows: any[], limit = 100) {
  return rows.slice(0, limit).map((row) => ({
    ...row,
    spend_number: moneyNumber(row.spend),
    lead_results: leadCount(row)
  }));
}

function compactAdSet(adSet: any) {
  return {
    id: adSet.id,
    name: adSet.name,
    campaign_id: adSet.campaign_id,
    campaign_name: adSet.campaign?.name,
    status: adSet.status,
    effective_status: adSet.effective_status,
    daily_budget: adSet.daily_budget,
    lifetime_budget: adSet.lifetime_budget,
    billing_event: adSet.billing_event,
    optimization_goal: adSet.optimization_goal,
    destination_type: adSet.destination_type,
    bid_strategy: adSet.bid_strategy,
    targeting: adSet.targeting
  };
}

function compactAd(ad: any) {
  const creative = ad.creative || {};
  const spec = creative.object_story_spec || {};
  const linkData = spec.link_data || {};
  const videoData = spec.video_data || {};
  return {
    id: ad.id,
    name: ad.name,
    campaign_id: ad.campaign_id,
    adset_id: ad.adset_id,
    status: ad.status,
    effective_status: ad.effective_status,
    creative: {
      id: creative.id,
      name: creative.name,
      primary_text: linkData.message || videoData.message || creative.body,
      headline: linkData.name || videoData.title || creative.title,
      description: linkData.description,
      cta: linkData.call_to_action?.type || videoData.call_to_action?.type,
      destination_url: linkData.link || videoData.call_to_action?.value?.link
    }
  };
}

function fallbackReview(payload: any, reason: string) {
  const activeAdSetIds = new Set((payload?.adSetsActive || []).map((row: any) => row.id));
  const ads = payload?.insights?.ads || [];
  const spendNoLeads = ads
    .filter((row: any) => activeAdSetIds.has(row.adset_id))
    .filter((row: any) => Number(row.spend_number || 0) > 0 && Number(row.lead_results || 0) === 0)
    .slice(0, 5)
    .map((row: any) => `${row.ad_name || row.ad_id} spent $${Number(row.spend_number || 0).toFixed(2)} with 0 leads.`);

  const activeAdSetReview = (payload?.adSetsActive || []).map((adSet: any) => ({
    name: adSet.name,
    category: 'Active ad set',
    issue: 'Active ad set included in review.',
    evidence: `Status: ${adSet.effective_status || adSet.status || 'unknown'}. Optimization: ${adSet.optimization_goal || 'not returned'}.`,
    whyItMatters: 'Active ad sets are where current budget and delivery decisions matter most.',
    recommendation: 'Review performance, targeting, and optimization before making budget changes.',
    suggestedNextStep: 'Compare spend, leads, and cost per lead for this active ad set.',
    riskLevel: 'Medium',
    expectedImpact: 'Better budget decisions on active delivery.',
    priority: 'Medium',
    priorityScore: 5
  }));

  return {
    overallGrade: spendNoLeads.length ? 'C' : 'B',
    summary: `Limited review only. ${reason}`,
    topProblems: spendNoLeads.length ? spendNoLeads : ['No basic active spend-without-leads issue found in the limited review.'],
    topRecommendedChanges: spendNoLeads.length ? ['Review active ads spending with no leads before increasing budget.'] : ['Run the full AI review for deeper setup and creative recommendations.'],
    budgetReview: { status: spendNoLeads.length ? 'Needs review' : 'Good', findings: spendNoLeads },
    campaignReview: [],
    adSetReview: activeAdSetReview,
    adReview: [],
    audienceReview: { status: 'Needs review', findings: ['Full audience review requires AI output.'] },
    creativeReview: { status: 'Needs review', findings: ['Full creative review requires AI output.'] },
    evidenceBasedRecommendations: activeAdSetReview,
    whatToFixFirst: spendNoLeads.length ? ['Review active spend with no leads.'] : ['Review active ad set performance before paused ad set history.']
  };
}

function buildPrompt(payload: any) {
  return `Review this Meta Ads lead-generation account. Return JSON only.

Important rules:
- Focus first on ACTIVE campaigns, ACTIVE ad sets, and ACTIVE ads.
- Do not let paused ad sets dominate the review. Paused items are historical context only.
- If a paused ad set performed badly, mention it only as a historical learning, not as the main fix.
- Review every active ad set in adSetReview. If an active ad set looks okay, say that no urgent change is needed and cite the evidence.
- Use evidence from the data. Each review row should include name, category, issue, evidence, whyItMatters, recommendation, suggestedNextStep, riskLevel, expectedImpact, priority, and priorityScore from 1 to 10.
- Include evidenceBasedRecommendations with the highest priority active-account findings.

JSON keys: overallGrade, summary, topProblems, topRecommendedChanges, budgetReview, campaignReview, adSetReview, adReview, audienceReview, creativeReview, evidenceBasedRecommendations, whatToFixFirst.

Data: ${JSON.stringify(payload).slice(0, 45000)}`;
}

async function runAiReview(payload: any): Promise<AiReviewResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) return { aiConfigured: false, aiError: null, review: fallbackReview(payload, 'OPENAI_API_KEY is not configured.') };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You review Meta Ads account data and return valid JSON only. Prioritize active ad sets over paused history.' },
        { role: 'user', content: buildPrompt(payload) }
      ]
    })
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) return { aiConfigured: true, aiError: json?.error?.message || 'AI request failed.', review: fallbackReview(payload, 'AI request failed.') };

  const content = json?.choices?.[0]?.message?.content || '{}';
  try {
    return { aiConfigured: true, aiError: null, review: JSON.parse(content) };
  } catch {
    return { aiConfigured: true, aiError: 'AI response was not valid JSON.', review: fallbackReview(payload, 'AI response was not valid JSON.') };
  }
}

export async function GET(request: Request) {
  const env = getMetaAdsEnvStatus();
  const context = getMetaAdsAccountContext();
  const url = new URL(request.url);
  const selected = normalizeAdAccountId(url.searchParams.get('accountKey') || url.searchParams.get('adAccountId'));
  const configured = normalizeAdAccountId(context.adAccountId);
  const range = (url.searchParams.get('range') || 'last_30d') as RangeKey;
  const preset = datePreset(range);

  if (!env.configured || !configured) return Response.json({ ok: false, error: 'Meta ENV is not configured.', review: null });
  if (selected && selected !== configured && selected !== 'act_meta-connected-account') return Response.json({ ok: false, error: 'Selected active account does not match connected Meta account.', review: null });

  const [accountResult, campaignResult, adSetResult, adResult, campaignInsightsResult, adSetInsightsResult, adInsightsResult] = await Promise.all([
    metaGet(configured, { fields: 'id,name,account_status,currency,timezone_name,amount_spent' }),
    metaGet(`${configured}/campaigns`, { fields: 'id,name,status,effective_status,objective,buying_type,daily_budget,lifetime_budget,bid_strategy,created_time,updated_time', limit: '100' }),
    metaGet(`${configured}/adsets`, { fields: 'id,name,campaign_id,campaign{name},status,effective_status,daily_budget,lifetime_budget,bid_strategy,billing_event,optimization_goal,destination_type,targeting,created_time,updated_time', limit: '100' }),
    metaGet(`${configured}/ads`, { fields: 'id,name,campaign_id,adset_id,status,effective_status,creative{id,name,title,body,object_story_spec},created_time,updated_time', limit: '100' }),
    metaGet(`${configured}/insights`, { fields: 'campaign_id,campaign_name,spend,impressions,clicks,cpc,cpm,ctr,reach,frequency,actions', level: 'campaign', date_preset: preset, limit: '100' }),
    metaGet(`${configured}/insights`, { fields: 'campaign_id,campaign_name,adset_id,adset_name,spend,impressions,clicks,cpc,cpm,ctr,reach,frequency,actions', level: 'adset', date_preset: preset, limit: '100' }),
    metaGet(`${configured}/insights`, { fields: 'campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,cpc,cpm,ctr,reach,frequency,actions', level: 'ad', date_preset: preset, limit: '100' })
  ]);

  if (!accountResult.response.ok) return Response.json({ ok: false, error: accountResult.json?.error?.message || 'Could not read Meta account.', review: null });

  const campaigns = campaignResult.json?.data || [];
  const adSets = (adSetResult.json?.data || []).map(compactAdSet);
  const ads = (adResult.json?.data || []).map(compactAd);

  const payload = {
    datePreset: preset,
    account: accountResult.json,
    campaigns,
    campaignsActive: campaigns.filter(isActiveStatus),
    campaignsPausedOrInactive: campaigns.filter((row: any) => !isActiveStatus(row)),
    adSets,
    adSetsActive: adSets.filter(isActiveStatus),
    adSetsPausedOrInactive: adSets.filter((row: any) => !isActiveStatus(row)),
    ads,
    adsActive: ads.filter(isActiveStatus),
    adsPausedOrInactive: ads.filter((row: any) => !isActiveStatus(row)),
    insights: {
      campaigns: compactInsightRows(campaignInsightsResult.json?.data || []),
      adSets: compactInsightRows(adSetInsightsResult.json?.data || []),
      ads: compactInsightRows(adInsightsResult.json?.data || [])
    }
  };

  const ai = await runAiReview(payload);

  return Response.json({
    ok: true,
    source: 'meta_ai_account_review_active_focus',
    adAccountId: configured,
    range,
    aiConfigured: ai.aiConfigured,
    aiError: ai.aiError,
    review: ai.review,
    dataSummary: {
      campaignCount: payload.campaigns.length,
      activeCampaignCount: payload.campaignsActive.length,
      adSetCount: payload.adSets.length,
      activeAdSetCount: payload.adSetsActive.length,
      adCount: payload.ads.length,
      activeAdCount: payload.adsActive.length,
      campaignInsightRows: payload.insights.campaigns.length,
      adSetInsightRows: payload.insights.adSets.length,
      adInsightRows: payload.insights.ads.length
    },
    warnings: {
      campaigns: campaignResult.response.ok ? null : campaignResult.json?.error?.message || 'Could not read campaigns.',
      adSets: adSetResult.response.ok ? null : adSetResult.json?.error?.message || 'Could not read ad sets.',
      ads: adResult.response.ok ? null : adResult.json?.error?.message || 'Could not read ads.',
      campaignInsights: campaignInsightsResult.response.ok ? null : campaignInsightsResult.json?.error?.message || 'Could not read campaign insights.',
      adSetInsights: adSetInsightsResult.response.ok ? null : adSetInsightsResult.json?.error?.message || 'Could not read ad set insights.',
      adInsights: adInsightsResult.response.ok ? null : adInsightsResult.json?.error?.message || 'Could not read ad insights.'
    },
    checkedAt: new Date().toISOString()
  });
}
