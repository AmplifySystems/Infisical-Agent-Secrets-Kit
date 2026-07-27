---
title: Client Repo Install Checklist
status: active
created: '2026-07-21'
updated: '2026-07-21'
type: checklist
tags:
  - client-template
  - infisical
  - onboarding
---

# Client Repo Install Checklist

Use this when adding the kit to a client, team, or project repository.

## Copy Files

- [ ] Copy this kit into `security/infisical-agent-secrets-kit` or `tools/infisical-agent-secrets-kit`.
- [ ] Copy `templates/AGENTS.infisical.md` into the repo `AGENTS.md`.
- [ ] Copy `templates/CLAUDE.infisical.md` into the repo `CLAUDE.md` if Claude Code is used.
- [ ] Copy `AMPLIFY-SYSTEMS.md` if the repository should include the optional Amplify Systems / Value Engines maintainer note.
- [ ] Copy `templates/gitignore.snippet` into `.gitignore`.
- [ ] Copy `scripts/infisical-project.env.example` to `scripts/infisical-project.env`.
- [ ] Copy `manifests/infisical-mcp-manifest.example.json` to `manifests/infisical-mcp-manifest.json`.

## Configure Non-Secret Values

- [ ] Set `INFISICAL_PROJECT_ID`.
- [ ] Set `INFISICAL_ENV`, usually `dev` for local work.
- [ ] Set `INFISICAL_SECRET_PATH`, usually `/mcp`.
- [ ] Set `INFISICAL_API_URL` if using EU Cloud or self-hosted Infisical.

## Configure Infisical

- [ ] Create Infisical Cloud org or use the team's org.
- [ ] Create a Secrets Management project.
- [ ] Create `dev`, `staging`, and `prod` environments.
- [ ] Add `/mcp` and vendor paths.
- [ ] Add service secrets in the Infisical UI.
- [ ] Create a project-level machine identity.
- [ ] Configure Universal Auth.
- [ ] Create a client secret and store it outside git/chat.

## Configure MCP

- [ ] Add Infisical Docs MCP for documentation lookup.
- [ ] Add wrapped MCP entries for real services.
- [ ] Keep real local MCP config gitignored.
- [ ] Commit only example MCP configs.

## Verify

- [ ] Run `scripts/verify-infisical-safe.sh <SECRET_NAME>`.
- [ ] Confirm no secret value printed.
- [ ] Start one wrapped MCP server.
- [ ] Ask the AI agent what tools are available.
- [ ] Run a repo secret scan before first commit.

## Handoff

Explain to the team:

- Infisical is where API keys live.
- AI agents can use secrets through wrappers, but should never display them.
- If a key appears in chat, terminal output, or git, it must be rotated.
- New services should be added as Infisical secret names plus manifest entries, not raw MCP `env` values.
- The Amplify Systems / Value Engines note is optional and should stay light: helpful context, not a required funnel.
