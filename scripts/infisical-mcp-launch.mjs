#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const kitRoot = resolve(scriptDir, '..');
const manifestPath = process.env.INFISICAL_MCP_MANIFEST || resolve(kitRoot, 'manifests/infisical-mcp-manifest.json');
const serverId = process.argv[2];

if (!serverId) {
  console.error('Usage: infisical-mcp-launch.mjs <server-id>');
  process.exit(64);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.error(`[infisical-mcp-launch] Could not read manifest: ${manifestPath}`);
  console.error(`[infisical-mcp-launch] ${error.message}`);
  process.exit(1);
}

const entry = manifest.servers?.[serverId];
if (!entry) {
  console.error(`[infisical-mcp-launch] Unknown server id: ${serverId}`);
  process.exit(1);
}

if (entry.skip) {
  console.error(`[infisical-mcp-launch] Server skipped: ${serverId}`);
  process.exit(1);
}

const childEnv = { ...process.env };
for (const [targetName, sourceSpec] of Object.entries(entry.env || {})) {
  const match = typeof sourceSpec === 'string' ? sourceSpec.match(/^\$\{([A-Z0-9_]+)\}$/) : null;
  if (match) {
    const sourceName = match[1];
    const value = process.env[sourceName] || '';
    if (!value) {
      console.error(`[infisical-mcp-launch] MISSING Infisical key '${sourceName}' for MCP env '${targetName}'`);
    }
    childEnv[targetName] = value;
  } else {
    childEnv[targetName] = String(sourceSpec);
  }
}

const command = entry.command;
const args = Array.isArray(entry.args) ? entry.args : [];

if (!command) {
  console.error(`[infisical-mcp-launch] Missing command for server: ${serverId}`);
  process.exit(1);
}

const child = spawn(command, args, {
  env: childEnv,
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`[infisical-mcp-launch] Server '${serverId}' exited by signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  console.error(`[infisical-mcp-launch] Failed to start '${serverId}': ${error.message}`);
  process.exit(1);
});

