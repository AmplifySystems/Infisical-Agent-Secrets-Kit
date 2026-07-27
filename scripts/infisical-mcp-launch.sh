#!/usr/bin/env bash
# Launch an MCP server through Infisical runtime injection.
# Usage: scripts/infisical-mcp-launch.sh <server-id>
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ID="${1:?Usage: scripts/infisical-mcp-launch.sh <server-id>}"

exec "${SCRIPT_DIR}/with-infisical.sh" node "${SCRIPT_DIR}/infisical-mcp-launch.mjs" "${SERVER_ID}"

