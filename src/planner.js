import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { buildTripContext } from './utils.js';
import { trace } from './debug.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const systemPrompt = readFileSync(
  join(__dirname, '../prompts/system_prompt.txt'),
  'utf-8'
);

trace('planner:module_load', `system prompt loaded (${systemPrompt.length} chars)`);

export async function buildItinerary(answers) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.'
    );
  }

  const client = new Anthropic();
  const context = buildTripContext(answers);

  trace('planner:trip_context', context);

  const requestParams = {
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' }, // prompt caching — reused across calls
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Please create a travel itinerary based on the following trip details:\n\n${context}`,
      },
    ],
  };

  trace('planner:api_call_start', { model: requestParams.model, max_tokens: requestParams.max_tokens });

  const stream = client.messages.stream(requestParams);

  trace('planner:stream_created', 'stream object ready, will begin on first iteration');

  return stream;
}
