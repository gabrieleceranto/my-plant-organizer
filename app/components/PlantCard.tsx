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
  onFeedbackUpdated: (id: number, feedback: string) => void;
}

export default function PlantCard({ plant, index, onEdit, onFeedbackUpdated }: Props) {
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [draft, setDraft] = useState(plant.feedback ?? '');
  const [saving, setSaving] = useState(false);

  async function saveFeedback() {
    setSaving(true);
    await fetch(`/api/plants/${plant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback: draft }),
    });
    setSaving(false);
    setEditingFeedback(false);
    onFeedbackUpdated(plant.id, draft);
  }

  function cancelFeedback() {
    setDraft(plant.feedback ?? '');
    setEditingFeedback(false);
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
          <div className="card-note">{plant.note}</div>

          {editingFeedback ? (
            <div className="feedback-edit">
              <textarea
                className="feedback-textarea"
                rows={3}
                placeholder="Scrivi un feedback per Claude…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
              <div className="feedback-actions">
                <button className="btn-note-cancel" onClick={cancelFeedback}>Annulla</button>
                <button className="btn-note-save" onClick={saveFeedback} disabled={saving}>
                  {saving ? '…' : 'Salva'}
                </button>
              </div>
            </div>
          ) : plant.feedback ? (
            <div className="feedback-display" onClick={() => setEditingFeedback(true)}>
              <span className="feedback-label">📝 Feedback</span>
              {plant.feedback}
            </div>
          ) : null}
        </div>

        <div className="card-footer">
          <div className={`health-badge ${plant.health}`}>
            <div className="health-dot" />
            {healthLabel[plant.health]}
          </div>
          <div className="card-actions">
            <button
              className="btn-feedback"
              onClick={() => setEditingFeedback(true)}
              title="Aggiungi feedback per Claude"
            >
              📝 Feedback
            </button>
            <button className="btn-correct" onClick={() => onEdit(plant)}>Modifica</button>
          </div>
        </div>
      </div>
    </div>
  );
}
