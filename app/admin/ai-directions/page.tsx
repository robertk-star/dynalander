import AdminShell from '../_components/AdminShell';
import AiDirectionsForm from './AiDirectionsForm';

export default function AiDirectionsPage() {
  return (
    <AdminShell
      title="AI Directions"
      subtitle="Set platform-specific rules AI should follow before evaluating Google Ads or Facebook / Meta Ads performance, budgets, landing pages, creative, and recommendations."
    >
      <AiDirectionsForm />
    </AdminShell>
  );
}
