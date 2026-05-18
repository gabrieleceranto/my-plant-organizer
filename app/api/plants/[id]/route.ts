import { createClient } from '@/lib/supabase-server';
import { adminClient } from '@/lib/supabase-admin';
import { validateCorrectionFields } from '@/lib/chat-utils';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const fields = validateCorrectionFields(body);
  if (!fields) return Response.json({ error: 'Campi non validi' }, { status: 400 });

  const { data, error } = await adminClient
    .from('plants')
    .update(fields)
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
