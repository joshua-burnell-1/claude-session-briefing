// ABOUTME: Unit tests for permissions, env scanner, and integrations modules.
// ABOUTME: Tests core detection logic without side effects.

import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { scanEnvFiles } from '../lib/env-scanner.js';
import { detectIntegrations } from '../lib/integrations.js';

// --- Env scanner tests ---

const testDir = path.join(os.tmpdir(), 'briefing-test-' + Date.now());
fs.mkdirSync(testDir, { recursive: true });

// Test with sensitive keys
fs.writeFileSync(path.join(testDir, '.env'), `
ANTHROPIC_API_KEY=sk-ant-1234
DATABASE_URL=postgres://localhost/db
STRIPE_SECRET_KEY=sk_live_1234
APP_NAME=my-app
AWS_ACCESS_KEY_ID=AKIA1234
`);

const envResults = scanEnvFiles(testDir);
assert.strictEqual(envResults.length, 1, 'should find one env file');
assert.strictEqual(envResults[0].file, '.env');

const keyNames = envResults[0].keys;
assert(keyNames.includes('ANTHROPIC_API_KEY'), 'should detect ANTHROPIC_API_KEY');
assert(keyNames.includes('STRIPE_SECRET_KEY'), 'should detect STRIPE_SECRET_KEY');
assert(keyNames.includes('AWS_ACCESS_KEY_ID'), 'should detect AWS_ACCESS_KEY_ID');
assert(!keyNames.includes('DATABASE_URL'), 'should not flag DATABASE_URL');
assert(!keyNames.includes('APP_NAME'), 'should not flag APP_NAME');

// Test with no env files
const emptyDir = path.join(os.tmpdir(), 'briefing-empty-' + Date.now());
fs.mkdirSync(emptyDir, { recursive: true });
assert.strictEqual(scanEnvFiles(emptyDir).length, 0, 'should return empty for no env files');

// --- Integrations tests ---

// Test package.json detection
fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
  dependencies: {
    '@anthropic-ai/sdk': '^0.81.0',
    'express': '^4.18.0',
    'pg': '^8.11.0',
  },
  devDependencies: {
    'jest': '^29.0.0',
    'typescript': '^5.0.0',
  },
}));

const integrations = detectIntegrations(testDir);
const names = integrations.map((i) => i.name);
assert(names.includes('Anthropic SDK'), 'should detect Anthropic SDK');
assert(names.includes('Express'), 'should detect Express');
assert(names.includes('PostgreSQL'), 'should detect PostgreSQL');
assert(names.includes('Jest'), 'should detect Jest');
assert(names.includes('TypeScript'), 'should detect TypeScript');

// Test MCP detection
fs.writeFileSync(path.join(testDir, '.mcp.json'), JSON.stringify({
  mcpServers: {
    'github': { command: 'gh-mcp' },
    'slack': { command: 'slack-mcp' },
  },
}));

const withMcp = detectIntegrations(testDir);
const mcpNames = withMcp.map((i) => i.name);
assert(mcpNames.includes('MCP: github'), 'should detect GitHub MCP server');
assert(mcpNames.includes('MCP: slack'), 'should detect Slack MCP server');

// Cleanup
fs.rmSync(testDir, { recursive: true });
fs.rmSync(emptyDir, { recursive: true });

console.log('All tests passed!');
