import { getMetaAdsAccountContext, getMetaAdsEnvStatus } from '../../../../lib/meta-ads/env';

export const dynamic = 'force-dynamic';

function safeString(value: unknown, fallback = ''): string {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  try { return JSON.stringify(value); } catch { return fallback; }
}

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

function fallbackAnswer(question: string) {
  return `I can see your question: "${question}". The AI chat needs OPENAI_API_KEY in Vercel before I can answer against the live Meta setup.`;
}

async function getLiveSetupContext(accountKey: string | null) {
  const env = getMetaAdsEnvStatus();
  const configured = normalizeAdAccountId(getMetaAdsAccountContext().adAccountId);
  const selected = normalizeAdAccountId(accountKey);

  if (!env.configured || !configured) return { ok: false, error: 'Meta ENV is not configured.' };
  if (selected && selected !== configured && selected !== 'act_meta-connected-account') return { ok: false, error: 'Selected active account does not match connected Meta account.' };

  const [account, campaigns, adSets, ads, insights] = await Promise.all([
    metaGet(configured, { fields: 'id,name,account_status,currency,timezone_name' }),
    metaGet(`${configured}/campaigns`, { fields: 'id,name,status,effective_status,objective,buying_type,daily_budget,lifetime_budget,bid_strategy', limit: '100' }),
    metaGet(`${configured}/adsets`, { fields: 'id,name,campaign_id,campaign{name},status,effective_status,daily_budget,lifetime_budget,bid_strategy,billing_event,optimization_goal,destination_type,targeting,promoted_object', limit: '100' }),
    metaGet(`${configured}/ads`, { fields: 'id,name,campaign_id,adset_id,status,effective_status,creative{id,name,title,body,object_story_spec,asset_feed_spec}', limit: '100' }),
    metaGet(`${configured}/insights`, { fields: 'campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,cpc,cpm,ctr,actions', level: 'ad', date_preset: 'last_30d', limit: '100' })
  ]);

  return {
    ok: true,
    account: account.json?.data || account.json,
    campaigns: campaigns.json?.data || [],
    adSets: adSets.json?.data || [],
    ads: ads.json?.data || [],
    adInsightsLast30d: insights.json?.data || [],
    warnings: {
      account: account.response.ok ? null : account.json?.error?.message,
      campaigns: campaigns.response.ok ? null : campaigns.json?.error?.message,
      adSets: adSets.response.ok ? null : adSets.json?.error?.message,
      ads: ads.response.ok ? null : ads.json?.error?.message,
      insights: insights.response.ok ? null : insights.json?.error?.message
    }
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const body = await request.json().catch(() => ({}));
  const question = safeString(body.question).trim();
  const reviewContext = body.context || {};
  const accountKey = safeString(body.accountKey || body.context?.adAccountId || body.context?.accountKey).trim();

  if (!question) return Response.json({ ok: false, answer: 'Type a question or instruction first.' });
  if (!apiKey) return Response.json({ ok: true, aiConfigured: false, answer: fallbackAnswer(question) });

  const setupContext = await getLiveSetupContext(accountKey || null);
  const prompt = `You are answering questions about a Meta Ads account inside DynLander.

STRICT RULES:
1. Do not guess, infer, assume, or improvise missing setup information.
2. Only state setup details that appear in the live setup context JSON.
3. If a setup field is not present, say "Not returned by Meta".
4. If you compare two campaigns, ad sets, or ads, compare only exact returned fields: objective, status, effective_status, budget, bid_strategy, billing_event, optimization_goal, destination_type, promoted_object, targeting, creative fields, CTA, destination URL, and report metrics.
5. If the user asks about "setup", answer setup first and performance second.
6. Do not say "likely", "probably", "may be", or "appears" unless you clearly label it as an inference.
7. Do not invent audience names, placements, budgets, URLs, CTAs, objectives, or optimization settings.
8. If the data is insufficient, say exactly what data is missing.
9. Be read-only. Never claim you changed Meta Ads.

Response format:
- Direct answer
- Confirmed from Meta
- Not returned by Meta / cannot confirm
- Performance context, if relevant
- Recommended next step

User question:
${question}

Live setup context JSON:
${JSON.stringify(setupContext).slice(0, 45000)}

Current AI review context JSON:
${JSON.stringify(reviewContext).slice(0, 15000)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        { role: 'system', content: 'You answer only from provided Meta Ads data. Missing fields must be reported as not returned. Do not guess.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) return Response.json({ ok: false, aiConfigured: true, answer: json?.error?.message || 'AI chat request failed.' });

  return Response.json({ ok: true, aiConfigured: true, answer: json?.choices?.[0]?.message?.content || 'No answer returned.' });
}
