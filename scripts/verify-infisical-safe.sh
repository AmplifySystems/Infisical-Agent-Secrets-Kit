#!/usr/bin/env bash
# Verify secret presence without printing secret values.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$#" -eq 0 ]; then
  echo "usage: $0 SECRET_NAME [SECRET_NAME...]" >&2
  exit 64
fi

KEYS="$*" exec "${SCRIPT_DIR}/with-infisical.sh" node -e '
const keys = (process.env.KEYS || "").split(/\s+/).filter(Boolean);
for (const key of keys) {
  const value = process.env[key];
  console.log(`${key}: ${value ? `present len=${value.length}` : "MISSING"}`);
}
'

