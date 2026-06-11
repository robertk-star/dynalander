'use client';

import { useMemo, useState } from 'react';
import { blueButtonStyle, cardStyle, gridStyle, inputStyle, labelStyle, twoColumnStyle } from '../_components/adminStyles';
import { dynlanderThemes } from '../_data/dynlanderAdminData';

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
    <div style={twoColumnStyle}>
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
            <label style={labelStyle}>Keyword ValueTrack<input style={inputStyle} value={keyword} onChange={(e) => setKeyword(e.target.value)} /></label>
            <label style={labelStyle}>Device ValueTrack<input style={inputStyle} value={device} onChange={(e) => setDevice(e.target.value)} /></label>
            <label style={labelStyle}>Match Type ValueTrack<input style={inputStyle} value={matchtype} onChange={(e) => setMatchtype(e.target.value)} /></label>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Final URL</h2>
        <textarea readOnly style={{ ...inputStyle, minHeight: 160, fontFamily: 'monospace' }} value={finalUrl} />
        <div style={{ height: 12 }} />
        <a href={finalUrl.replace('https://dynlander.com', '')} style={blueButtonStyle}>Preview Local Page</a>
        <p style={{ color: '#64748b' }}>In production, this URL would be copied into Google Ads as the final URL.</p>
      </section>
    </div>
  );
}
