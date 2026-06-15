import AdminShell from '../_components/AdminShell';
import MetaAiChatPanel from './MetaAiChatPanel';

export default function MetaAiChatPage() {
  return (
    <AdminShell title="AI Account Chat" subtitle="Ask questions about the connected Meta account and save useful responses.">
      <MetaAiChatPanel />
    </AdminShell>
  );
}
