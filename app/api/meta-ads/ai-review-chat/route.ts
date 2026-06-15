export const dynamic = 'force-dynamic';

function safeString(value: unknown, fallback = ''): string {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  try { return JSON.stringify(value); } catch { return fallback; }
}

function fallbackAnswer(question: string) {
  return `I can see your question: "${question}". The AI chat needs OPENAI_API_KEY in Vercel before I can answer against the live review context.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const body = await request.json().catch(() => ({}));
  const question = safeString(body.question).trim();
  const context = body.context || {};

  if (!question) {
    return Response.json({ ok: false, answer: 'Type a question or instruction first.' });
  }

  if (!apiKey) {
    return Response.json({ ok: true, aiConfigured: false, answer: fallbackAnswer(question) });
  }

  const prompt = `You are helping review a Meta Ads account inside DynLander. Answer the user's question using the current AI review context. Be direct, practical, and read-only. Do not claim you changed Meta Ads. If the user asks what to do, give clear next steps. Prioritize active campaigns, active ad sets, and active ads over paused history.\n\nUser question:\n${question}\n\nCurrent review context:\n${JSON.stringify(context).slice(0, 35000)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a concise Meta Ads performance strategist. You only provide advice. You never claim to make account changes.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    return Response.json({ ok: false, aiConfigured: true, answer: json?.error?.message || 'AI chat request failed.' });
  }

  return Response.json({ ok: true, aiConfigured: true, answer: json?.choices?.[0]?.message?.content || 'No answer returned.' });
}
