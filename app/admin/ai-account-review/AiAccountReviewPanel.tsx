'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, tableStyle, thTdStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';

type RangeKey = 'last_7d' | 'last_30d' | 'this_month' | 'last_month';

type ReviewItem = {
  name?: string;
  issue?: string;
  evidence?: string;
  recommendation?: string;
  priority?: string;
};

type Review = {
  overallGrade?: string;
  summary?: string;
  topProblems?: string[];
  topRecommendedChanges?: string[];
  budgetReview?: { status?: string; findings?: string[] };
  campaignReview?: ReviewItem[];
  adSetReview?: ReviewItem[];
  adReview?: ReviewItem[];
  audienceReview?: { status?: string; findings?: string[] };
  creativeReview?: { status?: string; findings?: string[] };
  whatToFixFirst?: string[];
};

type ApiData = {
  ok: boolean;
  error?: string;
  range?: RangeKey;
  aiConfigured?: boolean;
  aiError?: string | null;
  review: Review | null;
  dataSummary?: {
    campaignCount: number;
    adSetCount: number;
    adCount: number;
    campaignInsightRows: number;
    adSetInsightRows: number;
    adInsightRows: number;
  };
  warnings?: Record<string, string | null>;
  checkedAt?: string;
};

function BulletList({ items }: { items?: string[] }) {
  if (!items?.length) return <p style={{ color: '#64748b' }}>No findings returned.</p>;
  return <ul>{items.map((item, index) => <li key={`${item}-${index}`} style={{ marginBottom: 8 }}>{item}</li>)}</ul>;
}

