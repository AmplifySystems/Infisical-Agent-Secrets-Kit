---
title: External Security Inputs
status: active
created: '2026-07-21'
updated: '2026-07-21'
type: intake
tags:
  - security
  - external-repos
  - review
  - public-repo
---

# External Security Inputs

Use this when someone shares a security-focused GitHub repository that may improve this kit.

## Current Candidate

| Source | Status | Next step |
|--------|--------|-----------|
| External security repo | URL pending | Review once repository URL is available |

Before publishing this kit as a public repo, either remove private names from this table or confirm the person or organization is comfortable being credited.

## Intake Rules

Do not copy external code or policies blindly. Security repos are useful, but they can also bring stale assumptions, unnecessary complexity, or patterns that do not fit agent-controlled terminal sessions.

For each external repo:

1. Record the repository URL.
2. Check license compatibility.
3. Read the README and security model.
4. Identify specific ideas to adopt, adapt, or reject.
5. Inspect scripts before running anything.
6. Do not run installer scripts until reviewed.
7. Do not copy secret examples with real-looking values.
8. Prefer small, auditable additions over wholesale import.

## Evaluation Checklist

| Question | Adopt if |
|----------|----------|
| Does it prevent secret values from entering stdout, chat, logs, or git? | Yes, directly and simply |
| Does it support least privilege? | Yes, by project/environment/path or role |
| Does it work for AI agents and MCP servers? | Yes, without relying on human-only memory |
| Does it avoid leaking through examples? | Yes, placeholders only |
| Is the code understandable enough to maintain? | Yes, short scripts or well-documented tooling |
| Is the license compatible with public distribution? | Yes |

## Suggested Integration Pattern

Use three buckets:

- **Adopt:** copy the idea or code with attribution and license compliance.
- **Adapt:** rewrite the idea in this kit's simpler wrapper style.
- **Reject:** document why it does not fit, especially if it could print secrets or overcomplicate onboarding.

## Attribution Template

```md
## External Security References

- `<repo-name>` by `<author/org>`: `<url>`
  - License:
  - Adopted:
  - Adapted:
  - Notes:
```
