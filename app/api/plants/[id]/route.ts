import { createClient } from '@/lib/supabase-server';
import { adminClient } from '@/lib/supabase-admin';
import type { HealthStatus } from '@/lib/types';

const VALID_HEALTH = new Set(['ok', 'warn', 'bad']);
const VALID_CATEGORIES = new Set(['Aromatica', 'Succulenta', 'Cactus', 'Fioritura', 'Ortaggio', 'Albero', 'Ornamentale']);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });

  const { id } = await params;
  const { name, latin, category, note, health } = await request.json();

  if (!name || !latin || !category || !note || !health) {
    return Response.json({ error: 'Campi mancanti' }, { status: 400 });
  }
  if (!VALID_HEALTH.has(health)) {
    return Response.json({ error: 'Salute non valida' }, { status: 400 });
  }
  if (!VALID_CATEGORIES.has(category)) {
    return Response.json({ error: 'Categoria non valida' }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from('plants')
    .update({ name, latin, category, note, health: health as HealthStatus })
    .eq('id', Number(id))
    .select('id, name, latin, category, note, health, image_path')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ plant: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });

  const { id } = await params;

  const { data: plant } = await adminClient
    .from('plants')
    .select('image_path')
    .eq('id', Number(id))
    .single();

  if (plant?.image_path?.startsWith('https://')) {
    const url = new URL(plant.image_path);
    const pathParts = url.pathname.split('/object/public/plant-photos/');
    if (pathParts.length === 2) {
      await adminClient.storage.from('plant-photos').remove([pathParts[1]]);
    }
  }

  const { error } = await adminClient.from('plants').delete().eq('id', Number(id));
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
