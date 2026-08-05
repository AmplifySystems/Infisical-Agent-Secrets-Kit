---
title: Agent Proxy — Credential Brokering (Agents Never See Real Values)
status: active
created: '2026-08-05'
updated: '2026-08-05'
type: reference
tags:
  - infisical
  - secrets
  - ai-agents
  - agent-proxy
  - agent-vault
  - security
---

# Agent Proxy — Credential Brokering

The rest of this kit (`scripts/with-infisical.sh`, `scripts/infisical-mcp-launch.sh`) uses Infisical's
`infisical run` pattern: it decrypts a secret and injects the **real value** as an environment
variable into the child process. That process — your MCP server, your agent's tool call — can then
read its own environment and see the real credential. This has always been safe against secrets
leaking into chat, logs, or git, because the value never has to be printed. It is not safe against
the agent process itself being tricked (prompt injection, a compromised dependency, a debug command)
into reading and exfiltrating its own environment.

Infisical shipped a genuinely different answer to that specific problem: **the agent process never
holds the real value at all.**

## Two products, know which one you're reaching for

| | Agent Vault | Agent Proxy |
|---|---|---|
| What it is | Standalone open-source project (own GitHub repo, own binary/Docker image) | A feature built into the Infisical platform + CLI |
| License / cost | MIT, fully free, self-hosted, no Infisical account needed | Static-secret brokering is free on Infisical's $0 Free tier; dynamic-secret brokering is paid-tier ("coming soon") |
| Status | **Research preview** — "active development, API subject to change" (Infisical's own words) | General availability, 2026-07-30 |
| Use when | You don't want any dependency on an Infisical account/project at all | You're already using Infisical Secrets Management (which this kit assumes) |

**For this kit, Agent Proxy is the relevant one** — it layers directly on top of the machine
identity + project + environment setup this kit already has you build in
[`INFISICAL-CLOUD-SETUP.md`](./INFISICAL-CLOUD-SETUP.md). Agent Vault is a legitimate alternative if
you specifically want zero dependency on Infisical Cloud/self-hosted at all; it's mentioned in
[Sources](#sources) below for that case but not covered step-by-step here.

## How it works, in one paragraph

Instead of decrypting a secret into the agent's own environment, Agent Proxy hands the agent a
**placeholder value** (e.g. a fake `ghp_…` string) and points its outbound HTTPS traffic at a local
proxy (`HTTPS_PROXY`). The proxy terminates TLS, swaps the placeholder for the real credential
**only on the outbound leg** — after the request has already left the agent's process — and forwards
it to the real API. The response comes back to the agent normally. At no point does the agent's
process memory, environment, or any log it could print contain the real value. Full mechanical
write-up, with full source citations, is in the Sources section at the bottom of this doc.

This is an **additive** layer, not a replacement for the rest of this kit. Keep `infisical run` /
`scripts/with-infisical.sh` for trusted processes (deploy scripts, CI). Reach for Agent Proxy
specifically for the launch command of an agentic process you want extra isolation on — a Claude
Code, Cursor, or Codex session, or an MCP server that's reachable by an LLM's tool calls.

## When to actually reach for this vs. plain `infisical run`

Use plain `scripts/with-infisical.sh` (this kit's default, already covers the "never print/log/commit
a value" threat model) when:
- The agent session is one you're driving interactively and trust to behave.
- You've already applied the [Agent-Safe Secrets Rules](./AGENT-SAFE-SECRETS-RULES.md) (blocked
  commands, MCP config law) — that's still the right first line of defense for most work.

Add Agent Proxy on top when any of these are true:
- The agent will process untrusted content (scraped web pages, third-party file uploads, another
  agent's output) that could carry a prompt injection trying to get it to read/print `$SECRET_NAME`.
- The credential is high-blast-radius (org-wide GitHub token, production API key) and you want a
  hard technical guarantee, not just a documented rule, that the agent process can't leak it.
- You're standing up a persistent, less-supervised agent (a scheduled job, a bot, a Hermes-style
  always-on service) where nobody is watching the terminal in real time.

## Setup — local proxy (matches "your own dev machine running Claude Code/Cursor")

Prerequisites: an Infisical project (Free tier is enough), the Infisical CLI, and on Linux,
`bubblewrap` (macOS uses its built-in sandbox — nothing extra to install).

```bash
# One-time, in the Infisical dashboard for this project:
#   1. Store the real credential as a normal secret (e.g. GITHUB_PAT in /coding-agent)
#   2. Add a "Proxied Service" — pick a built-in template (GitHub, Slack, etc.) or Custom

infisical login
infisical secrets agent-proxy run --projectId=<project-id> --env=dev --path=/coding-agent -- claude
```

This starts the proxy, sandboxes the launched process, and sets a placeholder into its env instead
of the real value. First run on macOS prompts once for your password (to trust the proxy's local
CA). The proxy tears down when the agent exits.

## Setup — standalone proxy (matches "a shared or production agent host")

Two **separate** machine identities, deliberately least-privilege split — the proxy identity can
read real secrets, the agent identity cannot:

```bash
# On the proxy host — Agent Proxy identity, "Agent Proxy Policies" permission template
export INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=<agent-proxy-client-id>
export INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=<agent-proxy-client-secret>
infisical secrets agent-proxy start        # listens on port 17322

# On the agent host — separate Agent identity, "Agent Policies" permission template
export INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=<agent-client-id>
export INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=<agent-client-secret>
export INFISICAL_PROJECT_ID=<project-id>
export INFISICAL_ENVIRONMENT=dev
export INFISICAL_SECRET_PATH=/coding-agent
export INFISICAL_AGENT_PROXY_ADDRESS=<proxy-host>:17322
infisical secrets agent-proxy connect -- claude
```

Keep the proxy identity's credentials only on the proxy host, and the agent identity's credentials
only on the agent host — that separation is the actual security boundary, not just the sandbox.

## Verify it's working (without ever seeing the real value)

```bash
infisical secrets agent-proxy run --projectId=<project-id> --env=dev --path=/coding-agent -- \
  sh -c 'curl -sS https://api.github.com/user -H "Authorization: Bearer $GITHUB_TOKEN"'
```
The call should succeed (proving the real credential was injected on the outbound leg) while
`$GITHUB_TOKEN` inside that shell only ever holds the placeholder — confirm with
`scripts/verify-infisical-safe.sh` patterns, never by printing it directly.

## Known limitations (Infisical's own documentation)

- Dynamic-secrets brokering through Agent Proxy is not shipped yet ("Coming soon", paid tiers only)
  — static secrets (API keys, tokens) work today on any plan including Free.
- `HTTPS_PROXY` is a courtesy signal an agent could unset — the real guarantee comes from running
  the proxy on a separate host with the agent having no other egress path. For a single local dev
  machine, the OS sandbox (macOS built-in, `bubblewrap` on Linux) is what actually enforces it.
- Standalone mode burns 2 of the Free tier's 5 identity seats per deployed agent (one proxy identity,
  one agent identity) — budget for this if rolling out to several always-on agents.

## Adoption status in this kit

This doc is guidance, not yet a wrapped script. `scripts/with-infisical.sh` and
`scripts/infisical-mcp-launch.sh` still use the `infisical run` pattern by default. A
`scripts/with-agent-proxy.sh` wrapper mirroring those two is a reasonable next addition once this
has been validated end-to-end against a real MCP server launch — tracked as open work, not claimed
as done here.

## Sources

- [Agent Proxy — Overview](https://infisical.com/docs/documentation/platform/agent-proxy/overview)
- [Agent Proxy — Quickstart: local proxy](https://infisical.com/docs/documentation/platform/agent-proxy/quickstart/local-proxy)
- [Agent Proxy — Quickstart: standalone proxy](https://infisical.com/docs/documentation/platform/agent-proxy/quickstart/standalone-proxy)
- [Agent Proxy — Proxied Services](https://infisical.com/docs/documentation/platform/agent-proxy/proxied-services)
- [Agent Proxy launch blog](https://infisical.com/blog/agent-proxy)
- [Credential Brokering for AI Agents, Explained](https://infisical.com/blog/credential-brokering-for-ai-agents)
- [Agent Vault (standalone OSS alternative) — GitHub](https://github.com/Infisical/agent-vault)
- [Agent Vault launch blog](https://infisical.com/blog/agent-vault-the-open-source-credential-proxy-and-vault-for-agents)
- [Infisical Pricing](https://infisical.com/pricing)
