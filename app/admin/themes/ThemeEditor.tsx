'use client';

import { useState } from 'react';
import { cardStyle, gridStyle, inputStyle, labelStyle, twoColumnStyle } from '../_components/adminStyles';
import { useActiveAccount } from '../_components/useActiveAccount';
import { dynlanderThemes } from '../_data/dynlanderAdminData';

export default function ThemeEditor() {
  const { selectedAccount } = useActiveAccount();
  const [selectedId, setSelectedId] = useState('repairs');
  const selected = dynlanderThemes.find((theme) => theme.id === selectedId) || dynlanderThemes[0];
  const [draft, setDraft] = useState(selected);

  function chooseTheme(id: string) {
    const next = dynlanderThemes.find((theme) => theme.id === id) || dynlanderThemes[0];
    setSelectedId(id);
    setDraft(next);
  }

  return (
    <div style={twoColumnStyle}>
      <aside style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Seller themes</h2>
        <p style={{ color: '#64748b' }}>Editing theme drafts for {selectedAccount.name}.</p>
        <div style={{ display: 'grid', gap: 10 }}>
          {dynlanderThemes.map((theme) => (
            <button key={theme.id} onClick={() => chooseTheme(theme.id)} style={{ textAlign: 'left', padding: 12, borderRadius: 12, border: selectedId === theme.id ? '2px solid #2563eb' : '1px solid #e2e8f0', background: selectedId === theme.id ? '#eff6ff' : '#fff', cursor: 'pointer' }}>
              <strong>{theme.label}</strong><br />
              <span style={{ color: '#64748b', fontSize: 13 }}>{theme.angle}</span>
            </button>
          ))}
        </div>
      </aside>

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Edit for {selectedAccount.name}: {draft.label}</h2>
        <div style={gridStyle}>
          <label style={labelStyle}>Headline<input style={inputStyle} value={draft.headline} onChange={(e) => setDraft({ ...draft, headline: e.target.value })} /></label>
          <label style={labelStyle}>CTA Button<input style={inputStyle} value={draft.cta} onChange={(e) => setDraft({ ...draft, cta: e.target.value })} /></label>
        </div>
        <label style={labelStyle}>Subheadline<textarea style={{ ...inputStyle, minHeight: 80 }} value={draft.subheadline} onChange={(e) => setDraft({ ...draft, subheadline: e.target.value })} /></label>
        <div style={{ height: 14 }} />
        <label style={labelStyle}>Form Intro<textarea style={{ ...inputStyle, minHeight: 80 }} value={draft.formIntro} onChange={(e) => setDraft({ ...draft, formIntro: e.target.value })} /></label>
        <div style={{ height: 14 }} />
        <label style={labelStyle}>Chat Opening<textarea style={{ ...inputStyle, minHeight: 80 }} value={draft.chatOpening} onChange={(e) => setDraft({ ...draft, chatOpening: e.target.value })} /></label>
        <div style={{ height: 14 }} />
        <label style={labelStyle}>FAQ Answer<textarea style={{ ...inputStyle, minHeight: 80 }} value={draft.faq1} onChange={(e) => setDraft({ ...draft, faq1: e.target.value })} /></label>
        <p style={{ color: '#64748b' }}>Demo note: this page uses the active account context, but saves are not database-backed yet.</p>
      </section>
    </div>
  );
}
