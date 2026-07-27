---
title: MCP Setup for Claude Code, Codex, and Cursor
status: active
created: '2026-07-21'
updated: '2026-07-21'
type: runbook
tags:
  - mcp
  - infisical
  - claude-code
  - codex
  - cursor
---

# MCP Setup for Claude Code, Codex, and Cursor

There are two Infisical-related MCP patterns. Keep them separate.

## Pattern 1: Infisical Docs MCP

This is a public hosted MCP endpoint from Infisical:

```text
https://infisical.com/docs/mcp
```

Use it when you want an AI agent to search current Infisical documentation. It does not expose private secrets and does not require an Infisical account.

Claude Code:

```bash
claude mcp add --transport http Infisical https://infisical.com/docs/mcp
```

Cursor `mcp.json`:

```json
{
  "mcpServers": {
    "Infisical Docs": {
      "url": "https://infisical.com/docs/mcp"
    }
  }
}
```

VS Code `.vscode/mcp.json`:

```json
{
  "servers": {
    "Infisical Docs": {
      "type": "http",
      "url": "https://infisical.com/docs/mcp"
    }
  }
}
```

## Pattern 2: Secret-Backed MCP Servers

This is for tools like GitHub, GHL, Supabase, Notion, Vercel, Slack, or n8n. The MCP server receives its API keys as environment variables, but those values come from Infisical at process start.

Architecture:

```text
AI MCP config
  -> scripts/infisical-mcp-launch.sh <server-id>
    -> infisical run --projectId ... --env ... --path ...
      -> scripts/infisical-mcp-launch.mjs <server-id>
        -> actual MCP server process with env values injected
```

The MCP client config contains no secrets. The manifest contains no secrets. Infisical contains the values.

## Setup Files

1. Copy `scripts/infisical-project.env.example` to `scripts/infisical-project.env`.
2. Set non-secret values only:

```bash
INFISICAL_PROJECT_ID="your-project-id"
INFISICAL_ENV="dev"
INFISICAL_SECRET_PATH="/mcp"
INFISICAL_API_URL="https://app.infisical.com"
```

3. Ensure `scripts/infisical-project.env` is gitignored.
4. Copy `manifests/infisical-mcp-manifest.example.json` to `manifests/infisical-mcp-manifest.json`.
5. Add server definitions using secret names only.

Example manifest entry:

```json
{
  "servers": {
    "github-project": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

The left side is what the MCP server expects. The right side is the Infisical secret name.

## Claude Code Project Scope

For team-shared MCP tool definitions, Claude Code supports project-scoped `.mcp.json` files. Put wrapper commands there, not secret values.

Use `templates/mcp/claude-code.project.mcp.json` as the starting point.

Example:

```json
{
  "mcpServers": {
    "github-project": {
      "command": "./scripts/infisical-mcp-launch.sh",
      "args": ["github-project"],
      "env": {}
    }
  }
}
```

Claude Code prompts before using project-scoped MCP servers from version-controlled `.mcp.json` files. That approval is good friction.

## Codex Local Config

Codex MCP settings are local user configuration. Keep project-specific MCP definitions in local config or a non-secret example file. Do not commit real user config.

Template:

```toml
[mcp_servers.github_project]
command = "/absolute/path/to/repo/scripts/infisical-mcp-launch.sh"
args = ["github-project"]
```

Use `templates/mcp/codex.config.toml.example` as the reference.

## Cursor MCP Config

Cursor can use a project or user `mcp.json`. Keep real local `mcp.json` gitignored and commit only `mcp.json.example`.

Example:

```json
{
  "mcpServers": {
    "github-project": {
      "command": "/absolute/path/to/repo/scripts/infisical-mcp-launch.sh",
      "args": ["github-project"],
      "env": {}
    }
  }
}
```

Use `templates/mcp/cursor.mcp.json.example` as the reference.

## Safe Testing

Test Infisical injection:

```bash
scripts/verify-infisical-safe.sh GITHUB_PERSONAL_ACCESS_TOKEN
```

Test an MCP launch only when the secret is present:

```bash
scripts/with-infisical.sh node scripts/infisical-mcp-launch.mjs github-project
```

Do not run commands that print the raw environment or dump secret values.

## Source Notes

Official references:

- Infisical Docs MCP: https://infisical.com/docs/ai/model-context-protocol
- Infisical CLI `run`: https://infisical.com/docs/cli/commands/run
- Claude Code MCP scopes: https://code.claude.com/docs/en/mcp
