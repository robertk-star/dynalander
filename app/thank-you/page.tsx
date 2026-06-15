import Link from 'next/link';
import MetaLeadEvent from './MetaLeadEvent';

interface ThankYouPageProps {
  searchParams?: Promise<{
    theme?: string;
    city?: string;
    campaign?: string;
    keyword?: string;
    device?: string;
  }>;
}

function cleanValue(value?: string) {
  if (!value) return 'not provided';
  return value.replace(/\+/g, ' ').trim() || 'not provided';
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = (await searchParams) || {};
  const city = cleanValue(params.city);
  const theme = cleanValue(params.theme);
  const campaign = cleanValue(params.campaign);
  const keyword = cleanValue(params.keyword);
  const device = cleanValue(params.device);

  return (
    <main className="page-shell">
      <MetaLeadEvent />
      <nav className="marketing-nav">
        <div className="brand">
          <div className="brand-mark">DL</div>
          <div>
            <strong>Cash Offer Demo</strong>
            <br />
            <span>Request received</span>
          </div>
        </div>
        <div className="nav-links">
          <Link href="/">DynLander Home</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </nav>

      <section className="hero thank-you-hero">
        <div>
          <div className="pill">Thank you</div>
          <h1>Thanks — your request was received.</h1>
          <p>
            This page gives the landing page form a clear completion step after a visitor submits their information.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
            <Link className="button" href="/sell?theme=repairs&city=Plano">
              Test Another Landing Page
            </Link>
            <Link className="secondary-button" href="/admin">
              Open Admin
            </Link>
          </div>
        </div>

        <div className="card form-grid">
          <h2>Page details</h2>
          <p className="admin-note">
            These non-sensitive values were carried over from the landing page. Name and phone are not placed in the URL.
          </p>
          <p><strong>Theme:</strong> {theme}</p>
          <p><strong>City:</strong> {city}</p>
          <p><strong>Campaign:</strong> {campaign}</p>
          <p><strong>Keyword:</strong> {keyword}</p>
          <p><strong>Device:</strong> {device}</p>
        </div>
      </section>
    </main>
  );
}
