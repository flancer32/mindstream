# PostgreSQL Runtime For Mindstream

- Path: `ctx/docs/environment/setup/postgresql.md`
- Changed: `20261120`

## Requirements

The target requires PostgreSQL 16 or later, an application database, a configured schema first in the connection search path, and privileges to manage its tables and constraints. DEM-RDB stores vectors as JSON-serialized text; installing or enabling `pgvector` is not required for the target. The legacy database and its backup still require the extension until conversion and rollback obligations have ended. Native `vector(N)` storage is a separate opt-in capability, not part of the current migration procedure; do not convert columns based on its availability.

Before cutover, confirm that the selected DEM-RDB release supports the required physical foreign-key actions and enum `CHECK` constraints, and validates them when reopening the schema. The target requires the declared cascade behavior and the closed `attention_type` set to be enforced in PostgreSQL for application and direct SQL writes. If either guarantee is unsupported or the existing layout does not match, stop the cutover; do not compensate with weaker application-only validation or automatic DDL repair.

## Backup And Cutover

Before migration, create a separate consistent backup and prove it can be restored in an isolated environment. Preserve the backup and the old runtime until cutover has been verified and accepted. Migration is an explicit maintenance operation: stop writers, preflight the old and new layouts, convert data using an explicit mapping, verify values and constraints, and resume service only after acceptance. On failure, stop and restore the verified backup; never rebuild automatically on startup.

The deployed backup workflow must be adapted to the new connection configuration and verified before deployment of the new runtime. Restore procedures must include any extensions required by the backup being restored. Remove pgvector only after all dependent objects and rollback requirements have been checked.
