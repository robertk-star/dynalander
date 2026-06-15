'use client';

import { useState } from 'react';
import { blueButtonStyle, cardStyle, inputStyle } from '../_components/adminStyles';

type ChatMessage = { role: 'user' | 'assistant'; text: string };

export default function ReviewChatBox({ data, accountName }: { data: any; accountName: string }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function askQuestion() {
    const trimmed = question.trim();
    if (!trimmed) return;

    setLoading(true);
    setQuestion('');
    setMessages((current) => [...current, { role: 'user', text: trimmed }]);

    try {
      const response = await fetch('/api/meta-ads/ai-review-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, context: { accountName, review: data?.review, dataSummary: data?.dataSummary, warnings: data?.warnings } })
      });
      const result = await response.json();
      setMessages((current) => [...current, { role: 'assistant', text: result.answer || 'No answer returned.' }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'Chat request failed.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Ask AI About This Review</h2>
      <p style={{ color: '#64748b' }}>Ask follow-up questions or give direction. Example: “Ignore paused ad sets and focus on active ad sets.”</p>
      <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} style={{ background: message.role === 'user' ? '#eff6ff' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, whiteSpace: 'pre-wrap' }}>
            <strong>{message.role === 'user' ? 'You' : 'AI'}:</strong> {message.text}
          </div>
        ))}
      </div>
      <textarea
        style={{ ...inputStyle, minHeight: 90 }}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Ask a question or give direction for this review..."
      />
      <button type="button" onClick={askQuestion} style={{ ...blueButtonStyle, marginTop: 12 }} disabled={loading}>{loading ? 'Asking...' : 'Ask AI'}</button>
    </section>
  );
}
