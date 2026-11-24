#!/usr/bin/env bash
set -euo pipefail
umask 077

app_dir=$(realpath "${1:?Provide the Mindstream deployment directory}")
sql="$(dirname "${BASH_SOURCE[0]}")/consolidate-postgresql.sql"
prod="$app_dir/prod"
backup_dir="$app_dir/var/backups/postgresql"
[[ -r "$sql" && -x "$prod/node_modules/.bin/teq" ]]

# shellcheck source=/dev/null
source "$HOME/.nvm/nvm.sh"
nvm use node
for command in crontab curl flock pg_dump pg_restore pm2 psql; do
  command -v "$command" >/dev/null || {
    echo "Required command is missing: $command" >&2
    exit 1
  }
done

# Load the deployed connection settings in a subshell when invoking PostgreSQL.
database() (
  local command=$1
  shift
  # shellcheck source=/dev/null
  source "$prod/.env"
  [[ "${TEQFW_DEM_RDB__DATABASE:-}" == mindstream ]] || {
    echo 'The deployed database must be mindstream.' >&2
    exit 1
  }
  export PGPASSWORD="${TEQFW_DEM_RDB__PASSWORD:-}" PGCONNECT_TIMEOUT=10
  "$command" --no-password --dbname=mindstream --username="${TEQFW_DEM_RDB__USER:?}" \
    --host="${TEQFW_DEM_RDB__HOST:-localhost}" --port="${TEQFW_DEM_RDB__PORT:-5432}" "$@"
)

db_state() {
  database psql -XAt --set=ON_ERROR_STOP=1 --command="
    SELECT CASE
      WHEN to_regclass('mindstream_data.dem_application') IS NOT NULL
        AND to_regclass('public.dem_application') IS NULL THEN 'before'
      WHEN to_regnamespace('mindstream_data') IS NULL
        AND to_regclass('public.dem_application') IS NOT NULL THEN 'after'
      ELSE 'unexpected'
    END"
}

install -d -m 700 "$backup_dir"
exec 9>"$backup_dir/consolidate-postgresql.lock"
flock -n 9
[[ "$(db_state)" == before ]] || {
  echo 'Expected the two-schema DEM-RDB deployment.' >&2
  exit 1
}

maintenance=$(mktemp -d "$backup_dir/mindstream-pre-public.XXXXXXXX")
echo "Maintenance files: $maintenance"
install -m 600 "$prod/.env" "$maintenance/env.before"
next_env=$(mktemp "$prod/.env.public.XXXXXXXX")
sed -E '/^[[:space:]]*(export[[:space:]]+)?TEQFW_DEM_RDB__SEARCH_PATH[[:space:]]*=/d' \
  "$maintenance/env.before" > "$next_env"
printf '\nTEQFW_DEM_RDB__SEARCH_PATH=public\n' >> "$next_env"

cron_paused=false
web_stopped=false
ddl_started=false
cleanup() {
  local status=$?
  if (( status == 0 )); then return; fi
  if $ddl_started && [[ "$(db_state)" != before ]]; then
    echo "Check PostgreSQL and the deployed search path before resuming jobs. Recovery files: $maintenance" >&2
    return
  fi
  unlink "$next_env" || echo "Remove the unused generated configuration at $next_env." >&2
  if $web_stopped; then
    pm2 restart mindstream-web || echo 'Restart mindstream-web manually.' >&2
  fi
  if $cron_paused; then
    crontab "$maintenance/crontab.before" || echo "Restore $maintenance/crontab.before manually." >&2
  fi
}
trap cleanup EXIT

if LC_ALL=C crontab -l > "$maintenance/crontab.before" 2> "$maintenance/crontab.error"; then
  awk '
    !/^[[:space:]]*#/ && tolower($0) ~ /mindstream/ {print "# PostgreSQL maintenance: " $0; next}
    {print}
  ' "$maintenance/crontab.before" > "$maintenance/crontab.paused"
  sed 's/^# DEM-RDB maintenance: //' "$maintenance/crontab.before" > "$maintenance/crontab.after"
  cron_paused=true
  crontab "$maintenance/crontab.paused"
elif ! grep -q '^no crontab for ' "$maintenance/crontab.error"; then
  echo 'Unable to read the deployment crontab.' >&2
  exit 1
fi

web_stopped=true
pm2 stop mindstream-web
require_idle_database() {
  local clients
  clients=$(database psql -XAt --set=ON_ERROR_STOP=1 --command="
    SELECT count(*) FROM pg_stat_activity
    WHERE datname = current_database() AND backend_type = 'client backend'
      AND pid <> pg_backend_pid() AND usename IS DISTINCT FROM 'agent_ro'")
  if [[ "$clients" != 0 ]]; then
    echo "Found $clients other Mindstream database clients. Wait for running jobs to finish." >&2
    exit 1
  fi
}
require_idle_database

PGOPTIONS='-c default_transaction_read_only=on' database pg_dump \
  --lock-wait-timeout=10s --format=custom --file="$maintenance/mindstream.dump.part"
pg_restore --file=/dev/null "$maintenance/mindstream.dump.part"
mv -- "$maintenance/mindstream.dump.part" "$maintenance/mindstream.dump"
require_idle_database

ddl_started=true
database psql -X --set=ON_ERROR_STOP=1 --single-transaction --file="$sql"
mv -- "$next_env" "$prod/.env"

TEQFW_DEM_RDB__SEARCH_PATH=public pm2 restart mindstream-web --update-env
(
  # shellcheck source=/dev/null
  source "$prod/.env"
  curl --fail --silent --show-error --output /dev/null --max-time 10 \
    --retry 10 --retry-delay 2 --retry-connrefused \
    "http://127.0.0.1:${TEQFW_WEB__PORT:-3000}/api/feed"
)
pm2 jlist | node --input-type=module -e '
  import {readFileSync} from "node:fs";
  const workers = JSON.parse(readFileSync(0, "utf8")).filter(({name}) => name === "mindstream-web");
  if (!workers.length || workers.some(({pm2_env}) => pm2_env.status !== "online")) {
    throw new Error("Mindstream PM2 workers must be online before resuming cron.");
  }
'
pm2 save
if $cron_paused; then
  crontab "$maintenance/crontab.after"
fi
echo "Mindstream now uses public. Backup: $maintenance/mindstream.dump"
