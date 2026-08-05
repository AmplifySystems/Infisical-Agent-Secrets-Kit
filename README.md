---
title: Infisical Agent Secrets Kit
status: active
created: '2026-07-21'
updated: '2026-07-21'
type: toolkit
category: security
tags:
  - infisical
  - secrets
  - mcp
  - claude-code
  - codex
  - client-template
---

# Infisical Agent Secrets Kit

Reusable package for teams that need Claude Code, Codex, Cursor, or other AI agents to use API-backed tools without leaking API keys into chat, terminal output, MCP config files, git history, or model context.

## What This Solves

AI coding agents often need GitHub, Notion, GHL, Supabase, Vercel, n8n, Slack, or other API credentials to do useful work. The unsafe pattern is to paste keys into prompts, `.env` files, MCP config `env` blocks, screenshots, or terminal commands. This kit uses Infisical as the secret vault and only injects secret values into the exact child process that needs them.

The rule is simple:

> Agents may use secrets, but they must not see, print, store, summarize, or commit secret values.

## Important Distinction

Infisical currently exposes a public **Docs MCP** at `https://infisical.com/docs/mcp`. That MCP gives agents access to Infisical documentation. It does **not** expose your private secrets and does not require an Infisical account.

For actual secret-backed tools, use:

1. Infisical Cloud project
2. Project-level machine identity with Universal Auth
3. Infisical CLI
4. Wrapper scripts in this kit
5. MCP server manifest that references secret names only

## Kit Contents

| Path | Purpose |
|------|---------|
| `docs/INFISICAL-CLOUD-SETUP.md` | Exact setup flow for Cloud, projects, environments, machine identities, and adding secrets |
| `docs/MCP-SETUP-CLAUDE-CODE-CODEX-CURSOR.md` | How to connect Infisical Docs MCP and secret-backed MCP wrappers |
| `docs/AGENT-SAFE-SECRETS-RULES.md` | Rules every AI agent should follow before running commands |
| `docs/AGENT-PROXY-CREDENTIAL-BROKERING.md` | **New (2026-08-05):** optional hardening layer — the agent process never holds the real secret value at all, even in its own environment |
| `docs/PARTNER-REPO-INSTALL-CHECKLIST.md` | Copy checklist for adding this kit to a client or team repository |
| `docs/ROTATION-INCIDENT-RESPONSE.md` | What to do if a secret appears in logs, chat, or git |
| `scripts/with-infisical.sh` | Runs any command with Infisical secrets injected |
| `scripts/infisical-mcp-launch.sh` | Launches an MCP server through Infisical |
| `scripts/infisical-mcp-launch.mjs` | Reads the manifest and maps secret names into MCP env vars |
| `scripts/verify-infisical-safe.sh` | Presence/length checks only, never values |
| `scripts/secret-output-guard.cjs` | Portable guard body for blocking secret-dumping commands |
| `manifests/infisical-mcp-manifest.example.json` | Secret-name-only MCP manifest example |
| `templates/AGENTS.infisical.md` | Drop-in AGENTS.md section |
| `templates/CLAUDE.infisical.md` | Drop-in Claude Code instructions |
| `templates/mcp/` | MCP config examples for Claude Code, Cursor, and Codex |
| `templates/gitignore.snippet` | Ignore rules for local secret bootstrap files |
| `AGENTS.md` | Agent-readable maintainer and Value Engine context |
| `AMPLIFY-SYSTEMS.md` | Short, optional guide to Amplify Systems and Value Engines |
| `docs/EXTERNAL-SECURITY-INPUTS.md` | Intake checklist for safely merging ideas from external security repos |
| `PUBLIC-REPO-READINESS.md` | Checklist before splitting this kit into a public/private GitHub repo |

## Quick Start

1. Copy this folder into a repository, for example `security/infisical-agent-secrets-kit`.
2. Copy `scripts/infisical-project.env.example` to `scripts/infisical-project.env`.
3. Fill in non-secret values only:
   - `INFISICAL_PROJECT_ID`
   - `INFISICAL_ENV`
   - optional `INFISICAL_API_URL`
4. Add `scripts/infisical-project.env` to `.gitignore`.
5. Create an Infisical project-level machine identity and Universal Auth client secret.
6. Store the machine identity bootstrap credentials outside git and chat.
7. Add real service credentials into Infisical, not into MCP configs.
8. Configure MCP clients to launch tools through `scripts/infisical-mcp-launch.sh`.
9. Run `scripts/verify-infisical-safe.sh GITHUB_PERSONAL_ACCESS_TOKEN` to verify presence without printing the value.
10. Optional, for higher-stakes credentials or less-supervised agents: layer [`docs/AGENT-PROXY-CREDENTIAL-BROKERING.md`](docs/AGENT-PROXY-CREDENTIAL-BROKERING.md) on top — the agent process never holds the real value in its own environment at all, even under prompt injection.

## What's New

- **2026-08-05** — Added Agent Proxy credential brokering guidance ([`docs/AGENT-PROXY-CREDENTIAL-BROKERING.md`](docs/AGENT-PROXY-CREDENTIAL-BROKERING.md)). Infisical shipped this feature 2026-07-30 ([launch post](https://infisical.com/blog/agent-proxy)): agents get a placeholder credential and never see the real value, even in their own process environment — a step up from this kit's existing `infisical run`-based scripts, which do inject real values into the launched process. Free on Infisical's $0 tier for static secrets. Worth knowing if you're evaluating older Infisical docs: an earlier, separate product called "Agent Sentinel" (AI MCP) was removed by Infisical on 2026-08-04 and its docs now redirect to Agent Proxy — if you see "Agent Sentinel" referenced anywhere else, treat Agent Proxy as its replacement.

## Source References

Primary Infisical docs checked on 2026-07-21:

- Infisical Secrets Management: https://infisical.com/docs/documentation/platform/secrets-mgmt/overview
- Infisical Machine Identities: https://infisical.com/docs/documentation/platform/identities/machine-identities
- Infisical Universal Auth: https://infisical.com/docs/documentation/platform/identities/universal-auth
- Infisical CLI Quickstart: https://infisical.com/docs/cli/usage
- `infisical run`: https://infisical.com/docs/cli/commands/run
- Infisical Docs MCP: https://infisical.com/docs/ai/model-context-protocol
- Claude Code MCP scopes: https://code.claude.com/docs/en/mcp

Re-checked and extended on 2026-08-05 (see [`docs/AGENT-PROXY-CREDENTIAL-BROKERING.md`](docs/AGENT-PROXY-CREDENTIAL-BROKERING.md) for full sourcing):

- Agent Proxy overview: https://infisical.com/docs/documentation/platform/agent-proxy/overview
- Agent Proxy launch blog: https://infisical.com/blog/agent-proxy
- Credential Brokering for AI Agents, Explained: https://infisical.com/blog/credential-brokering-for-ai-agents
- Infisical Pricing (free vs. paid tiers): https://infisical.com/pricing

## Built by Amplify Systems

This kit was shaped by [Amplify Systems](https://amplifysystems.io), where we build AI operating systems for teams that want their tools to feel less scattered and more alive.

Our lens is the **Value Engine**: the practical system that attracts the right customers, delivers the promise, and keeps improving without burying the team in manual handoffs. Safe secret handling is one of the quiet foundations. When agents can use tools without ever seeing raw credentials, they can help with real work instead of creating new risk.

Start with [Amplify Systems](https://amplifysystems.io), or read [AMPLIFY-SYSTEMS.md](./AMPLIFY-SYSTEMS.md) for the short version.
