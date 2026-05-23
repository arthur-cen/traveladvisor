import 'dotenv/config';
import chalk from 'chalk';
import { runQuestionnaire } from './src/questionnaire.js';
import { buildItinerary } from './src/planner.js';
import { displayItinerary } from './src/formatter.js';
import { isDebug, trace } from './src/debug.js';

async function main() {
  if (isDebug) {
    console.log(chalk.dim('[DEBUG MODE ON — run without --debug to hide trace logs]\n'));
  }

  trace('main:start', { node: process.version, pid: process.pid });

  console.log('\n' + chalk.bold.cyan('════════════════════════════════════════'));
  console.log(chalk.bold.cyan('           TravelAdvisor'));
  console.log(chalk.bold.cyan('════════════════════════════════════════'));
  console.log(chalk.gray("Your AI-powered trip planner.\nAnswer a few questions and I'll craft your perfect itinerary.\n"));

  trace('main:questionnaire_start');
  const answers = await runQuestionnaire();
  trace('main:questionnaire_done', answers);

  console.log('\n' + chalk.yellow('Planning your trip — this will take a moment...\n'));

  trace('main:buildItinerary_start');
  const stream = await buildItinerary(answers);
  trace('main:buildItinerary_done', 'stream returned, handing off to formatter');

  await displayItinerary(stream);

  trace('main:done');
}

main().catch((err) => {
  console.error(chalk.red('\nError: ') + err.message);
  if (isDebug) console.error(err.stack);
  process.exit(1);
});
