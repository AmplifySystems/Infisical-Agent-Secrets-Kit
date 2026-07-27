---
title: Infisical Cloud Setup for Agent-Safe Secrets
status: active
created: '2026-07-21'
updated: '2026-07-21'
type: runbook
tags:
  - infisical
  - cloud
  - machine-identity
  - universal-auth
---

# Infisical Cloud Setup for Agent-Safe Secrets

This runbook creates a vault where teams can store API keys and let AI agents use them safely through short-lived runtime injection.

## Why Infisical

Use Infisical because API keys are not just configuration. They are authority. A leaked key can send email, read CRM records, spend API credits, deploy apps, mutate databases, or expose customer data.

Infisical gives you:

- One vault for secrets across local development, CI, production, and MCP servers.
- Project, environment, and path scoping.
- Machine identities so applications and agents can authenticate without sharing a human login.
- Short-lived access tokens through Universal Auth.
- A cleaner audit path when a credential needs rotation.

## Recommended Structure

For a client, team, or project repository, start simple:

| Infisical concept | Recommended value |
|-------------------|-------------------|
| Organization | Company or owner name |
| Project | One project per repository or product |
| Environments | `dev`, `staging`, `prod` |
| Secret paths | `/shared`, `/mcp`, `/apps/<app-name>`, `/vendors/<service>` |
| Machine identity | One identity per permission boundary |

Do not create identities per laptop. Create identities by access boundary. For example:

- `local-agent-dev`: local Claude/Codex/Cursor access to `dev` and selected `/mcp` secrets.
- `ci-deploy-prod`: CI/CD access to deploy secrets only.
- `crm-readonly`: CRM read-only automation if the MCP server supports read-only tools.

## Step 1: Create the Infisical Cloud Account

1. Go to https://infisical.com.
2. Sign up or log in.
3. Create or choose an organization.
4. Enable MFA on the human admin account.
5. Create a new **Secrets Management** project for the repository or product.

## Step 2: Create Environments

Create at least:

- `dev`: local development and agent testing.
- `staging`: pre-production integration tests.
- `prod`: production services.

Use `prod` only when the agent truly needs production access. Default new MCP work to `dev` until the workflow is proven.

## Step 3: Create Secret Paths

Inside the project, create folders such as:

```text
/
/shared
/mcp
/apps/web
/vendors/github
/vendors/ghl
/vendors/notion
/vendors/vercel
/vendors/supabase
```

Path-based storage lets each script fetch only the secrets it needs. For example, a GitHub MCP wrapper can use `/vendors/github` while a GHL MCP wrapper can use `/vendors/ghl`.

## Step 4: Add Secrets

Add secrets through the Infisical UI whenever possible. Do not paste values into chat, markdown, MCP config, screenshots, or terminal commands.

Suggested naming pattern:

| Secret name | Purpose |
|-------------|---------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub MCP or repo automation |
| `GHL_API_KEY` | HighLevel private integration token |
| `GHL_LOCATION_ID` | HighLevel sub-account location id |
| `NOTION_API_KEY` | Notion MCP |
| `VERCEL_TOKEN` | Vercel deploy/read access |
| `SUPABASE_ACCESS_TOKEN` | Supabase management/API access |
| `N8N_API_KEY` | n8n Public API access |

Good secret names describe what the value is and which service uses it. Bad secret names are vague, like `TOKEN`, `KEY`, or `SECRET`.

## Step 5: Create a Project-Level Machine Identity

Use project-level identities when each repository should manage its own agent boundary.

1. Open the Infisical project.
2. Go to **Project Settings**.
3. Open **Access Control**.
4. Open **Machine Identities**.
5. Create a machine identity, for example `local-agent-dev`.
6. Assign the least-privilege project role it needs.

If your organization prefers central identities, create an organization-level identity and add it to the project with a project role. The security principle is the same: least privilege by project, environment, and path.

## Step 6: Configure Universal Auth

Universal Auth lets a machine identity exchange a Client ID and Client Secret for a short-lived Infisical access token.

1. Open the machine identity.
2. Enable or edit **Universal Auth**.
3. Choose conservative token settings:
   - Access token TTL: short enough to limit exposure.
   - Access token max TTL: bounded.
   - Client secret TTL or max uses: short-lived where practical.
4. Create a Client Secret.
5. Copy the Client Secret once into a secure local bootstrap location.

The Client ID is not as sensitive as the Client Secret, but still avoid spraying it through docs and chats. The Client Secret is sensitive and must never be committed or pasted into an AI chat.

## Step 7: Install the Infisical CLI

On macOS:

```bash
brew install infisical/get-cli/infisical
```

Then log in for local human use:

```bash
infisical login
```

For automated machine identity use, obtain an access token without printing it into chat or logs. In a real shell, outside AI transcript capture:

```bash
export INFISICAL_TOKEN="$(infisical login --method=universal-auth --client-id='<client-id>' --client-secret='<client-secret>' --silent --plain)"
```

Then run tools with:

```bash
infisical run --projectId='<project-id>' --env=dev --path='/mcp' -- your-command
```

In this kit, prefer `scripts/with-infisical.sh` so commands stay consistent.

## Step 8: Safe Verification

Presence check only:

```bash
scripts/verify-infisical-safe.sh GITHUB_PERSONAL_ACCESS_TOKEN GHL_API_KEY
```

The expected output is only:

```text
GITHUB_PERSONAL_ACCESS_TOKEN: present len=...
GHL_API_KEY: present len=...
```

Never run `infisical secrets` or `infisical export` in an AI-controlled terminal. Those commands can print secret values.

## Source Notes

Infisical documents secret stores as scoped by project, environment, and path. Infisical machine identities can be project-level or organization-level and use Universal Auth to obtain short-lived access tokens.

Official docs:

- https://infisical.com/docs/documentation/platform/secrets-mgmt/overview
- https://infisical.com/docs/documentation/platform/identities/machine-identities
- https://infisical.com/docs/documentation/platform/identities/universal-auth
- https://infisical.com/docs/cli/usage
- https://infisical.com/docs/cli/commands/run
