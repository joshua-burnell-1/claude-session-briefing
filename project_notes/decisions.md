# Decisions

## Read real settings.json structure — 2026-03-31
**What:** Parses both ~/.claude/settings.json and settings.local.json to detect permission mode.
**Why:** Claude Code splits global rules and session-specific rules across two files. Both matter.
**Alternatives considered:** Only reading settings.json (misses local overrides)

## Never show env values — 2026-03-31
**What:** Env scanner shows key names only, never values.
**Why:** Security. The briefing might be visible in terminal history or screen shares.
**Alternatives considered:** Showing masked values (still risky, adds no useful info)

## Auto-learning integrations — 2026-03-31
**What:** Unknown AWS SDK subpackages and MCP-related packages are auto-saved to ~/.claude-briefing/integrations.json.
**Why:** Grows the integration database over time without manual config.
**Alternatives considered:** Static list only (too limited for real-world use)
