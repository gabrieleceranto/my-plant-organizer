'use client';

import { useState, useRef } from 'react';
import type { Plant } from '@/lib/types';

const CATEGORIES = ['Aromatica', 'Succulenta', 'Cactus', 'Fioritura', 'Ortaggio', 'Albero', 'Ornamentale'];
const HEALTH_LABELS = { ok: 'Sana', warn: 'Attenzione', bad: 'Urgente' };

interface Props {
  onClose: () => void;
  onAdded: (plant: Plant) => void;
}

interface Fields {
  name: string;
  latin: string;
  category: string;
  note: string;
  health: 'ok' | 'warn' | 'bad';
}

export default function AddPlantDrawer({ onClose, onAdded }: Props) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [identifying, setIdentifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fields, setFields] = useState<Fields>({
    name: '',
    latin: '',
    category: 'Ornamentale',
    note: '',
    health: 'ok',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIdentifying(true);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mediaType: file.type }),
      });
      const data = await res.json();
      if (res.ok && data.suggestion) {
        const s = data.suggestion;
        setFields({
          name: s.name ?? '',
          latin: s.latin ?? '',
          category: s.category ?? 'Ornamentale',
          note: s.note ?? '',
          health: (s.health === 'ok' || s.health === 'warn' || s.health === 'bad') ? s.health : 'ok',
        });
      }
    } finally {
      setIdentifying(false);
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  async function handleSave() {
    if (!photo || !fields.name || !fields.latin) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('name', fields.name);
      formData.append('latin', fields.latin);
      formData.append('category', fields.category);
      formData.append('note', fields.note);
      formData.append('health', fields.health);

      const res = await fetch('/api/plants', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        onAdded(data.plant as Plant);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer">
        <div className="drawer-header">
          <h2 style={{ flex: 1 }}>Aggiungi pianta</h2>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!previewUrl ? (
            <div
              className={`upload-zone${dragOver ? ' drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              📷 Clicca o trascina una foto della pianta
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Anteprima" className="upload-preview" />
              <button
                onClick={() => { setPhoto(null); setPreviewUrl(''); }}
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontSize: '0.8rem' }}
              >✕</button>
            </div>
          )}

          {identifying && <p className="identifying-label">🔍 Identificazione in corso…</p>}

          <div className="correction-form" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <div className="form-row">
              <div className="form-field">
                <label>Nome</label>
                <input value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} placeholder="Es. Basilico" />
              </div>
              <div className="form-field">
                <label>Nome scientifico</label>
                <input value={fields.latin} onChange={(e) => setFields({ ...fields, latin: e.target.value })} placeholder="Es. Ocimum basilicum" />
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
              <textarea value={fields.note} onChange={(e) => setFields({ ...fields, note: e.target.value })} placeholder="Breve descrizione della pianta…" />
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'white' }}>
          <button className="btn-cancel" onClick={onClose}>Annulla</button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={saving || !photo || !fields.name || !fields.latin || identifying}
          >
            {saving ? 'Salvataggio…' : 'Aggiungi pianta'}
          </button>
        </div>
      </div>
    </div>
  );
}
