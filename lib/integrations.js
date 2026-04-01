// ABOUTME: Detects project integrations from package.json deps and MCP config files.
// ABOUTME: Stores/grows reusable patterns in ~/.claude-briefing/integrations.json.

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import chalk from 'chalk';

const INTEGRATIONS_DIR = path.join(os.homedir(), '.claude-briefing');
const INTEGRATIONS_FILE = path.join(INTEGRATIONS_DIR, 'integrations.json');

const KNOWN_INTEGRATIONS = {
  '@anthropic-ai/sdk': { name: 'Anthropic SDK', category: 'AI' },
  'openai': { name: 'OpenAI', category: 'AI' },
  '@google/generative-ai': { name: 'Google Gemini', category: 'AI' },
  'langchain': { name: 'LangChain', category: 'AI' },
  '@langchain/core': { name: 'LangChain', category: 'AI' },
  'express': { name: 'Express', category: 'Web Framework' },
  'fastify': { name: 'Fastify', category: 'Web Framework' },
  'next': { name: 'Next.js', category: 'Web Framework' },
  'react': { name: 'React', category: 'Frontend' },
  'vue': { name: 'Vue.js', category: 'Frontend' },
  'svelte': { name: 'Svelte', category: 'Frontend' },
  'prisma': { name: 'Prisma', category: 'Database' },
  'mongoose': { name: 'Mongoose/MongoDB', category: 'Database' },
  'pg': { name: 'PostgreSQL', category: 'Database' },
  'redis': { name: 'Redis', category: 'Database' },
  'aws-sdk': { name: 'AWS SDK', category: 'Cloud' },
  '@aws-sdk/client-s3': { name: 'AWS S3', category: 'Cloud' },
  'stripe': { name: 'Stripe', category: 'Payments' },
  'jest': { name: 'Jest', category: 'Testing' },
  'vitest': { name: 'Vitest', category: 'Testing' },
  'mocha': { name: 'Mocha', category: 'Testing' },
  'typescript': { name: 'TypeScript', category: 'Language' },
  'eslint': { name: 'ESLint', category: 'Tooling' },
  'prettier': { name: 'Prettier', category: 'Tooling' },
};

export function detectIntegrations(dir) {
  const found = [];

  // Scan package.json
  const pkgPath = path.join(dir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      const customPatterns = loadCustomPatterns();
      const allPatterns = { ...KNOWN_INTEGRATIONS, ...customPatterns };

      for (const dep of Object.keys(allDeps)) {
        if (allPatterns[dep]) {
          found.push(allPatterns[dep]);
        }
      }

      // Learn new deps for next time
      learnNewDeps(allDeps, allPatterns);
    } catch {
      // malformed package.json
    }
  }

  // Check for MCP config
  const mcpPaths = [
    path.join(dir, '.mcp.json'),
    path.join(dir, 'mcp.json'),
    path.join(os.homedir(), '.claude', 'mcp.json'),
  ];

  for (const mcpPath of mcpPaths) {
    if (fs.existsSync(mcpPath)) {
      try {
        const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
        const servers = mcp.mcpServers || mcp.servers || {};
        for (const name of Object.keys(servers)) {
          found.push({ name: `MCP: ${name}`, category: 'MCP Server' });
        }
      } catch {
        // malformed mcp config
      }
    }
  }

  // Dedupe by name
  const seen = new Set();
  return found.filter((i) => {
    if (seen.has(i.name)) return false;
    seen.add(i.name);
    return true;
  });
}

export function renderIntegrations(integrations) {
  if (integrations.length === 0) {
    return chalk.dim('  Integrations: None detected');
  }

  const lines = [chalk.bold('  Integrations')];

  const byCategory = {};
  for (const i of integrations) {
    if (!byCategory[i.category]) byCategory[i.category] = [];
    byCategory[i.category].push(i.name);
  }

  for (const [category, names] of Object.entries(byCategory)) {
    lines.push(chalk.cyan(`    ${category}: `) + chalk.white(names.join(', ')));
  }

  return lines.join('\n');
}

function loadCustomPatterns() {
  try {
    return JSON.parse(fs.readFileSync(INTEGRATIONS_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function learnNewDeps(deps, knownPatterns) {
  const custom = loadCustomPatterns();
  let updated = false;

  for (const dep of Object.keys(deps)) {
    if (knownPatterns[dep] || custom[dep]) continue;

    // Auto-categorize common patterns
    if (dep.startsWith('@aws-sdk/')) {
      custom[dep] = { name: `AWS ${dep.replace('@aws-sdk/client-', '')}`, category: 'Cloud' };
      updated = true;
    } else if (dep.includes('mcp') || dep.includes('model-context')) {
      custom[dep] = { name: dep, category: 'MCP Server' };
      updated = true;
    }
  }

  if (updated) {
    if (!fs.existsSync(INTEGRATIONS_DIR)) {
      fs.mkdirSync(INTEGRATIONS_DIR, { recursive: true });
    }
    fs.writeFileSync(INTEGRATIONS_FILE, JSON.stringify(custom, null, 2) + '\n');
  }
}
