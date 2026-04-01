// ABOUTME: Renders a model recommendation card for different task types.
// ABOUTME: Suggests which Claude model to use for quick tasks, deep coding, and agentic runs.

import chalk from 'chalk';

export function renderModelCard() {
  const lines = [
    chalk.bold('  Model Recommendations'),
    '',
    chalk.cyan('    Quick tasks') + chalk.dim(' (questions, small edits, lookups)'),
    chalk.white('      claude-haiku-4-5-20251001') + chalk.dim(' — fast, cheap, good enough'),
    '',
    chalk.cyan('    Deep coding') + chalk.dim(' (complex features, refactoring, debugging)'),
    chalk.white('      claude-sonnet-4-20250514') + chalk.dim(' — best balance of speed and quality'),
    '',
    chalk.cyan('    Long agentic runs') + chalk.dim(' (multi-step workflows, architecture, research)'),
    chalk.white('      claude-opus-4-20250514') + chalk.dim(' — strongest reasoning, highest context utilization'),
    '',
    chalk.dim('    Tip: In Claude Code, use /model to switch models mid-session.'),
  ];

  return lines.join('\n');
}
