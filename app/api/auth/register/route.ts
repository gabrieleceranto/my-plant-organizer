import { adminClient } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const { email, password, code } = await request.json();

  if (!email || !password || !code) {
    return Response.json({ error: 'Campi mancanti.' }, { status: 400 });
  }

  const { data: inviteRow, error: inviteError } = await adminClient
    .from('invite_codes')
    .select('code, used')
    .eq('code', code)
    .single();

  if (inviteError || !inviteRow) {
    return Response.json({ error: 'Codice invito non valido.' }, { status: 400 });
  }
  if (inviteRow.used) {
    return Response.json({ error: 'Codice invito già utilizzato.' }, { status: 400 });
  }

  const { data: signUpData, error: signUpError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (signUpError) {
    return Response.json({ error: signUpError.message }, { status: 400 });
  }

  await adminClient
    .from('invite_codes')
    .update({ used: true, used_by: signUpData.user.id, used_at: new Date().toISOString() })
    .eq('code', code);

  return Response.json({ ok: true });
}
