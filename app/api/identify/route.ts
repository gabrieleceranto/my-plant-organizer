import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const IDENTIFY_TOOL: Anthropic.Tool = {
  name: 'suggest_correction',
  description: 'Identifica la pianta e suggerisci i campi appropriati.',
  input_schema: {
    type: 'object' as const,
    properties: {
      reasoning: { type: 'string' },
      name: { type: 'string', description: 'Nome comune in italiano' },
      latin: { type: 'string', description: 'Nome scientifico' },
      category: {
        type: 'string',
        enum: ['Aromatica', 'Succulenta', 'Cactus', 'Fioritura', 'Ortaggio', 'Albero', 'Ornamentale'],
      },
      note: { type: 'string', description: 'Breve descrizione (max 120 caratteri)' },
      health: { type: 'string', enum: ['ok', 'warn', 'bad'] },
    },
    required: ['reasoning', 'name', 'latin', 'category', 'note', 'health'],
  },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });

  const { imageBase64, mediaType } = await request.json();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    system: 'Sei un botanico esperto. Analizza la foto e identifica la pianta. Rispondi sempre in italiano usando lo strumento suggest_correction.',
    tools: [IDENTIFY_TOOL],
    tool_choice: { type: 'tool', name: 'suggest_correction' },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType ?? 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: 'Identifica questa pianta e compila tutti i campi.' },
        ],
      },
    ],
  });

  const toolBlock = response.content.find((b) => b.type === 'tool_use');
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    return Response.json({ error: 'Identificazione fallita' }, { status: 500 });
  }

  return Response.json({ suggestion: toolBlock.input });
}
