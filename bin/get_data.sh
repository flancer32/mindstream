#!/usr/bin/env sh
set -e

# Абсолютный путь к каталогу, где лежит этот скрипт (bin/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Корень проекта
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

NODE_BIN="node"
APP_BIN="$SCRIPT_DIR/app.mjs"

echo "== Mindstream data update started =="
echo "Project root: $PROJECT_ROOT"
echo

step () {
  echo ">> $1"
}

run () {
  "$NODE_BIN" "$APP_BIN" "$@"
}

step "Ingest: discover publications (Habr RSS)"
run ingest:discover:habr
echo

step "Ingest: extract publication content"
run ingest:extract:habr
echo

step "Processing: generate summaries"
run process:generate:summaries
echo

step "Processing: generate embeddings"
run process:generate:embeddings
echo

echo "== Mindstream data update finished successfully =="
