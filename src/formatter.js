import chalk from 'chalk';
import { trace } from './debug.js';

const DIVIDER = '─'.repeat(60);

export async function displayItinerary(stream) {
  console.log('\n' + chalk.bold(DIVIDER));
  console.log(chalk.bold.green('  Your Personalized Itinerary'));
  console.log(chalk.bold(DIVIDER) + '\n');

  trace('formatter:stream_start', 'beginning to iterate stream events');

  // The SDK (v0.98+) exposes the stream as an async iterable of MessageStreamEvent.
  // Text chunks arrive as content_block_delta events with a text_delta type.
  for await (const event of stream) {
    trace('formatter:stream_event', { type: event.type, deltaType: event.delta?.type });

    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      process.stdout.write(event.delta.text);
    }
  }

  trace('formatter:stream_end', 'stream exhausted');

  console.log('\n\n' + chalk.dim(DIVIDER));
  console.log(chalk.dim('  TravelAdvisor — powered by Claude'));
  console.log(chalk.dim(DIVIDER) + '\n');
}
