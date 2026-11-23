#!/usr/bin/env bash
set -eo pipefail
umask 077

app_dir=${1:?Provide the Mindstream deployment directory}
backup_dir="$app_dir/var/backups/postgresql"
completion="$backup_dir/mindstream-dem-rdb.completed"

if [[ -e "$completion" ]]; then
  echo 'The Mindstream DEM-RDB migration already completed.' >&2
  exit 1
fi

# shellcheck source=/dev/null
source "$HOME/.nvm/nvm.sh"
nvm use node

require_stopped_workers() {
  pm2 jlist | node --input-type=module -e '
    import { readFileSync } from "node:fs";
    const workers = JSON.parse(readFileSync(0, "utf8")).filter(({ name }) => name === "mindstream-web");
    if (workers.length === 0 || workers.some(({ pm2_env }) => pm2_env.status !== "stopped")) {
      console.error("Stop all mindstream-web workers in PM2 before migrating.");
      process.exitCode = 1;
    }
  '
}

set -a
# shellcheck source=/dev/null
source "$app_dir/prod/.env"
set +a

db_config=TEQFW_DB
if [[ -z "${TEQFW_DB__DATABASE:-}${TEQFW_DB__USER:-}" ]]; then
  db_config=TEQFW_DEM_RDB
fi

db_name="${db_config}__DATABASE"
db_user="${db_config}__USER"
db_host="${db_config}__HOST"
db_port="${db_config}__PORT"
db_password="${db_config}__PASSWORD"
target_path=mindstream_data,public

if [[ "${!db_name:-}" != mindstream ]]; then
  echo 'The deployed database must be mindstream.' >&2
  exit 1
fi
if [[ "${TEQFW_DEM_RDB__SEARCH_PATH:-$target_path}" != "$target_path" ]]; then
  echo "The configured DEM-RDB search path must be $target_path." >&2
  exit 1
fi

export TEQFW_DEM_RDB__CLIENT=pg
export TEQFW_DEM_RDB__DATABASE="${!db_name}"
export TEQFW_DEM_RDB__USER="${!db_user:?The deployed database user is required}"
export TEQFW_DEM_RDB__HOST="${!db_host:-localhost}"
export TEQFW_DEM_RDB__PORT="${!db_port:-5432}"
export TEQFW_DEM_RDB__PASSWORD="${!db_password:-}"
export TEQFW_DEM_RDB__SEARCH_PATH="$target_path"
export PGCONNECT_TIMEOUT=10

connection=(
  --no-password
  --host="$TEQFW_DEM_RDB__HOST"
  --port="$TEQFW_DEM_RDB__PORT"
  --username="$TEQFW_DEM_RDB__USER"
  --dbname="$TEQFW_DEM_RDB__DATABASE"
)

if crontab -l 2>/dev/null | awk '!/^[[:space:]]*#/ && /mindstream/ {found=1} END {exit !found}'; then
  echo 'Pause the deployment account cron jobs for Mindstream before migrating.' >&2
  exit 1
fi

pm2 stop mindstream-web
require_stopped_workers

require_no_other_database_clients() {
  local clients
  clients=$(PGPASSWORD="$TEQFW_DEM_RDB__PASSWORD" psql "${connection[@]}" -XAt --set=ON_ERROR_STOP=1 \
    --command="SELECT count(*) FROM pg_stat_activity
      WHERE datname = current_database() AND backend_type = 'client backend'
      AND pid <> pg_backend_pid() AND usename IS DISTINCT FROM 'agent_ro'")
  if [[ "$clients" != 0 ]]; then
    echo "Found $clients other Mindstream database clients after stopping PM2." >&2
    exit 1
  fi
}

require_no_other_database_clients
install -d -m 700 "$backup_dir"
backup=$(mktemp "$backup_dir/mindstream-pre-dem-rdb.XXXXXXXX.dump.part")
trap 'rm -f -- "$backup"' EXIT
PGPASSWORD="$TEQFW_DEM_RDB__PASSWORD" PGOPTIONS='-c default_transaction_read_only=on' \
  pg_dump "${connection[@]}" --lock-wait-timeout=10s --format=custom --file="$backup"
pg_restore --list "$backup" >/dev/null
pg_restore --file=/dev/null "$backup"
archive=${backup%.part}
mv -- "$backup" "$archive"
echo "Production backup verified and retained at $archive"

require_stopped_workers
require_no_other_database_clients
PGPASSWORD="$TEQFW_DEM_RDB__PASSWORD" psql "${connection[@]}" -X --set=ON_ERROR_STOP=1 \
  --command='CREATE SCHEMA IF NOT EXISTS mindstream_data'
npm run db:migrate-legacy -- --source-schema public
printf '%s\n' "$archive" > "$completion"
echo 'Migration completed. Keep writers stopped until the DEM-RDB release is verified.'
