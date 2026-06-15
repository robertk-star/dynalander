'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, inputStyle, labelStyle, tableStyle, thTdStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';

function isMissing(value?: string) {
  return !value || value === '—' || value === 'Not returned by Meta';
}

function clean(value?: string) {
  return value || 'Not returned by Meta';
}

function makeRows(item: any) {
  const t = item?.adSet?.targeting || {};
  const c = item?.creative || {};
  return [
    ['Name', clean(item?.name), clean(item?.name), false],
    ['Status', clean(item?.effectiveStatus || item?.status), item?.effectiveStatus === 'ACTIVE' ? 'Keep watching' : 'Check delivery', item?.effectiveStatus !== 'ACTIVE'],
    ['Campaign', clean(item?.campaign?.name), clean(item?.campaign?.name), false],
    ['Objective', clean(item?.campaign?.objective), clean(item?.campaign?.objective), false],
    ['Ad set', clean(item?.adSet?.name), clean(item?.adSet?.name), false],
    ['Primary text', clean(c.primaryText), isMissing(c.primaryText) ? 'Review source text' : 'Keep / compare later', isMissing(c.primaryText)],
    ['Headline', clean(c.headline), isMissing(c.headline) ? 'Review source headline' : 'Keep / compare later', isMissing(c.headline)],
    ['Description', clean(c.description), isMissing(c.description) ? 'Add short support line if available' : 'Keep if matched to page', isMissing(c.description)],
    ['CTA', clean(c.cta), isMissing(c.cta) ? 'Confirm CTA' : 'Keep if matched to page', isMissing(c.cta)],
    ['URL', clean(c.destinationUrl), isMissing(c.destinationUrl) ? 'Confirm final URL' : 'Keep if correct', isMissing(c.destinationUrl)],
    ['Image', c.imageUrl ? 'Returned' : 'Not returned', c.imageUrl ? 'Review visually' : 'Confirm media', !c.imageUrl],
    ['Format', clean(c.format), clean(c.format), false],
    ['Daily budget', clean(item?.adSet?.dailyBudget), clean(item?.adSet?.dailyBudget), false],
    ['Goal', clean(item?.adSet?.optimizationGoal), clean(item?.adSet?.optimizationGoal), false],
    ['Bid strategy', clean(item?.adSet?.bidStrategy), clean(item?.adSet?.bidStrategy), false],
    ['Ages', `${t.ageMin || '—'} - ${t.ageMax || '—'}`, `${t.ageMin || '—'} - ${t.ageMax || '—'}`, false],
    ['Location', clean(t.countries || t.regions || t.cities), clean(t.countries || t.regions || t.cities), false],
    ['Audience', t.customAudienceCount ? (t.customAudiences || []).join(', ') : 'None returned', t.customAudienceCount ? 'Keep separated for testing' : 'Review setup', !t.customAudienceCount]
  ];
}

function Rows({ rows, side }: { rows: any[]; side: 'left' | 'right' }) {
  return <table style={tableStyle}><tbody>{rows.map((row) => {
    const mark = side === 'right' && row[3];
    const style = mark ? { ...thTdStyle, background: '#ffedd5', borderLeft: '4px solid #f97316' } : thTdStyle;
    return <tr key={row[0]}><td style={style}>{row[0]}</td><td style={style}>{side === 'left' ? row[1] : row[2]}</td></tr>;
  })}</tbody></table>;
}

export default function Panel2() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const [data, setData] = useState<any>(null);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    if (platform !== 'meta_ads') return;
    setLoading(true);
    try {
      const res = await fetch(`/api/meta-ads/ad-reviewer-setup?accountKey=${encodeURIComponent(selectedAccount.customerId)}`, { cache: 'no-store' });
      const json = await res.json();
      setData(json);
      if (!selectedId && json?.ads?.[0]?.id) setSelectedId(json.ads[0].id);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [platform, selectedAccount.customerId]);

  if (platform !== 'meta_ads') return <section style={cardStyle}>Select Facebook / Meta Ads.</section>;
  const items = data?.ads || [];
  const item = items.find((x: any) => x.id === selectedId) || items[0];
  const rows = item ? makeRows(item) : [];

  return <>
    <section style={cardStyle}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}><div><h2 style={{ marginTop: 0 }}>Ad Reviewer</h2><p>{data?.ok ? `Loaded ${items.length} item(s).` : data?.error || 'Waiting for data.'}</p></div><button type="button" onClick={load} style={blueButtonStyle}>{loading ? 'Refreshing...' : 'Refresh'}</button></div></section>
    {data?.adDiscovery ? <section style={{ ...cardStyle, background: '#eff6ff' }}>Discovery: {data.adDiscovery.mergedCount ?? items.length} unique item(s)</section> : null}
    <section style={cardStyle}><label style={labelStyle}>Select item<select style={inputStyle} value={item?.id || ''} onChange={(e) => setSelectedId(e.target.value)}>{items.map((x: any) => <option key={x.id} value={x.id}>{x.name || x.id}</option>)}</select></label></section>
    {item ? <section style={twoColumnStyle}><div style={cardStyle}><h2 style={{ marginTop: 0 }}>Current setup</h2>{item.creative?.imageUrl ? <img src={item.creative.imageUrl} alt="Creative" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 12 }} /> : null}<Rows rows={rows} side="left" /></div><div style={{ ...cardStyle, background: '#eff6ff', border: '1px solid #bfdbfe' }}><h2 style={{ marginTop: 0 }}>Suggested setup</h2>{item.creative?.imageUrl ? <img src={item.creative.imageUrl} alt="Creative" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', border: '1px solid #bfdbfe', borderRadius: 12, marginBottom: 12 }} /> : null}<Rows rows={rows} side="right" /></div></section> : <section style={cardStyle}>No items available.</section>}
  </>;
}
