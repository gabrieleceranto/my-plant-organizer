import { describe, it, expect } from 'vitest';
import { filterPlants } from './filters';
import type { Plant } from './types';

const plants: Plant[] = [
  { id: 1, name: 'Echeveria',  latin: 'Echeveria sp.',        category: 'Succulenta',  note: 'Bella rosetta',    health: 'ok',   image_path: '', light: 'pieno_sole', root_depth_cm: 10 },
  { id: 2, name: 'Basilico',   latin: 'Ocimum basilicum',     category: 'Aromatica',   note: 'Erba da cucina',   health: 'ok',   image_path: '', light: 'pieno_sole', root_depth_cm: 20 },
  { id: 3, name: 'Dracena',    latin: 'Dracaena compacta',    category: 'Ornamentale', note: 'Foglie scure',     health: 'warn', image_path: '', light: 'luce_indiretta', root_depth_cm: 30 },
  { id: 4, name: 'Pomodoro',   latin: 'Solanum lycopersicum', category: 'Ortaggio',    note: 'In frutto',        health: 'bad',  image_path: '', light: 'pieno_sole', root_depth_cm: 40 },
  { id: 5, name: 'Menta',      latin: 'Mentha spicata',       category: 'Aromatica',   note: 'Pianta aromatica', health: 'bad',  image_path: '', light: 'parziale',   root_depth_cm: 20 },
];

describe('filterPlants', () => {
  describe('filter = all', () => {
    it('returns all plants when search is empty', () => {
      expect(filterPlants(plants, 'all', '')).toHaveLength(5);
    });
  });

  describe('category filter', () => {
    it('returns only plants whose category includes the filter value', () => {
      const result = filterPlants(plants, 'Aromatica', '');
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.name)).toEqual(['Basilico', 'Menta']);
    });

    it('is case-insensitive', () => {
      expect(filterPlants(plants, 'aromatica', '')).toHaveLength(2);
    });

    it('returns empty when no category matches', () => {
      expect(filterPlants(plants, 'Cactus', '')).toHaveLength(0);
    });
  });

  describe('filter = bad (health alert)', () => {
    it('includes both bad and warn plants', () => {
      const result = filterPlants(plants, 'bad', '');
      expect(result).toHaveLength(3);
      expect(result.map((p) => p.health).every((h) => h === 'bad' || h === 'warn')).toBe(true);
    });

    it('excludes healthy plants', () => {
      const result = filterPlants(plants, 'bad', '');
      expect(result.some((p) => p.health === 'ok')).toBe(false);
    });
  });

  describe('search', () => {
    it('matches by name (case-insensitive)', () => {
      expect(filterPlants(plants, 'all', 'echev')).toHaveLength(1);
      expect(filterPlants(plants, 'all', 'ECHEV')).toHaveLength(1);
    });

    it('matches by latin name', () => {
      expect(filterPlants(plants, 'all', 'ocimum')).toHaveLength(1);
    });

    it('matches by note content', () => {
      expect(filterPlants(plants, 'all', 'cucina')).toHaveLength(1);
    });

    it('matches by id', () => {
      expect(filterPlants(plants, 'all', '3')).toHaveLength(1);
      expect(filterPlants(plants, 'all', '3')[0].name).toBe('Dracena');
    });

    it('returns empty for non-matching query', () => {
      expect(filterPlants(plants, 'all', 'zzznomatch')).toHaveLength(0);
    });
  });

  describe('combined filter + search', () => {
    it('applies both filter and search together', () => {
      // filter: Aromatica, search: 'menta' — only Menta matches
      const result = filterPlants(plants, 'Aromatica', 'menta');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Menta');
    });

    it('returns empty when filter matches but search does not', () => {
      expect(filterPlants(plants, 'Aromatica', 'zzznomatch')).toHaveLength(0);
    });
  });
});
