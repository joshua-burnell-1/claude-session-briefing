// ABOUTME: Orchestrates the full session briefing output.
// ABOUTME: Combines permissions, safety, env scan, integrations, and model card into one display.

import chalk from 'chalk';
import { detectPermissions, renderPermissions } from './permissions.js';
import { renderSafetyReminder } from './safety-reminder.js';
import { scanEnvFiles, renderEnvScan } from './env-scanner.js';
import { detectIntegrations, renderIntegrations } from './integrations.js';
import { renderModelCard } from './model-card.js';

export async function printBriefing() {
  const cwd = process.cwd();
  const divider = chalk.dim('  ' + '─'.repeat(56));

  console.log('');
  console.log(chalk.blue.bold('  ┌──────────────────────────────────────────────────────┐'));
  console.log(chalk.blue.bold('  │           Claude Code Session Briefing                │'));
  console.log(chalk.blue.bold('  └──────────────────────────────────────────────────────┘'));
  console.log('');

  // 1. Permission mode
  const perms = detectPermissions();
  console.log(renderPermissions(perms));
  console.log(divider);

  // 2. Safety reminder
  console.log(renderSafetyReminder());
  console.log(divider);

  // 3. Env scan
  const envResults = scanEnvFiles(cwd);
  console.log(renderEnvScan(envResults));
  console.log(divider);

  // 4. Integrations
  const integrations = detectIntegrations(cwd);
  console.log(renderIntegrations(integrations));
  console.log(divider);

  // 5. Model card
  console.log(renderModelCard());

  console.log('');
}
