'use client';

import { useEffect, useState } from 'react';
import { blueButtonStyle, cardStyle, inputStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { useActivePlatform } from '../_components/useActivePlatform';

type SavedAnswer = { id: string; at: string; question: string; answer: string };
const SAVED_KEY = 'dynalander.metaAiChat.savedAnswers';

function readSaved(): SavedAnswer[] {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; }
}

function writeSaved(rows: SavedAnswer[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(rows.slice(0, 30)));
}

export default function MetaAiChatPanel() {
  const { platform } = useActivePlatform();
  const { selectedAccount } = useActiveAccount();
  const [question, setQuestion] = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedAnswer[]>([]);
  const [message, setMessage] = useState('');

  async function askAi() {
    const trimmed = question.trim();
    if (!trimmed) {
      setMessage('Type a question first.');
      return;
    }

    setLoading(true);
    setMessage('');
    setLastQuestion(trimmed);
    setAnswer('');

    try {
      const contextParams = new URLSearchParams({ accountKey: selectedAccount.customerId, range: 'last_30d' });
      const contextResponse = await fetch(`/api/meta-ads/ai-account-review?${contextParams.toString()}`, { cache: 'no-store' });
      const context = await contextResponse.json();
      const response = await fetch('/api/meta-ads/ai-review-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, context })
      });
      const result = await response.json();
      setAnswer(result.answer || 'No answer returned.');
    } catch {
      setAnswer('AI request failed. Try again after the page reloads.');
    } finally {
      setLoading(false);
    }
  }

  function clearResponse() {
    setAnswer('');
    setMessage('Response area cleared.');
  }

  function loadLastQuestion() {
    setQuestion(lastQuestion);
    setMessage('Last question loaded. You can edit and ask again.');
  }

  function saveAnswer() {
    if (!lastQuestion || !answer) {
      setMessage('Ask a question and get an answer before saving.');
      return;
    }
    const row = { id: `${Date.now()}`, at: new Date().toISOString(), question: lastQuestion, answer };
    const next = [row, ...readSaved()];
    writeSaved(next);
    setSaved(next);
    setMessage('Response saved.');
  }

  function deleteSaved(id: string) {
    const next = readSaved().filter((row) => row.id !== id);
    writeSaved(next);
    setSaved(next);
    setMessage('Saved response deleted.');
  }

  function useSavedQuestion(row: SavedAnswer) {
    setQuestion(row.question);
    setMessage('Saved question loaded. You can edit and ask again.');
  }

  useEffect(() => { setSaved(readSaved()); }, []);

  if (platform !== 'meta_ads') {
    return <section style={cardStyle}><h2 style={{ marginTop: 0 }}>AI Account Chat</h2><p style={{ color: '#64748b' }}>Select Facebook / Meta Ads from the left sidebar to use this chat.</p></section>;
  }

  return (
    <>
      <section style={{ ...cardStyle, position: 'sticky', top: 0, zIndex: 10, border: '2px solid #2563eb' }}>
        <h2 style={{ marginTop: 0 }}>Ask AI About This Meta Account</h2>
        <p style={{ color: '#64748b' }}>Ask broad or specific questions. You can clear the response, reload your last question, edit it, and ask again.</p>
        <textarea
          style={{ ...inputStyle, minHeight: 120 }}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Example: Review my account overall and tell me what I should focus on changing first."
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <button type="button" onClick={askAi} style={blueButtonStyle} disabled={loading}>{loading ? 'Asking...' : 'Ask AI'}</button>
          <button type="button" onClick={loadLastQuestion} style={{ ...blueButtonStyle, background: '#334155' }} disabled={!lastQuestion}>Load last question</button>
          <button type="button" onClick={clearResponse} style={{ ...blueButtonStyle, background: '#7c2d12' }}>Clear response area</button>
          <button type="button" onClick={saveAnswer} style={{ ...blueButtonStyle, background: '#166534' }}>Save response</button>
        </div>
        {message ? <p style={{ color: '#334155', fontWeight: 800 }}>{message}</p> : null}
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Submitted Question</h2>
        <p style={{ whiteSpace: 'pre-wrap', color: '#334155' }}>{lastQuestion || 'No question submitted yet.'}</p>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>AI Response</h2>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{answer || 'No response yet.'}</p>
      </section>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Saved Responses</h2>
        {saved.length === 0 ? <p style={{ color: '#64748b' }}>No saved responses yet.</p> : null}
        <div style={{ display: 'grid', gap: 12 }}>
          {saved.map((row) => (
            <div key={row.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
              <div style={{ color: '#64748b', fontSize: 12 }}>{new Date(row.at).toLocaleString()}</div>
              <strong>Question</strong>
              <p style={{ whiteSpace: 'pre-wrap' }}>{row.question}</p>
              <strong>Answer</strong>
              <p style={{ whiteSpace: 'pre-wrap' }}>{row.answer}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button type="button" onClick={() => useSavedQuestion(row)} style={blueButtonStyle}>Load question</button>
                <button type="button" onClick={() => deleteSaved(row.id)} style={{ ...blueButtonStyle, background: '#991b1b' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
