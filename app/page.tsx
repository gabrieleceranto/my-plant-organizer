import { createClient } from '@/lib/supabase-server';
import type { Plant } from '@/lib/types';
import PlantGrid from './components/PlantGrid';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('plants')
    .select('id, name, latin, category, note, health, image_path, feedback, light, root_depth_cm, plant_synergies!plant_id(id, synergy_type, partner_name, description, how_to_use)')
    .order('id');

  if (error) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#c04040' }}>
        Errore nel caricamento delle piante: {error.message}
      </div>
    );
  }

  return <PlantGrid plants={(data ?? []) as Plant[]} />;
}
