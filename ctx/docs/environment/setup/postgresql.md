# PostgreSQL Runtime For Mindstream

- Path: `ctx/docs/environment/setup/postgresql.md`
- Changed: `20261120`

## Requirements

The target requires PostgreSQL 16 or later, an application database, a configured schema first in the connection search path, and privileges to manage its tables and constraints. Install pgvector on the server and enable the `vector` extension in the application database before initialization. The extension type must be visible on the application's search path. Initialization fails before writes if the extension is unavailable to the application connection.

Before cutover, confirm that the selected DEM-RDB release supports the required physical foreign-key actions and enum `CHECK` constraints, and validates them when reopening the schema. The target requires the declared cascade behavior and the closed `attention_type` set to be enforced in PostgreSQL for application and direct SQL writes. If either guarantee is unsupported or the existing layout does not match, stop the cutover; do not compensate with weaker application-only validation or automatic DDL repair.

## Backup And Cutover

Before migration, create a separate consistent backup and prove it can be restored in an isolated environment. Preserve the backup and the old runtime until cutover has been verified and accepted. Migration is an explicit maintenance operation: stop writers, preflight the old and new layouts, convert data using an explicit mapping, verify values and constraints, and resume service only after acceptance. On failure, stop and restore the verified backup; never rebuild automatically on startup.

The deployed backup workflow must be adapted to the new connection configuration and verified before deployment of the new runtime. Both legacy and target restores require pgvector on the restore server and the `vector` extension in the restored database.
