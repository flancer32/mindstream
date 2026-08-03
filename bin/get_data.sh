#!/usr/bin/env sh
set -e

# Absolute path to the directory containing this script.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Project root.
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "== Mindstream data update started =="
echo "Project root: $PROJECT_ROOT"
echo

step () {
  echo ">> $1"
}

run () {
  (
    cd "$PROJECT_ROOT"
    npm exec -- teq "$@"
  )
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
