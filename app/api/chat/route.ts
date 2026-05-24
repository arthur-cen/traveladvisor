import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildTripContext } from '@/lib/buildTripContext';
import type { TripAnswers } from '@/lib/types';

let systemPrompt: string;
try {
  systemPrompt = readFileSync(
    join(process.cwd(), '..', 'prompts', 'system_prompt.txt'),
    'utf-8'
  );
} catch {
  throw new Error(
    'system_prompt.txt not found. Expected at: <repo-root>/prompts/system_prompt.txt'
  );
}

export async function POST(req: NextRequest) {
  const { answers } = (await req.json()) as { answers: TripAnswers };

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('ANTHROPIC_API_KEY not set', { status: 500 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const context = buildTripContext(answers);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const messageStream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          } as { type: 'text'; text: string; cache_control: { type: 'ephemeral' } },
        ],
        messages: [
          {
            role: 'user',
            content: `Please create a travel itinerary based on the following trip details:\n\n${context}`,
          },
        ],
      });

      for await (const event of messageStream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta?.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
