'use client';

import { useState } from 'react';
import type { Plant } from '@/lib/types';
import { filterPlants } from '@/lib/filters';
import PlantCard from './PlantCard';
import EditDrawer from './EditDrawer';

const FILTERS = [
  { label: 'Tutte', value: 'all' },
  { label: '🌿 Aromatiche', value: 'Aromatica' },
  { label: '🌵 Succulente', value: 'Succulenta' },
  { label: '🌵 Cactus', value: 'Cactus' },
  { label: '🌸 Fioriture', value: 'Fioritura' },
  { label: '🍅 Ortaggi', value: 'Ortaggio' },
  { label: '🍋 Alberi', value: 'Albero' },
  { label: '🌱 Ornamentali', value: 'Ornamentale' },
  { label: '⚠️ Da curare', value: 'bad' },
];

export default function PlantGrid({ plants: initialPlants }: { plants: Plant[] }) {
  const [localPlants, setLocalPlants] = useState<Plant[]>(initialPlants);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  const filtered = filterPlants(localPlants, activeFilter, search);
  const warnCount = localPlants.filter((p) => p.health === 'warn').length;
  const badCount = localPlants.filter((p) => p.health === 'bad').length;

  function handleSaved(updated: Plant) {
    setLocalPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleFeedbackUpdated(id: number, feedback: string) {
    setLocalPlants((prev) => prev.map((p) => (p.id === id ? { ...p, feedback } : p)));
  }

  function handleDeleted(id: number) {
    setLocalPlants((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <>
      <header className="site-header">
        <h1>
          🌿 Catalogo Piante del Terrazzo
          <span>Riconoscimento automatico · Maggio 2026</span>
        </h1>
        <div className="header-stats">
          <div className="stat">
            <div className="stat-num">{filtered.length}</div>
            <div className="stat-label">foto</div>
          </div>
          <div className="stat">
            <div className="stat-num" style={{ color: '#f0b060' }}>{warnCount}</div>
            <div className="stat-label">attenzione</div>
          </div>
          <div className="stat">
            <div className="stat-num" style={{ color: '#e07070' }}>{badCount}</div>
            <div className="stat-label">urgenti</div>
          </div>
          <a href="/abbinamenti" className="btn-abbinamenti">Abbinamenti</a>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="btn-logout">Esci</button>
          </form>
        </div>
      </header>

      <div className="controls">
        <span className="filter-label">Filtra:</span>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-btn${activeFilter === f.value ? ' active' : ''}`}
            onClick={() => setActiveFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <div className="search-wrap">
          <input
            type="search"
            placeholder="Cerca pianta…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="plant-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">Nessuna pianta trovata per questa ricerca.</div>
        ) : (
          filtered.map((plant, i) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              index={i}
              onEdit={setEditingPlant}
              onFeedbackUpdated={handleFeedbackUpdated}
            />
          ))
        )}
      </div>

      <footer className="site-footer">
        Terrazzo · {localPlants.length} piante catalogate
      </footer>

      {editingPlant && (
        <EditDrawer
          plant={editingPlant}
          onClose={() => setEditingPlant(null)}
          onSaved={(updated) => { handleSaved(updated); setEditingPlant(null); }}
        />
      )}
    </>
  );
}
