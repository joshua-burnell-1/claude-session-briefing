# claude-session-briefing

A CLI tool that prints a structured security and context briefing at the start of every Claude Code session.

## Why I built this

Claude Code is powerful — it can read files, run commands, manage git, and interact with APIs. But that power comes with responsibility. Every session starts with no visibility into what permissions are active, what secrets are exposed, or what integrations are in play.

This tool gives you a 2-second briefing before you start working: what mode you're in, what keys are in scope, what tools are connected, and which model to use. Think of it as a preflight checklist for AI-assisted development.

## What it shows

```
  ┌──────────────────────────────────────────────────────┐
  │           Claude Code Session Briefing                │
  └──────────────────────────────────────────────────────┘

  Permission Mode: PERMISSIVE
  You're in a permissive setup — Claude can read files freely and run
  pre-approved commands, but will ask for new ones.
  Web access: enabled
  Rules: 3 global, 48 local
  ──────────────────────────────────────────────────────────
  Security Reminder
  Read each permission request before approving. Watch for:
    • Commands that delete files or modify git history
    • Commands that send data to external services
  ──────────────────────────────────────────────────────────
  Env Scan
  .env:
    • ANTHROPIC_API_KEY [value hidden]
    • STRIPE_SECRET_KEY [value hidden]
  ──────────────────────────────────────────────────────────
  Integrations
    AI: Anthropic SDK
    Web Framework: Express
    Database: PostgreSQL
    MCP Server: MCP: github, MCP: slack
  ──────────────────────────────────────────────────────────
  Model Recommendations

    Quick tasks (questions, small edits, lookups)
      claude-haiku-4-5-20251001 — fast, cheap, good enough

    Deep coding (complex features, refactoring, debugging)
      claude-sonnet-4-20250514 — best balance of speed and quality

    Long agentic runs (multi-step workflows, architecture, research)
      claude-opus-4-20250514 — strongest reasoning, highest context utilization
```

## Install

```bash
npm install -g claude-session-briefing
```

## Usage

### Print the briefing

```bash
claude-briefing
```

### Initial setup

```bash
claude-briefing --setup
```

Creates `~/.claude-briefing/` and lets you add custom integration patterns.

## Auto-run on every Claude session

Add this alias to your `~/.zshrc` or `~/.bashrc`:

```bash
# Run briefing before every Claude Code session
alias claude='claude-briefing && command claude'
```

Then reload your shell:

```bash
source ~/.zshrc
```

Now every time you type `claude`, you'll see the briefing first.

### Alternative: npx (no global install)

```bash
alias claude='npx claude-session-briefing && command claude'
```

## Custom integrations

The tool auto-detects common packages, but you can teach it new ones. Custom patterns are stored in `~/.claude-briefing/integrations.json` and persist across sessions.

Add them via `--setup` or edit the file directly:

```json
{
  "my-internal-sdk": {
    "name": "Internal Platform SDK",
    "category": "Platform"
  }
}
```

The tool also auto-learns AWS SDK subpackages and MCP-related packages it hasn't seen before.

## What it detects

**Permission modes:**
- **Default** — Claude asks before everything
- **Read-only** — Claude can read/search files, asks before commands
- **Permissive** — pre-approved commands + file access
- **Dangerous** — Claude can run anything without asking

**Env files scanned:** `.env`, `.env.local`, `.env.development`, `.env.production`

**Integration sources:** `package.json` (dependencies + devDependencies), `.mcp.json`, `mcp.json`

## License

MIT
