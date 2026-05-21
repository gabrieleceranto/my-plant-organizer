import { adminClient } from '@/lib/supabase-admin';
import type { HealthStatus, LightLevel } from '@/lib/types';

const VALID_HEALTH = new Set(['ok', 'warn', 'bad']);
const VALID_CATEGORIES = new Set(['Aromatica', 'Succulenta', 'Cactus', 'Fioritura', 'Ortaggio', 'Albero', 'Ornamentale']);
const VALID_LIGHT = new Set(['pieno_sole', 'parziale', 'luce_indiretta']);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { name, latin, category, note, health, light, root_depth_cm } = body;
  if (!name || !latin || !category || !note || !health || !light) {
    return Response.json({ error: 'Campi mancanti' }, { status: 400 });
  }
  if (!VALID_HEALTH.has(health)) {
    return Response.json({ error: 'Salute non valida' }, { status: 400 });
  }
  if (!VALID_CATEGORIES.has(category)) {
    return Response.json({ error: 'Categoria non valida' }, { status: 400 });
  }
  if (!VALID_LIGHT.has(light)) {
    return Response.json({ error: 'Luce non valida' }, { status: 400 });
  }
  const depth = Number(root_depth_cm);
  if (!Number.isInteger(depth) || depth < 5 || depth > 100) {
    return Response.json({ error: 'Profondità non valida' }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from('plants')
    .update({ name, latin, category, note, health: health as HealthStatus, light: light as LightLevel, root_depth_cm: depth })
    .eq('id', Number(id))
    .select('id, name, latin, category, note, health, image_path, light, root_depth_cm')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ plant: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await adminClient.from('plants').delete().eq('id', Number(id));
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
