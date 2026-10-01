#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$DIR")"

export PYTHONPATH="$ROOT"
export DATABASE_PATH="${DATABASE_PATH:-$ROOT/data/overcyber.db}"
export API_PORT="${API_PORT:-8800}"
export API_HOST="${API_HOST:-192.168.10.14}"

exec python3 -m uvicorn fastapi_service.main:app --host "$API_HOST" --port "$API_PORT" --log-level info
