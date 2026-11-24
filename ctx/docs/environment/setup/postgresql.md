# PostgreSQL Runtime For Mindstream

- Path: `ctx/docs/environment/setup/postgresql.md`
- Changed: `20261124`

## Requirements

The target requires PostgreSQL 16 or later and a dedicated application database. The `public` schema contains the application tables, DEM history, and the `vector` extension. The application role requires usage and creation privileges on `public` and ownership of its tables. Install pgvector on the server and enable it in `public` before initialization. Initialization fails before writes if the extension is unavailable to the application connection.

The application connection uses `TEQFW_DEM_RDB__CLIENT`, `TEQFW_DEM_RDB__HOST`, `TEQFW_DEM_RDB__PORT`, `TEQFW_DEM_RDB__DATABASE`, `TEQFW_DEM_RDB__USER`, `TEQFW_DEM_RDB__PASSWORD`, and `TEQFW_DEM_RDB__SEARCH_PATH=public`.

PostgreSQL must enforce the declared foreign-key actions and closed `attention_type` set for all writers. DEM-RDB verifies those constraints when reopening the schema and rejects incompatible layouts before writes.

## Backups

Deployment creates a PostgreSQL dump using the previous release's `TEQFW_DEM_RDB__*` connection settings and checks its archive catalog. Restore drills use an isolated database with pgvector available.
