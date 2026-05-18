'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Plant, ChatMessage, CorrectionFields, SuggestCorrectionInput } from '@/lib/types';
import { mergeCorrection } from '@/lib/chat-utils';

const CATEGORIES = ['Aromatica', 'Succulenta', 'Cactus', 'Fioritura', 'Ortaggio', 'Albero', 'Ornamentale'];
const HEALTH_LABELS = { ok: 'Sana', warn: 'Attenzione', bad: 'Urgente' };

interface Props {
  plant: Plant;
  onClose: () => void;
  onSaved: (updated: Plant) => void;
}

export default function CorrectionDrawer({ plant, onClose, onSaved }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState<CorrectionFields>({
    name: plant.name,
    latin: plant.latin,
    category: plant.category,
    note: plant.note,
    health: plant.health,
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    sendToAI([{ role: 'user', content: 'Analizza questa pianta e suggerisci eventuali correzioni.' }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendToAI(msgs: ChatMessage[]) {
    setStreaming(true);
    const assistantMsg: ChatMessage = { role: 'assistant', content: '', isStreaming: true };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantId: plant.id, messages: msgs }),
      });

      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          const payload = JSON.parse(part.slice(6));
          if (payload.type === 'text') {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + payload.delta };
              return copy;
            });
          } else if (payload.type === 'tool') {
            const suggestion = payload.fields as SuggestCorrectionInput;
            setFields(mergeCorrection(plant, suggestion));
          }
        }
      }
    } finally {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { ...copy[copy.length - 1], isStreaming: false };
        return copy;
      });
      setStreaming(false);
    }
  }

  function handleSend() {
    if (!input.trim() || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const history: ChatMessage[] = [
      { role: 'user', content: 'Analizza questa pianta e suggerisci eventuali correzioni.' },
      ...messages,
      userMsg,
    ];
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    sendToAI(history);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/plants/${plant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) {
        onSaved(data.plant as Plant);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer">
        <div className="drawer-header">
          <Image
            className="drawer-plant-thumb"
            src={plant.image_path}
            alt={plant.name}
            width={48}
            height={48}
          />
          <h2>Correggi: {plant.name}</h2>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-area">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}${msg.isStreaming ? ' streaming' : ''}`}>
              {msg.content || (msg.isStreaming ? '…' : '')}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-row">
          <textarea
            className="chat-input"
            rows={1}
            placeholder="Scrivi un messaggio…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={streaming}
          />
          <button className="chat-send" onClick={handleSend} disabled={streaming || !input.trim()}>
            Invia
          </button>
        </div>

        <div className="correction-form">
          <h3>Campi da salvare</h3>
          <div className="form-row">
            <div className="form-field">
              <label>Nome</label>
              <input value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Nome scientifico</label>
              <input value={fields.latin} onChange={(e) => setFields({ ...fields, latin: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Categoria</label>
              <select value={fields.category} onChange={(e) => setFields({ ...fields, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Salute</label>
              <select value={fields.health} onChange={(e) => setFields({ ...fields, health: e.target.value as 'ok' | 'warn' | 'bad' })}>
                {Object.entries(HEALTH_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Note</label>
            <textarea value={fields.note} onChange={(e) => setFields({ ...fields, note: e.target.value })} />
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={onClose}>Annulla</button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio…' : 'Salva'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
