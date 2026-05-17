import type { Plant } from './types';

export function filterPlants(plants: Plant[], activeFilter: string, search: string): Plant[] {
  const q = search.toLowerCase();

  return plants.filter((p) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'bad'
          ? p.health === 'bad' || p.health === 'warn'
          : p.category.toLowerCase().includes(activeFilter.toLowerCase());

    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.latin.toLowerCase().includes(q) ||
      p.note.toLowerCase().includes(q) ||
      String(p.id).includes(q);

    return matchesFilter && matchesSearch;
  });
}
