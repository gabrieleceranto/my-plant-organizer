'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Plant } from '@/lib/types';

const healthLabel: Record<string, string> = {
  ok: 'Sana',
  warn: 'Attenzione',
  bad: 'Urgente',
};

interface Props {
  plant: Plant;
  index: number;
  onEdit: (plant: Plant) => void;
  onNoteUpdated: (id: number, note: string) => void;
}

export default function PlantCard({ plant, index, onEdit, onNoteUpdated }: Props) {
  const [editingNote, setEditingNote] = useState(false);
  const [draft, setDraft] = useState(plant.note);
  const [saving, setSaving] = useState(false);

  async function saveNote() {
    setSaving(true);
    await fetch(`/api/plants/${plant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: plant.name, latin: plant.latin,
        category: plant.category, health: plant.health,
        note: draft,
      }),
    });
    setSaving(false);
    setEditingNote(false);
    onNoteUpdated(plant.id, draft);
  }

  function cancelNote() {
    setDraft(plant.note);
    setEditingNote(false);
  }

  return (
    <div className="card" style={{ animationDelay: `${index * 0.018}s` }}>
      <Image
        className="card-img"
        src={plant.image_path}
        alt={plant.name}
        width={180}
        height={180}
        loading="lazy"
      />
      <div className="card-body">
        <div>
          <div className="card-top">
            <div className="card-names">
              <div className="card-name">{plant.name}</div>
              <div className="card-latin">{plant.latin}</div>
            </div>
            <div className="card-id">#{String(plant.id).padStart(2, '0')}</div>
          </div>
          <span className="card-category">{plant.category}</span>

          {editingNote ? (
            <div className="note-edit">
              <textarea
                className="note-textarea"
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
              <div className="note-actions">
                <button className="btn-note-cancel" onClick={cancelNote}>Annulla</button>
                <button className="btn-note-save" onClick={saveNote} disabled={saving}>
                  {saving ? '…' : 'Salva'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card-note note-clickable" onClick={() => setEditingNote(true)}>
              {plant.note || <span className="note-placeholder">✏ Aggiungi una nota…</span>}
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className={`health-badge ${plant.health}`}>
            <div className="health-dot" />
            {healthLabel[plant.health]}
          </div>
          <button className="btn-correct" onClick={() => onEdit(plant)}>Modifica</button>
        </div>
      </div>
    </div>
  );
}
