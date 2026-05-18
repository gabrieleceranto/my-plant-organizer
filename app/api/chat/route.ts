import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@/lib/supabase-server';
import { buildSystemPrompt } from '@/lib/chat-utils';
import type { Plant } from '@/lib/types';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SUGGEST_CORRECTION_TOOL: Anthropic.Tool = {
  name: 'suggest_correction',
  description: 'Suggerisci correzioni per i campi della pianta. Includi solo i campi che devono essere modificati.',
  input_schema: {
    type: 'object' as const,
    properties: {
      reasoning: { type: 'string', description: 'Motivazione delle correzioni suggerite' },
      name: { type: 'string', description: 'Nome comune della pianta in italiano' },
      latin: { type: 'string', description: 'Nome scientifico (latino)' },
      category: {
        type: 'string',
        enum: ['Aromatica', 'Succulenta', 'Cactus', 'Fioritura', 'Ortaggio', 'Albero', 'Ornamentale'],
        description: 'Categoria della pianta',
      },
      note: { type: 'string', description: 'Note descrittive sulla pianta (max 120 caratteri)' },
      health: { type: 'string', enum: ['ok', 'warn', 'bad'], description: 'Stato di salute' },
    },
    required: ['reasoning'],
  },
};

async function loadImageBase64(imagePath: string): Promise<{ base64: string; mediaType: string }> {
  if (imagePath.startsWith('https://')) {
    const res = await fetch(imagePath);
    const buf = await res.arrayBuffer();
    return {
      base64: Buffer.from(buf).toString('base64'),
      mediaType: res.headers.get('content-type') ?? 'image/jpeg',
    };
  }
  const abs = join(process.cwd(), 'public', imagePath);
  const buf = readFileSync(abs);
  return { base64: buf.toString('base64'), mediaType: 'image/jpeg' };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Non autorizzato' }, { status: 401 });

  const { plantId, messages } = await request.json();

  const { data: plant } = await supabase
    .from('plants')
    .select('id, name, latin, category, note, health, image_path')
    .eq('id', plantId)
    .single();

  if (!plant) return Response.json({ error: 'Pianta non trovata' }, { status: 404 });

  const { base64, mediaType } = await loadImageBase64((plant as Plant).image_path);

  const systemPrompt = buildSystemPrompt(plant as Plant);

  const apiMessages: Anthropic.MessageParam[] = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.role === 'user' && messages.indexOf(m) === 0
        ? [
            { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType as 'image/jpeg', data: base64 } },
            { type: 'text' as const, text: m.content },
          ]
        : m.content,
    })
  );

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(obj: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      }

      try {
        const anthropicStream = anthropic.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          tools: [SUGGEST_CORRECTION_TOOL],
          messages: apiMessages,
        });

        for await (const event of anthropicStream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            send({ type: 'text', delta: event.delta.text });
          }
        }

        const finalMsg = await anthropicStream.finalMessage();
        const toolBlock = finalMsg.content.find((b) => b.type === 'tool_use');
        if (toolBlock && toolBlock.type === 'tool_use') {
          send({ type: 'tool', fields: toolBlock.input });
        }

        send({ type: 'done' });
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : 'Errore sconosciuto' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
