import chalk from 'chalk';

// Enable with: npm start -- --debug
export const isDebug = process.argv.includes('--debug');

/**
 * Print a labelled trace line only when debug mode is active.
 * @param {string} step  - Short label, e.g. "questionnaire:done"
 * @param {*}      [data] - Optional data to pretty-print
 */
export function trace(step, data) {
  if (!isDebug) return;
  const ts = new Date().toISOString().replace('T', ' ').slice(0, -1);
  console.log(chalk.dim(`\n[DEBUG ${ts}] ▶ ${step}`));
  if (data !== undefined) {
    const out = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
    console.log(chalk.dim(out));
  }
}
