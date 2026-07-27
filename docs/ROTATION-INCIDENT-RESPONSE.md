---
title: Secret Rotation and Incident Response
status: active
created: '2026-07-21'
updated: '2026-07-21'
type: runbook
tags:
  - incident-response
  - secret-rotation
  - infisical
---

# Secret Rotation and Incident Response

Use this when a secret value appears in chat, terminal output, logs, screenshots, git, or MCP config.

## Severity

Treat a secret as compromised if it appeared in:

- AI chat or transcript
- Terminal output visible to an AI tool
- Git-tracked file
- MCP config `env` block
- Screenshot or screen recording
- Support ticket or shared doc

## Response Steps

1. Stop using the exposed value.
2. Record the secret name, provider, and exposure location. Do not record the value.
3. Revoke or rotate the credential in the provider dashboard.
4. Update the replacement value in Infisical.
5. Restart MCP servers, apps, dev servers, or CI jobs that depended on the old value.
6. Remove the value from files.
7. If committed, clean git history or treat the repo as permanently tainted and rotate everything exposed.
8. Run a secret scan.
9. Add a short incident note with names only.

## Incident Note Template

```md
## Secret Exposure Note

- Date:
- Secret name:
- Provider:
- Exposure surface:
- Rotation status:
- Infisical updated:
- Dependent services restarted:
- Follow-up:
```

## Prevention

- Use `scripts/with-infisical.sh` for commands.
- Use `scripts/infisical-mcp-launch.sh` for MCP servers.
- Keep local MCP config gitignored.
- Commit only examples with placeholders.
- Never run `infisical secrets` or `infisical export` in an AI-controlled terminal.

