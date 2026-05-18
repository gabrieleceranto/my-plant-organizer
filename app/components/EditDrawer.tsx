'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Plant, PlantFields } from '@/lib/types';

const CATEGORIES = ['Aromatica', 'Succulenta', 'Cactus', 'Fioritura', 'Ortaggio', 'Albero', 'Ornamentale'];
const HEALTH_OPTIONS = [
  { value: 'ok', label: 'Sana' },
  { value: 'warn', label: 'Attenzione' },
  { value: 'bad', label: 'Urgente' },
];

interface Props {
  plant: Plant;
  onClose: () => void;
  onSaved: (updated: Plant) => void;
}

export default function EditDrawer({ plant, onClose, onSaved }: Props) {
  const [fields, setFields] = useState<PlantFields>({
    name: plant.name,
    latin: plant.latin,
    category: plant.category,
    note: plant.note,
    health: plant.health,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(key: keyof PlantFields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/plants/${plant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Errore'); return; }
      onSaved(data.plant as Plant);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer">
        <div className="drawer-header">
          <Image className="drawer-plant-thumb" src={plant.image_path} alt={plant.name} width={48} height={48} />
          <h2>Modifica: {plant.name}</h2>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="drawer-form">
          <div className="form-row">
            <div className="form-field">
              <label>Nome comune</label>
              <input value={fields.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Nome scientifico</label>
              <input value={fields.latin} onChange={(e) => set('latin', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Categoria</label>
              <select value={fields.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Salute</label>
              <select value={fields.health} onChange={(e) => set('health', e.target.value)}>
                {HEALTH_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Note</label>
            <textarea rows={4} value={fields.note} onChange={(e) => set('note', e.target.value)} />
          </div>
          {error && <p className="form-error">{error}</p>}
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
