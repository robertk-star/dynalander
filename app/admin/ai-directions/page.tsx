import AdminShell from '../_components/AdminShell';
import AiDirectionsForm from './AiDirectionsForm';

export default function AiDirectionsPage() {
  return (
    <AdminShell
      title="AI Directions"
      subtitle="Set the rules AI should follow before evaluating Google Ads performance, budgets, landing pages, search terms, and recommendations."
    >
      <AiDirectionsForm />
    </AdminShell>
  );
}
