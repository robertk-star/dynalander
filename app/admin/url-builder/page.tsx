import AdminShell from '../../../components/dynlander-admin/AdminShell';
import UrlBuilder from './UrlBuilder';

export default function DynLanderUrlBuilderPage() {
  return (
    <AdminShell
      title="Google Ads URL Builder"
      subtitle="Build final URLs that pass seller intent, city, campaign, keyword, device, and match type into the dynamic landing page."
    >
      <UrlBuilder />
    </AdminShell>
  );
}
