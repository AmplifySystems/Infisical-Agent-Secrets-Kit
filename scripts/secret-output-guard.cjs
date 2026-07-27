'use strict';

const fs = require('node:fs');

function readInput() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8').trim();
  } catch {
    raw = '';
  }

  if (!raw) return String(process.argv[2] || process.env.SHELL_COMMAND || '');

  try {
    const parsed = JSON.parse(raw);
    return String(parsed?.tool_input?.command || parsed?.command || parsed?.shellCommand || raw);
  } catch {
    return raw;
  }
}

const command = readInput();

const safeNamesOnly = /\binfisical\s+secrets\b.*--json.*\|\s*(python3?|jq)\b.*secretKey/s;
if (safeNamesOnly.test(command)) process.exit(0);

const blocked = [
  /\binfisical\s+secrets\b/,
  /\binfisical\s+export\b/,
  /(^|\s)printenv(\s|$)/,
  /(^|\s)env(\s|$)/,
];

if (!blocked.some((pattern) => pattern.test(command))) process.exit(0);

console.error([
  'BLOCKED by secret-output-guard.',
  'This command can print secret values into terminal output, chat, logs, or model context.',
  '',
  'Use instead:',
  '1. scripts/with-infisical.sh <command>',
  '2. scripts/verify-infisical-safe.sh SECRET_NAME',
  '3. MCP wrappers through scripts/infisical-mcp-launch.sh <server-id>',
].join('\n'));

process.exit(1);