function ReviewTable({ title, rows }: { title: string; rows?: ReviewItem[] }) {
  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <table style={tableStyle}>
        <thead><tr><th style={thTdStyle}>Item</th><th style={thTdStyle}>Issue</th><th style={thTdStyle}>Evidence</th><th style={thTdStyle}>Recommendation</th><th style={thTdStyle}>Priority</th></tr></thead>
        <tbody>
          {(rows || []).map((row, index) => (
            <tr key={`${title}-${index}`}>
              <td style={thTdStyle}>{row.name || '—'}</td>
              <td style={thTdStyle}>{row.issue || '—'}</td>
              <td style={thTdStyle}>{row.evidence || '—'}</td>
              <td style={thTdStyle}>{row.recommendation || '—'}</td>
              <td style={thTdStyle}>{row.priority || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows?.length ? <p style={{ color: '#64748b' }}>No review rows returned.</p> : null}
    </section>
  );
}

export default function AiAccountReviewPanel() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const [range, setRange] = useState<RangeKey>('last_30d');
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(false);

  async function runReview() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ accountKey: selectedAccount.customerId, range });
      const response = await fetch(`/api/meta-ads/ai-account-review?${params.toString()}`, { cache: 'no-store' });
      setData(await response.json());
    } catch {
      setData({ ok: false, error: 'AI Account Review request failed.', review: null });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (platform === 'meta_ads') runReview(); }, [platform, selectedAccount.customerId]);

  if (platform !== 'meta_ads') {
    return <section style={cardStyle}><h2 style={{ marginTop: 0 }}>AI Account Review</h2><p style={{ color: '#64748b' }}>Select Facebook / Meta Ads from the left sidebar to run an AI Account Review.</p></section>;
  }

  const review = data?.review;
  const warnings = data?.warnings || {};

  return (
    <>
      <section style={{ ...cardStyle, border: data?.ok ? '2px solid #0f766e' : '2px solid #f97316', background: data?.ok ? '#f0fdfa' : '#fff7ed' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>AI Account Review</h2>
            <p style={{ color: data?.ok ? '#0f766e' : '#9a3412', fontWeight: 800, lineHeight: 1.6, marginBottom: 0 }}>
              {data?.ok ? `Review complete for ${selectedAccount.name}.` : data?.error || `Not connected for ${selectedAccount.name}.`}
            </p>
            {data?.aiConfigured === false ? <p style={{ color: '#9a3412', fontWeight: 800 }}>AI key is not configured. Showing limited fallback review.</p> : null}
            {data?.aiError ? <p style={{ color: '#9a3412', fontWeight: 800 }}>AI warning: {data.aiError}</p> : null}
          </div>
          <button type="button" onClick={runReview} style={blueButtonStyle}>{loading ? 'Running review...' : 'Run AI review'}</button>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Review settings</h2>
        <label style={labelStyle}>Report range<select style={inputStyle} value={range} onChange={(event) => setRange(event.target.value as RangeKey)}><option value="last_7d">Last 7 days</option><option value="last_30d">Last 30 days</option><option value="this_month">This month</option><option value="last_month">Last month</option></select></label>
        <button type="button" onClick={runReview} style={{ ...blueButtonStyle, marginTop: 12 }}>{loading ? 'Running...' : 'Apply range and rerun'}</button>
      </section>

      {data?.dataSummary ? (
        <div style={gridStyle}>
          <div style={cardStyle}><div style={{ color: '#64748b' }}>Campaigns read</div><strong style={{ fontSize: 34 }}>{data.dataSummary.campaignCount}</strong></div>
          <div style={cardStyle}><div style={{ color: '#64748b' }}>Ad sets read</div><strong style={{ fontSize: 34 }}>{data.dataSummary.adSetCount}</strong></div>
          <div style={cardStyle}><div style={{ color: '#64748b' }}>Ads read</div><strong style={{ fontSize: 34 }}>{data.dataSummary.adCount}</strong></div>
          <div style={cardStyle}><div style={{ color: '#64748b' }}>Ad report rows</div><strong style={{ fontSize: 34 }}>{data.dataSummary.adInsightRows}</strong></div>
        </div>
      ) : null}

      {Object.values(warnings).filter(Boolean).length ? (
        <section style={{ ...cardStyle, borderColor: '#f97316', background: '#fff7ed' }}>
          <h3 style={{ marginTop: 0 }}>Data warnings</h3>
          {Object.entries(warnings).map(([key, value]) => value ? <p key={key} style={{ color: '#9a3412', fontWeight: 700 }}>{key}: {value}</p> : null)}
        </section>
      ) : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Overall Review</h2>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: '#dbeafe', border: '1px solid #2563eb', color: '#1d4ed8', borderRadius: 16, padding: '16px 22px', fontWeight: 900, fontSize: 34 }}>{review?.overallGrade || '—'}</div>
          <p style={{ color: '#334155', lineHeight: 1.6, maxWidth: 900 }}>{review?.summary || 'Run the review to see AI findings.'}</p>
        </div>
      </section>

      <div style={gridStyle}>
        <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Top Problems</h2><BulletList items={review?.topProblems} /></section>
        <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Recommended Changes</h2><BulletList items={review?.topRecommendedChanges} /></section>
        <section style={cardStyle}><h2 style={{ marginTop: 0 }}>What to Fix First</h2><BulletList items={review?.whatToFixFirst} /></section>
      </div>

      <div style={gridStyle}>
        <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Budget Review</h2><strong>{review?.budgetReview?.status || '—'}</strong><BulletList items={review?.budgetReview?.findings} /></section>
        <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Audience Review</h2><strong>{review?.audienceReview?.status || '—'}</strong><BulletList items={review?.audienceReview?.findings} /></section>
        <section style={cardStyle}><h2 style={{ marginTop: 0 }}>Creative Review</h2><strong>{review?.creativeReview?.status || '—'}</strong><BulletList items={review?.creativeReview?.findings} /></section>
      </div>

      <ReviewTable title="Campaign Review" rows={review?.campaignReview} />
      <ReviewTable title="Ad Set Review" rows={review?.adSetReview} />
      <ReviewTable title="Ad Review" rows={review?.adReview} />
    </>
  );
}
