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
  onDelete: (id: number) => void;
}

export default function PlantCard({ plant, index, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/plants/${plant.id}`, { method: 'DELETE' });
    onDelete(plant.id);
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
        </div>
        <div className="card-footer">
          <div className={`health-badge ${plant.health}`}>
            <div className="health-dot" />
            {healthLabel[plant.health]}
          </div>
          <div className="card-actions">
            {confirming ? (
              <div className="delete-confirm">
                <span>Elimina?</span>
                <button className="confirm-yes" onClick={handleDelete} disabled={deleting}>Sì</button>
                <button className="confirm-no" onClick={() => setConfirming(false)}>No</button>
              </div>
            ) : (
              <>
                <button className="btn-correct" onClick={() => onEdit(plant)}>Modifica</button>
                <button className="btn-delete" onClick={() => setConfirming(true)}>🗑</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
