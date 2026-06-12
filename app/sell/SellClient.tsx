'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { dynlanderThemes } from '../admin/_data/dynlanderAdminData';

function cleanCity(value: string | null) {
  if (!value) return 'your area';
  return value.replace(/\+/g, ' ').trim() || 'your area';
}

export default function SellClient() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const themeId = searchParams.get('theme') || 'fast';
  const city = cleanCity(searchParams.get('city'));
  const campaign = searchParams.get('utm_campaign') || 'demo-campaign';
  const keyword = searchParams.get('keyword') || '{keyword}';
  const device = searchParams.get('device') || '{device}';

  const theme = useMemo(() => {
    return dynlanderThemes.find((item) => item.id === themeId) || dynlanderThemes[0];
  }, [themeId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const headline = theme.headline.replace('{city}', city);

  return (
    <main className="page-shell">
      <nav className="marketing-nav">
        <div className="brand">
          <div className="brand-mark">DL</div>
          <div>
            <strong>Cash Offer Demo</strong>
            <br />
            <span>Powered by DynLander</span>
          </div>
        </div>
        <div className="nav-links">
          <a href="/">DynLander Home</a>
          <a href="/admin">Admin</a>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="pill">Seller Intent: {theme.label}</div>
          <h1>{headline}</h1>
          <p>{theme.subheadline}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <a className="button" href="#lead-form">{theme.cta}</a>
            <a className="secondary-button" href="#how-it-works">How it works</a>
          </div>
          <p style={{ fontSize: 14, marginTop: 18 }}>
            Tracking: theme={theme.id}, city={city}, campaign={campaign}, keyword={keyword}, device={device}
          </p>
        </div>

        <form className="card form-grid" id="lead-form" onSubmit={handleSubmit}>
          <h2>Tell us about the house</h2>
          <p className="admin-note">{theme.formIntro}</p>
          <label>
            Name
            <input name="name" placeholder="Your name" required />
          </label>
          <label>
            Phone
            <input name="phone" placeholder="Best phone number" required />
          </label>
          <label>
            Property city
            <input name="property_city" defaultValue={city === 'your area' ? '' : city} placeholder="City" />
          </label>
          <label>
            Situation
            <select name="reason" defaultValue={theme.id}>
              {dynlanderThemes.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <button className="full-button" type="submit">{theme.cta}</button>
          {submitted ? <p className="admin-note">Demo lead captured. In production this will save to the database with the ad tracking values.</p> : null}
        </form>
      </section>

      <section className="section grid two" id="how-it-works">
        <div className="info-card">
          <h2>A page that matches the ad click</h2>
          <p>
            Someone who clicks an as-is repair ad sees repair-focused copy. Someone
            who clicks an inherited-house ad sees inherited-property copy. This keeps
            the ad message and landing page aligned.
          </p>
        </div>
        <div className="info-card">
          <h2>What changes</h2>
          <p>Headline, subheadline, CTA, form intro, FAQ, chat opener, and lead tracking values.</p>
        </div>
      </section>

      <section className="section">
        <h2>Questions sellers often ask</h2>
        <div className="grid three">
          <div className="info-card">
            <h3>Do I have to accept the offer?</h3>
            <p>{theme.faq1}</p>
          </div>
          <div className="info-card">
            <h3>Do I need to make repairs?</h3>
            <p>No. The property can be reviewed as-is.</p>
          </div>
          <div className="info-card">
            <h3>How fast can this move?</h3>
            <p>The buyer can review the property and discuss the timeline that works for your situation.</p>
          </div>
        </div>
      </section>

      <aside className="chat-preview">
        <strong>AI Seller Assistant</strong>
        <p>{theme.chatOpening}</p>
      </aside>
    </main>
  );
}
