import { supabase } from '@/lib/supabase';
import type { Plant } from '@/lib/types';
import PlantGrid from './components/PlantGrid';

export const revalidate = 3600;

export default async function Page() {
  const { data, error } = await supabase
    .from('plants')
    .select('id, name, latin, category, note, health, image_path')
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
