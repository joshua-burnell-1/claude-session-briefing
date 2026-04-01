// ABOUTME: Reads Claude Code permission mode from settings.json and settings.local.json.
// ABOUTME: Returns a plain-English explanation of the current permission posture.

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import chalk from 'chalk';

const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const SETTINGS_LOCAL_PATH = path.join(os.homedir(), '.claude', 'settings.local.json');

export function detectPermissions() {
  const settings = readJson(SETTINGS_PATH);
  const localSettings = readJson(SETTINGS_LOCAL_PATH);

  const globalAllows = settings?.permissions?.allow || [];
  const localAllows = localSettings?.permissions?.allow || [];
  const allAllows = [...globalAllows, ...localAllows];

  const hasDangerousSkip = settings?.skipDangerousModePermissionPrompt === true;
  const hasBashWildcard = allAllows.some((p) => p === 'Bash(*)' || p === 'Bash(**)');
  const hasBashCommands = allAllows.some((p) => p.startsWith('Bash('));
  const hasReadGlob = allAllows.some((p) => p.startsWith('Read(') || p.startsWith('Glob(') || p.startsWith('Grep('));
  const hasWebAccess = allAllows.some((p) => p.startsWith('WebFetch') || p.startsWith('WebSearch'));

  let mode;
  let explanation;

  if (hasBashWildcard) {
    mode = 'dangerousMode';
    explanation = "You're in dangerous mode — Claude can run any shell command without asking.";
  } else if (hasBashCommands && hasReadGlob) {
    mode = 'permissive';
    explanation = "You're in a permissive setup — Claude can read files freely and run pre-approved commands, but will ask for new ones.";
  } else if (hasReadGlob && !hasBashCommands) {
    mode = 'readOnly';
    explanation = "You're in read-only mode — Claude can read and search files but will ask before running any commands.";
  } else {
    mode = 'default';
    explanation = "You're in default mode — Claude will ask before running any command or reading files.";
  }

  return {
    mode,
    explanation,
    globalAllowCount: globalAllows.length,
    localAllowCount: localAllows.length,
    hasDangerousSkip,
    hasWebAccess,
  };
}

export function renderPermissions(perms) {
  const lines = [];

  const modeColors = {
    dangerousMode: chalk.red.bold,
    permissive: chalk.yellow.bold,
    readOnly: chalk.cyan.bold,
    default: chalk.green.bold,
  };

  const modeLabels = {
    dangerousMode: 'DANGEROUS',
    permissive: 'PERMISSIVE',
    readOnly: 'READ-ONLY',
    default: 'DEFAULT',
  };

  const colorFn = modeColors[perms.mode] || chalk.white;
  lines.push(chalk.bold('  Permission Mode: ') + colorFn(modeLabels[perms.mode]));
  lines.push(chalk.white(`  ${perms.explanation}`));

  if (perms.hasWebAccess) {
    lines.push(chalk.dim('  Web access: enabled'));
  }

  lines.push(chalk.dim(`  Rules: ${perms.globalAllowCount} global, ${perms.localAllowCount} local`));

  return lines.join('\n');
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}
