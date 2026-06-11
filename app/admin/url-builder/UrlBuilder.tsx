'use client';

import { useMemo, useState } from 'react';
import { dynlanderThemes } from '../../../lib/dynlanderAdminData';
import { cardStyle, gridStyle, inputStyle, labelStyle } from '../../../components/dynlander-admin/AdminShell';

export default function UrlBuilder() {
  const [baseUrl, setBaseUrl] = useState('https://dynlander.com/sell');
  const [theme, setTheme] = useState('repairs');
  const [city, setCity] = useState('Plano');
  const [campaign, setCampaign] = useState('as-is-repairs');
  const [keyword, setKeyword] = useState('{keyword}');
  const [device, setDevice] = useState('{device}');
  const [matchtype, setMatchtype] = useState('{matchtype}');

  const finalUrl = useMemo(() => {
    const params = new URLSearchParams({
      theme,
      city,
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: campaign,
      keyword,
      device,
      matchtype
    });
    return `${baseUrl}?${params.toString()}`;
  }, [baseUrl, theme, city, campaign, keyword, device, matchtype]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Build URL</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          <label style={labelStyle}>Landing Page URL<input style={inputStyle} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} /></label>
          <div style={gridStyle}>
            <label style={labelStyle}>Seller Theme<select style={inputStyle} value={theme} onChange={(e) => setTheme(e.target.value)}>{dynlanderThemes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <label style={labelStyle}>City<input style={inputStyle} value={city} onChange={(e) => setCity(e.target.value)} /></label>
          </div>
          <label style={labelStyle}>Campaign<input style={inputStyle} value={campaign} onChange={(e) => setCampaign(e.target.value)} /></label>
          <div style={gridStyle}>
            <label style={labelStyle}>Keyword<input style={inputStyle} value={keyword} onChange={(e) => setKeyword(e.target.value)} /></label>
            <label style={labelStyle}>Device<input style={inputStyle} value={device} onChange={(e) => setDevice(e.target.value)} /></label>
            <label style={labelStyle}>Match Type<input style={inputStyle} value={matchtype} onChange={(e) => setMatchtype(e.target.value)} /></label>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Final URL</h2>
        <textarea readOnly value={finalUrl} style={{ ...inputStyle, minHeight: 170, fontFamily: 'monospace' }} />
        <p style={{ color: '#64748b' }}>Copy this into Google Ads as the final URL for an ad or ad group. The landing page can read these parameters and change the page message.</p>
        <a href={finalUrl.replace('https://dynlander.com', '')} style={{ display: 'inline-block', background: '#2563eb', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '12px 16px', fontWeight: 700 }}>Preview local URL</a>
      </section>
    </div>
  );
}
