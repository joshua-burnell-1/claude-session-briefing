// ABOUTME: Scans .env and .env.local files in the current directory.
// ABOUTME: Lists detected API key names only — never exposes values.

import * as fs from 'node:fs';
import * as path from 'node:path';
import chalk from 'chalk';

const ENV_FILES = ['.env', '.env.local', '.env.development', '.env.production'];

const KEY_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /token/i,
  /password/i,
  /credential/i,
  /auth/i,
  /private[_-]?key/i,
  /access[_-]?key/i,
  /client[_-]?id/i,
  /client[_-]?secret/i,
];

export function scanEnvFiles(dir) {
  const results = [];

  for (const envFile of ENV_FILES) {
    const filePath = path.join(dir, envFile);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    const keys = [];

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;

      const keyName = trimmed.slice(0, eqIndex).trim();
      const isSensitive = KEY_PATTERNS.some((p) => p.test(keyName));

      if (isSensitive) {
        keys.push(keyName);
      }
    }

    if (keys.length > 0) {
      results.push({ file: envFile, keys });
    }
  }

  return results;
}

export function renderEnvScan(results) {
  if (results.length === 0) {
    return chalk.dim('  Env Scan: No .env files with API keys detected');
  }

  const lines = [chalk.bold('  Env Scan')];

  for (const { file, keys } of results) {
    lines.push(chalk.white(`  ${file}:`));
    for (const key of keys) {
      lines.push(chalk.yellow(`    • ${key}`) + chalk.dim(' [value hidden]'));
    }
  }

  return lines.join('\n');
}
