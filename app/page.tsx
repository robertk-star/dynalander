const demoUrls = [
  '/sell?theme=fast&city=Plano&utm_source=google&utm_medium=cpc&utm_campaign=fast-sale',
  '/sell?theme=repairs&city=Frisco&utm_source=google&utm_medium=cpc&utm_campaign=as-is-repairs',
  '/sell?theme=inherited&city=Dallas&utm_source=google&utm_medium=cpc&utm_campaign=inherited-house',
  '/sell?theme=foreclosure&city=McKinney&utm_source=google&utm_medium=cpc&utm_campaign=foreclosure-options',
  '/sell?theme=landlord&city=Fort%20Worth&utm_source=google&utm_medium=cpc&utm_campaign=tired-landlord'
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <nav className="marketing-nav">
        <div className="brand">
          <div className="brand-mark">DL</div>
          <div>
            <strong>DynLander</strong>
            <br />
            <span>Dynamic landing pages + Google Ads intelligence</span>
          </div>
        </div>
        <div className="nav-links">
          <a href="/admin">Admin</a>
          <a href="/admin/google-ads">Google Ads Dashboard</a>
          <a href="/sell?theme=repairs&city=Plano">View Demo Page</a>
        </div>
      </nav>

      <section className="hero">
        <div>
          <div className="pill">Phase 1 Next.js Build</div>
          <h1>Match every home-buyer ad click to the right landing page.</h1>
          <p>
            DynLander changes the page message based on seller intent, city, campaign,
            keyword, and Google Ads tracking values. The admin dashboard will grow into
            the AI control center for ads, leads, budgets, extensions, and landing page results.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <a className="button" href="/admin">Open Admin</a>
            <a className="secondary-button" href="/sell?theme=repairs&city=Plano">Test Landing Page</a>
          </div>
        </div>

        <div className="card">
          <h2>What Phase 1 includes</h2>
          <div className="form-grid">
            <p>Public dynamic landing page</p>
            <p>Admin dashboard shell</p>
            <p>Seller-intent theme data</p>
            <p>Google Ads intelligence placeholder</p>
            <p>URL builder and lead dashboard</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Demo seller-intent URLs</h2>
        <div className="grid two">
          {demoUrls.map((url) => (
            <a className="info-card" href={url} key={url}>
              <strong>{url}</strong>
              <p className="admin-note">Click to see the headline, form, FAQ, and chat opener change.</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
