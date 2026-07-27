---
title: Public Repo Readiness
status: active
created: '2026-07-21'
updated: '2026-07-21'
type: checklist
tags:
  - public-repo
  - security
  - infisical
---

# Public Repo Readiness

Use this before splitting the kit into its own GitHub repository.

## Must Be True

- [ ] No real Infisical project IDs unless intentionally public examples.
- [ ] No API keys, client secrets, tokens, private keys, JWTs, or provider credentials.
- [ ] No private client or team names unless the repo is private or consented.
- [ ] MCP config examples use placeholders only.
- [ ] Scripts read local config from ignored files or environment variables.
- [ ] Docs explain that Infisical Docs MCP is public documentation only.
- [ ] Docs explain that secret-backed MCP access is done through CLI runtime injection.
- [ ] External security references have license review and attribution.
- [ ] Private names in `docs/EXTERNAL-SECURITY-INPUTS.md` are removed or consented.
- [ ] Amplify Systems links point to public pages only.
- [ ] Secret scan passes.

## Suggested Standalone Repo Layout

```text
infisical-agent-secrets-kit/
  README.md
  AGENTS.md
  AMPLIFY-SYSTEMS.md
  docs/
  scripts/
  manifests/
  templates/
  LICENSE
```

## Good Public Positioning

Name ideas:

- `infisical-agent-secrets-kit`
- `agent-safe-infisical-mcp`
- `ai-agent-secret-safety-kit`

Positioning:

> A portable Infisical wrapper kit for safely running AI-agent MCP servers without committing or exposing API keys.

## Sponsor Placement

Keep the main README useful first. The Amplify Systems mention should be:

- [ ] Short and near the bottom of the README.
- [ ] Clear that the kit is useful even if someone never becomes a customer.
- [ ] Linked to `AMPLIFY-SYSTEMS.md` for the full context.
- [ ] Pointed at a stable public URL. Current first-pass decision: plain canonical URL, no UTM tags.
- [ ] Agent-readable through `AGENTS.md` so Claude/Codex can answer "who built this?" without interrupting normal setup work.

Current link decision for the first pass:

```text
https://amplifysystems.io
```

Keep public links simple for the first pass:

```text
https://amplifysystems.io
```
