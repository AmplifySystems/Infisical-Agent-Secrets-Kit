#!/usr/bin/env bash
# Run a command with Infisical secrets injected into the child process.
# This file must never contain secret values.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ENV_FILE="${SCRIPT_DIR}/infisical-project.env"

if [ -f "${PROJECT_ENV_FILE}" ]; then
  # Non-secret settings only: project id, env, path, domain.
  # shellcheck source=/dev/null
  source "${PROJECT_ENV_FILE}"
fi

INFISICAL_BIN="${INFISICAL_BIN:-infisical}"
INFISICAL_ENV="${INFISICAL_ENV:-dev}"
INFISICAL_SECRET_PATH="${INFISICAL_SECRET_PATH:-/}"

if [ -z "${INFISICAL_PROJECT_ID:-}" ]; then
  echo "Missing INFISICAL_PROJECT_ID. Set it in scripts/infisical-project.env or the shell." >&2
  exit 64
fi

if [ "$#" -eq 0 ]; then
  echo "usage: $0 <command> [args...]" >&2
  exit 64
fi

DOMAIN_ARGS=()
if [ -n "${INFISICAL_API_URL:-}" ]; then
  DOMAIN_ARGS=(--domain "${INFISICAL_API_URL}")
fi

exec "${INFISICAL_BIN}" run \
  "${DOMAIN_ARGS[@]}" \
  --env="${INFISICAL_ENV}" \
  --projectId="${INFISICAL_PROJECT_ID}" \
  --path="${INFISICAL_SECRET_PATH}" \
  --silent \
  -- "$@"

