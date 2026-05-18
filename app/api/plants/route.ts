import { createClient } from '@/lib/supabase-server';
import { adminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });

  const formData = await request.formData();
  const photo = formData.get('photo') as File | null;
  const name = formData.get('name') as string;
  const latin = formData.get('latin') as string;
  const category = formData.get('category') as string;
  const note = formData.get('note') as string;
  const health = formData.get('health') as string;

  if (!photo || !name || !latin || !category || !note || !health) {
    return Response.json({ error: 'Campi mancanti' }, { status: 400 });
  }

  const ext = photo.name.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}.${ext}`;
  const bytes = await photo.arrayBuffer();

  const { error: uploadError } = await adminClient.storage
    .from('plant-photos')
    .upload(fileName, bytes, { contentType: photo.type, upsert: false });

  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = adminClient.storage.from('plant-photos').getPublicUrl(fileName);
  const image_path = urlData.publicUrl;

  const { data: maxIdRow } = await adminClient
    .from('plants')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  const nextId = ((maxIdRow as { id: number } | null)?.id ?? 0) + 1;

  const { data, error } = await adminClient
    .from('plants')
    .insert({ id: nextId, name, latin, category, note, health, image_path })
    .select('id, name, latin, category, note, health, image_path')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ plant: data }, { status: 201 });
}
