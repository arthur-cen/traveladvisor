import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { buildTripContext } from '@/lib/buildTripContext';
import type { TripAnswers } from '@/lib/types';

let systemPrompt: string;
try {
  systemPrompt = readFileSync(
    join(process.cwd(), 'prompts', 'system_prompt.txt'),
    'utf-8'
  );
} catch {
  throw new Error(
    'system_prompt.txt not found. Expected at: <repo-root>/prompts/system_prompt.txt'
  );
}

export async function POST(req: NextRequest) {
  const { answers, refinement } = (await req.json()) as {
    answers: TripAnswers;
    refinement?: string;
  };

  if (process.env.MOCK_LLM === 'true') {
    const mockText = getMockResponse(answers, refinement);
    const encoder = new TextEncoder();
    // Split into smaller chunks to simulate streaming behavior
    const chunks = mockText.split(/(\s+)/);

    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(encoder.encode(chunk));
          // Small delay for natural streaming feeling
          await new Promise((resolve) => setTimeout(resolve, 8));
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
          ...(refinement
            ? [
                {
                  role: 'assistant' as const,
                  content: 'Here is your itinerary. Let me know if you would like any changes.',
                },
                {
                  role: 'user' as const,
                  content: `Please adjust the itinerary with this change: ${refinement}\n\nRegenerate the full itinerary with this modification applied. Keep the same format.`,
                },
              ]
            : []),
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

function getMockResponse(answers: TripAnswers, refinement?: string): string {
  const days = parseInt(answers.days, 10) || 1;
  const destination = answers.destination || 'Paris';
  const dates = answers.travelDates || 'May 25 - May 28';

  // Helper to get varied locations for mock testing
  const getLoc = (dayNum: number): string => {
    const destLower = destination.toLowerCase();
    if (destLower.includes('paris')) {
      if (dayNum === 1) return 'Paris, France';
      if (dayNum === 2) return 'Versailles, France';
      if (dayNum === 3) return 'Giverny, France';
      return 'Paris, France';
    }
    if (destLower.includes('london')) {
      if (dayNum === 1) return 'London, United Kingdom';
      if (dayNum === 2) return 'Windsor, United Kingdom';
      if (dayNum === 3) return 'Greenwich, United Kingdom';
      return 'London, United Kingdom';
    }
    if (destLower.includes('tokyo')) {
      if (dayNum === 1) return 'Tokyo, Japan';
      if (dayNum === 2) return 'Kamakura, Japan';
      if (dayNum === 3) return 'Yokohama, Japan';
      return 'Tokyo, Japan';
    }
    return `${destination}`;
  };

  if (refinement) {
    if (days === 1) {
      return `== Day Trip: ${destination} on ${dates} ==

Morning (09:00 AM - 12:00 PM)
  * Refined Morning Activity — Applied: "${refinement}" (~3 hrs)

Lunch (12:00 PM - 1:30 PM)
  * Le Bistro — French cuisine, $$

Afternoon (1:30 PM - 6:00 PM)
  * Jardin du Luxembourg — Stroll in the sun (~2.5 hrs)

Evening (6:00 PM onwards)
  * Seine River Cruise — Relaxing boat ride.

== Practical Info ==
  * Getting there: Train or flight to ${destination}.
  * Estimated cost: $100-$150 per person
  * Tips:
    - Comfortable shoes are a must.
    - Reserve dining spots early.
    - Check local weather forecast.`;
    } else {
      return `== ${days}-Day Itinerary: ${destination} | ${dates} ==

--- Day 1: Refined Overview ---
Location: ${getLoc(1)}
Morning   -> Refined Activity: ${refinement}
Afternoon -> Visit the historic landmark site
Evening   -> Enjoy dinner at a cozy local cafe
Stay: Historic District

${Array.from({ length: days - 1 })
  .map(
    (_, i) => `--- Day ${i + 2}: Standard Exploration ---
Location: ${getLoc(i + 2)}
Morning   -> Explore neighborhood gardens and paths
Afternoon -> Visit local museums and galleries
Evening   -> Dine at traditional food stalls
Stay: Creative Quarter`
  )
  .join('\n\n')}

== Trip Summary ==
  * Estimated total cost: $400-$700 per person
  * Getting around: Metro and walkable city blocks
  * Book in advance: Museum entry passes
  * What to pack: Walking shoes, layering clothes
  * Local tip: Try the local bakeries in residential areas.`;
    }
  }

  if (days === 1) {
    return `== Day Trip: ${destination} on ${dates} ==

Morning (09:00 AM - 12:00 PM)
  * Louvre Museum — World famous art collection (~3 hrs)
  * Tuileries Garden — Historic park stroll (~1 hr)

Lunch (12:00 PM - 1:30 PM)
  * Cafe de Flore — Classic Parisian cafe, $$

Afternoon (1:30 PM - 6:00 PM)
  * Eiffel Tower — Climb or view from Trocadéro (~2.5 hrs)

Evening (6:00 PM onwards)
  * Seine River Dinner Cruise — Enjoy French cuisine with river views.

== Practical Info ==
  * Getting there: Fly into CDG or take Eurostar.
  * Estimated cost: $150-$250 per person
  * Tips:
    - Book Louvre tickets at least 2 weeks in advance.
    - Walk as much as possible to enjoy the architecture.
    - Avoid taxis; use the Metro instead.`;
  }

  return `== ${days}-Day Itinerary: ${destination} | ${dates} ==

--- Day 1: Historic Exploration ---
Location: ${getLoc(1)}
Morning   -> Visit the historic cathedral and old town squares
Afternoon -> Take a guided walking tour of the main landmarks
Evening   -> Traditional local dinner at a family-run tavern
Stay: Historic Quarter

--- Day 2: Art and Culture ---
Location: ${getLoc(2)}
Morning   -> Browse the collections at the modern art museum
Afternoon -> Explore the local boutique shops and cafes
Evening   -> Casual dining followed by a theater show
Stay: Creative District

${
  days > 2
    ? Array.from({ length: days - 2 })
        .map(
          (_, i) => `--- Day ${i + 3}: Scenic Highlights ---
Location: ${getLoc(i + 3)}
Morning   -> Take a day trip to the nearby palace or castle ruins
Afternoon -> Walk through the palace gardens and lake pathways
Evening   -> Relaxing dinner at a lakeside restaurant
Stay: Creative District`
        )
        .join('\n\n')
    : ''
}

== Trip Summary ==
  * Estimated total cost: $500-$900 per person
  * Getting around: Metro/tram transit system and walking
  * Book in advance: Palace day trip entry passes
  * What to pack: Comfortable shoes, weather jacket, notebook
  * Local tip: Validate your transit tickets before boarding.`;
}
