---
title: Agent-Safe Secrets Rules
status: active
created: '2026-07-21'
updated: '2026-07-21'
type: policy
tags:
  - secrets
  - ai-agents
  - infisical
  - security
---

# Agent-Safe Secrets Rules

These rules belong in every repository that allows AI agents to run terminal commands, edit MCP configs, or manage API-backed automations.

## Core Rule

Never print, paste, summarize, log, or commit secret values.

Safe:

- Secret names
- Presence or missing status
- Secret value length
- Non-secret project IDs
- Non-secret environment names
- Wrapper script paths

Unsafe:

- API keys
- Client secrets
- Access tokens
- Refresh tokens
- JWTs
- Database URLs with passwords
- Private keys
- Webhook signing secrets
- `.env` dumps
- Screenshots that show tokens

## Blocked Commands

Do not run these in an AI-controlled terminal:

```bash
infisical secrets
infisical export
printenv
env
echo "$SECRET_NAME"
```

These commands can put values into terminal output, which then becomes chat/model context.

## Approved Patterns

Run a command with secrets injected:

```bash
scripts/with-infisical.sh npm run dev
```

Check whether a secret exists:

```bash
scripts/verify-infisical-safe.sh GITHUB_PERSONAL_ACCESS_TOKEN
```

Launch an MCP server:

```bash
scripts/infisical-mcp-launch.sh github-project
```

## MCP Config Law

MCP config may contain:

- MCP server name
- Command path
- Args
- Secret names
- Non-secret IDs

MCP config must not contain:

- API key values
- Client secrets
- Bearer tokens
- Private Integration Tokens
- `.env` content

## If a Secret Appears

1. Stop the command.
2. Do not repeat the value in chat.
3. Record only the secret name and location where it appeared.
4. Rotate or revoke the exposed provider credential.
5. Update Infisical with the new value.
6. Remove the leaked value from local files and git history as needed.
7. Restart any MCP/client process that used the old value.

## Going Further: Credential Brokering (2026-08-05)

Everything above assumes the agent's process env holds the real secret value, and the rule is
"never print it." Infisical's **Agent Proxy** removes that assumption entirely — the agent's
own environment only ever holds a placeholder, and the real value is injected on the outbound
network leg, after it leaves the agent's process. Free for static secrets on any Infisical plan.
Use it for high-blast-radius credentials or less-supervised agents; see
[`AGENT-PROXY-CREDENTIAL-BROKERING.md`](./AGENT-PROXY-CREDENTIAL-BROKERING.md) for setup. This is
additive to everything above, not a replacement — keep following these rules either way.

## Agent Instruction Snippet

Paste this into `AGENTS.md` or `CLAUDE.md`:

```md
## Secrets

Never print, paste, summarize, log, or commit secret values. Use Infisical runtime injection through `scripts/with-infisical.sh` and MCP launchers. Secret names, presence/missing status, and lengths are safe. Raw values are not. Do not run `infisical secrets`, `infisical export`, `printenv`, or `env` in an AI-controlled terminal.
```
