// ABOUTME: Prints a short safety reminder about reviewing permission requests.
// ABOUTME: Includes two concrete examples of what to watch for.

import chalk from 'chalk';

export function renderSafetyReminder() {
  const lines = [
    chalk.bold('  Security Reminder'),
    chalk.white('  Read each permission request before approving. Watch for:'),
    chalk.yellow('    • Commands that delete files or modify git history') +
      chalk.dim(' (rm -rf, git reset --hard, git push --force)'),
    chalk.yellow('    • Commands that send data to external services') +
      chalk.dim(' (curl with POST, npm publish, git push to unknown remotes)'),
  ];

  return lines.join('\n');
}
