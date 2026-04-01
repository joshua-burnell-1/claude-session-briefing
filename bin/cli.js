#!/usr/bin/env node
// ABOUTME: Entry point for the claude-briefing CLI tool.
// ABOUTME: Parses flags and runs the briefing or setup flow.

import { printBriefing } from '../lib/briefing.js';
import { runSetup } from '../lib/setup.js';

const args = process.argv.slice(2);
const flag = args[0];

if (flag === '--setup') {
  await runSetup();
} else if (flag === '--help' || flag === '-h') {
  console.log(`
claude-briefing — Session briefing for Claude Code

Usage:
  claude-briefing          Print the session briefing
  claude-briefing --setup  Walk through initial configuration
  claude-briefing --help   Show this help message
`);
} else {
  await printBriefing();
}
