'use client';

import { useState } from 'react';
import type { Plant } from '@/lib/types';
import { filterPlants } from '@/lib/filters';
import PlantCard from './PlantCard';

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

export default function PlantGrid({ plants }: { plants: Plant[] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = filterPlants(plants, activeFilter, search);

  const warnCount = plants.filter((p) => p.health === 'warn').length;
  const badCount = plants.filter((p) => p.health === 'bad').length;

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
          filtered.map((plant, i) => <PlantCard key={plant.id} plant={plant} index={i} />)
        )}
      </div>

      <footer className="site-footer">
        Terrazzo · {plants.length} piante catalogate
      </footer>
    </>
  );
}
