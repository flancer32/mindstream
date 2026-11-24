# PostgreSQL Runtime For Mindstream

- Path: `ctx/docs/environment/setup/postgresql.md`
- Changed: `20261124`

## Requirements

The target requires PostgreSQL 16 or later and a dedicated application database. The `public` schema contains the application tables, DEM history, and the `vector` extension. The application role requires usage and creation privileges on `public` and ownership of its tables. Install pgvector on the server and enable it in `public` before initialization. Initialization fails before writes if the extension is unavailable to the application connection.

The application connection uses `TEQFW_DEM_RDB__CLIENT`, `TEQFW_DEM_RDB__HOST`, `TEQFW_DEM_RDB__PORT`, `TEQFW_DEM_RDB__DATABASE`, `TEQFW_DEM_RDB__USER`, `TEQFW_DEM_RDB__PASSWORD`, and `TEQFW_DEM_RDB__SEARCH_PATH=public`.

Before cutover, confirm that the selected DEM-RDB release supports the required physical foreign-key actions and enum `CHECK` constraints, and validates them when reopening the schema. The target requires the declared cascade behavior and the closed `attention_type` set to be enforced in PostgreSQL for application and direct SQL writes. If either guarantee is unsupported or the existing layout does not match, stop the cutover; do not compensate with weaker application-only validation or automatic DDL repair.

## Backup And Cutover

Consolidation of an already migrated database drops the legacy tables, moves the DEM-RDB tables and history into `public`, and removes the empty staging schema in one transaction. Keep pgvector in `public`. Resume background writers after the runtime starts against the consolidated schema and the feed responds.

Before migration, create a separate consistent backup and prove it can be restored in an isolated environment. Preserve the backup and the old runtime until cutover has been verified and accepted. Migration is an explicit maintenance operation: stop writers, preflight the old and new layouts, convert data using an explicit mapping, verify values and constraints, and resume service only after acceptance. On failure, stop and restore the verified backup; never rebuild automatically on startup.

The deployment backup reads connection settings from the previous release. It uses `TEQFW_DEM_RDB__*` when a database name or user is configured in that namespace and otherwise uses `TEQFW_DB__*` for the legacy release. The selected namespace must provide both the database and user. The deployment archive catalog check is separate from the required pre-cutover restore rehearsal. Both legacy and target restores require pgvector on the restore server and the `vector` extension in the restored database. Configure the new runtime with `TEQFW_DEM_RDB__*` before starting it against the verified target.
