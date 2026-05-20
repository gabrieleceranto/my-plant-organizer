'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Plant, SynergyType, LightLevel } from '@/lib/types';
import PhotoBadge from './PhotoBadge';

const healthLabel: Record<string, string> = {
  ok: 'Sana',
  warn: 'Attenzione',
  bad: 'Urgente',
};

const lightConfig: Record<LightLevel, { label: string; className: string }> = {
  pieno_sole:     { label: 'Pieno sole',     className: 'light-pieno' },
  parziale:       { label: 'Parziale',       className: 'light-parz' },
  luce_indiretta: { label: 'Luce indiretta', className: 'light-indir' },
};

const synergyConfig: Record<SynergyType, { label: string; className: string }> = {
  microclima:    { label: 'Microclima',    className: 'syn-microclima' },
  nutrienti:     { label: 'Nutrienti',     className: 'syn-nutrienti' },
  repellente:    { label: 'Repellente',    className: 'syn-repellente' },
  impollinatori: { label: 'Impollinatori', className: 'syn-impollinatori' },
  antisettico:   { label: 'Antisettico',   className: 'syn-antisettico' },
  accumulatore:  { label: 'Accumulatore',  className: 'syn-accumulatore' },
  strutturale:   { label: 'Strutturale',   className: 'syn-strutturale' },
  etilene:       { label: 'Etilene',       className: 'syn-etilene' },
};

interface Props {
  plant: Plant;
  index: number;
  plantsById: Map<number, Plant>;
  onEdit: (plant: Plant) => void;
  onFeedbackUpdated: (id: number, feedback: string) => void;
}

export default function PlantCard({ plant, index, plantsById, onEdit, onFeedbackUpdated }: Props) {
  const [editingFeedback, setEditingFeedback] = useState(false);
  const [draft, setDraft] = useState(plant.feedback ?? '');
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [synergiesOpen, setSynergiesOpen] = useState(false);

  const synergies = plant.plant_synergies ?? [];

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
        onClick={() => setLightbox(true)}
        style={{ cursor: 'zoom-in' }}
      />
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(false)}>
          <Image
            className="lightbox-img"
            src={plant.image_path}
            alt={plant.name}
            fill
            style={{ objectFit: 'contain' }}
          />
          <button className="lightbox-close" onClick={() => setLightbox(false)}>✕</button>
        </div>
      )}
      <div className="card-body">
        <div>
          <div className="card-top">
            <div className="card-names">
              <div className="card-name">{plant.name}</div>
              <div className="card-latin">{plant.latin}</div>
            </div>
            <div className="card-id">#{String(plant.id).padStart(2, '0')}</div>
          </div>
          <div className="card-category-row">
            <span className="card-category">{plant.category}</span>
            <button className="btn-edit-icon" onClick={() => onEdit(plant)} title="Modifica">✏</button>
          </div>
          <div className="card-meta">
            <span className={`card-light-badge ${lightConfig[plant.light].className}`}>
              {lightConfig[plant.light].label}
            </span>
            <span className="card-depth-badge">{plant.root_depth_cm}cm</span>
          </div>
          <div className="card-note">{plant.note}</div>

          {synergies.length > 0 && (
            <div className="synergy-section">
              <button className="synergy-toggle" onClick={() => setSynergiesOpen(o => !o)}>
                <span>Sinergie ({synergies.length})</span>
                <span className="synergy-toggle-arrow">{synergiesOpen ? '▲' : '▼'}</span>
              </button>
              {synergiesOpen && (
                <div className="synergy-list">
                  {synergies.map(s => {
                    const cfg = synergyConfig[s.synergy_type];
                    return (
                      <div key={s.id} className="synergy-item">
                        <div className="synergy-item-header">
                          <span className={`synergy-badge ${cfg.className}`}>{cfg.label}</span>
                          <PhotoBadge
                            name={s.partner_name}
                            imagePath={s.partner_id ? (plantsById.get(s.partner_id)?.image_path ?? null) : null}
                            className="synergy-partner-badge"
                          />
                        </div>
                        <p className="synergy-desc">{s.description}</p>
                        <p className="synergy-how">{s.how_to_use}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
          <button
            className="btn-feedback"
            onClick={() => setEditingFeedback(true)}
            title="Aggiungi feedback per Claude"
          >
            📝 Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
