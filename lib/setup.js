// ABOUTME: Handles the --setup flag for initial configuration.
// ABOUTME: Walks the user through creating ~/.claude-briefing/ and customizing integrations.

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as readline from 'node:readline';
import chalk from 'chalk';

const BRIEFING_DIR = path.join(os.homedir(), '.claude-briefing');
const INTEGRATIONS_FILE = path.join(BRIEFING_DIR, 'integrations.json');

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

export async function runSetup() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log(chalk.blue.bold('\n  Claude Session Briefing — Setup\n'));

  // Create config directory
  if (!fs.existsSync(BRIEFING_DIR)) {
    fs.mkdirSync(BRIEFING_DIR, { recursive: true });
    console.log(chalk.green(`  ✓ Created ${BRIEFING_DIR}`));
  } else {
    console.log(chalk.dim(`  ✓ ${BRIEFING_DIR} already exists`));
  }

  // Initialize integrations file
  if (!fs.existsSync(INTEGRATIONS_FILE)) {
    fs.writeFileSync(INTEGRATIONS_FILE, '{}\n');
    console.log(chalk.green('  ✓ Created integrations.json'));
  } else {
    console.log(chalk.dim('  ✓ integrations.json already exists'));
  }

  // Ask about custom integrations
  console.log('');
  const addCustom = await ask(rl, chalk.green('  ? ') + 'Add custom integration patterns? (y/n): ');

  if (addCustom.toLowerCase() === 'y') {
    console.log(chalk.dim('  Enter package names and their display names. Empty line to finish.\n'));
    const custom = JSON.parse(fs.readFileSync(INTEGRATIONS_FILE, 'utf-8'));

    while (true) {
      const pkg = await ask(rl, chalk.green('  ? ') + 'Package name (or Enter to finish): ');
      if (!pkg) break;

      const name = await ask(rl, chalk.green('  ? ') + 'Display name: ');
      const category = await ask(rl, chalk.green('  ? ') + 'Category (e.g., AI, Database, Cloud): ');

      custom[pkg] = { name: name || pkg, category: category || 'Other' };
      console.log(chalk.green(`  ✓ Added ${pkg}\n`));
    }

    fs.writeFileSync(INTEGRATIONS_FILE, JSON.stringify(custom, null, 2) + '\n');
  }

  // Show shell alias tip
  console.log(chalk.blue.bold('\n  Shell Integration\n'));
  console.log(chalk.white('  Add this to your ~/.zshrc or ~/.bashrc to run the briefing'));
  console.log(chalk.white('  automatically every time you launch Claude Code:\n'));
  console.log(chalk.cyan('    alias claude=\'claude-briefing && command claude\''));
  console.log('');
  console.log(chalk.dim('  Or for npx users:'));
  console.log(chalk.cyan('    alias claude=\'npx claude-session-briefing && command claude\''));
  console.log('');

  console.log(chalk.green.bold('  Setup complete!\n'));

  rl.close();
}
