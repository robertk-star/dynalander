import AdminShell from '../_components/AdminShell';
import ThemeEditor from './ThemeEditor';

export default function DynLanderThemesPage() {
  return (
    <AdminShell
      title="Theme Editor"
      subtitle="Edit seller-intent messages that would eventually control the landing page headline, CTA, form intro, FAQ, and chat opening message. Demo changes are local only."
    >
      <ThemeEditor />
    </AdminShell>
  );
}
