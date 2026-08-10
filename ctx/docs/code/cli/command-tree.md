# Code CLI — Command Tree

- Path: `ctx/docs/code/cli/command-tree.md`
- Template Version: `20260619`
- Changed: `20260810`

## Purpose

This document defines the canonical space of allowed CLI commands for the Mindstream backend application. It specifies command hierarchy, purpose, and input form. It is normative, and CLI code must match this registry.

## Command Registry

```text
db:schema:create
db:schema:migrate-v2
db:schema:renew
ingest:discover:habr
ingest:extract:habr
process:generate:embeddings
process:generate:summaries
fl32:web:start
```

Commands absent from this hierarchy are invalid.

## Command Registry

### `db:schema:create`

Contour: maintenance.

Purpose: create the application data schema in an empty database.

Parameters: none.

Constraints:

- assumes an empty database;
- creates only DB structure such as tables, indexes, and constraints;
- is not idempotent;
- does not run migrations;
- is not used in runtime.

### `db:schema:migrate-v2`

Contour: maintenance.

Purpose: migrate the restored legacy Mindstream schema to the canonical DEM v2 contract in the configured database.

Parameters: none.

Constraints:

- operates in exactly one configured PostgreSQL database;
- acquires a transaction-scoped advisory lock and performs the transition atomically;
- validates the legacy table set, data values, pgvector dimensions, constraints, and row counts before recording success;
- adds only the explicitly specified missing constraint and does not infer renames, conversions, or deletions;
- records the compiled DEM v2 declaration and fingerprint in `schema_version` only after validation;
- is idempotent and leaves no partial migration state on failure;
- does not authorize a production cutover.

### `db:schema:renew`

Contour: maintenance.

Purpose: fully recreate the application data schema with a best-effort attempt to preserve existing data.

Parameters: none.

Constraints:

- destructive, non-interactive operation without confirmations;
- works with exactly one database from application configuration;
- recreates the schema only from `Mindstream_Back_Storage_Schema`;
- records the new schema in `schema_version` after successful creation;
- during data transfer, matches tables and columns by name, drops extra structures, and attempts type conversion;
- if data restoration fails, the command ends with error and no partial success.

### `ingest:discover:habr`

Contour: ingest.

Purpose: discover publications from the Habr RSS feed and register them as known publications without loading text and without starting processing.

Parameters: none.

Constraints:

- uses a hardcoded Habr RSS source URL;
- performs only discovery;
- does not fetch HTML;
- does not extract publication text;
- is idempotent;
- may be rerun without changing the result;
- does not start processing and does not affect runtime.

### `ingest:extract:habr`

Contour: ingest.

Purpose: fetch Habr publication HTML and extract Markdown text within the ingestion contour without starting later processing stages.

Parameters: none.

Constraints:

- extracts Markdown only for publications awaiting extraction;
- stores HTML and Markdown as temporary ingestion artifacts;
- uses Habr-specific extraction;
- is idempotent and may be rerun without changing the result;
- does not start processing and does not affect runtime.

### `process:generate:embeddings`

Contour: processing (engineering).

Purpose: compute publication embeddings from already generated semantic representations, overview and annotation, for every publication whose embeddings are still missing.

Parameters: none.

Constraints:

- processes only publications that already have **both** Markdown artifacts, overview and annotation;
- computes exactly two embeddings: one for the Markdown overview and one for the Markdown annotation;
- the only text sources are the Markdown overview and Markdown annotation stored in the database;
- is strictly idempotent and does not recompute existing embeddings;
- the result is canonical and immutable in the MVP;
- recomputation for already processed publications is prohibited;
- on failure, the command logs the error, moves the publication to an error state, and blocks it from runtime;
- publications without **both** successful embeddings are not ready and do not participate in runtime;
- the command does not start runtime or later processing stages;
- the command is non-interactive and accepts no input parameters.

### `process:generate:summaries`

Contour: processing (engineering).

Purpose: generate publication semantic representations, overview and annotation, for all publications where those representations do not yet exist.

Parameters: none.

Constraints:

- processes **only** publications that do not yet have annotation and overview;
- generation is based **strictly on normalized publication Markdown**;
- the source of the publication does not influence the result;
- for one publication, **both** artifacts are always generated: overview first, then annotation within the same LLM dialogue;
- the result is canonical and immutable in the MVP;
- regeneration for already processed publications is prohibited;
- on failure, the command logs the error, moves the publication to an error state, and prevents it from entering the user feed;
- publications without successful annotation and overview are not ready and do not participate in runtime;
- the command does not start embeddings, runtime, or other later stages;
- the command is non-interactive and accepts no input parameters.

### `fl32:web:start`

Contour: runtime.

Purpose: start the backend application in web-server runtime mode through the dependency-owned Teq Web command.

Parameters: none.

Constraints:

- is not a result-bearing operation;
- does not imply normal completion;
- is not used in the maintenance contour.

## General CLI Command Invariants

Command selection uses the complete colon-delimited `id` as its sole public name. No command path, tree traversal, or space-separated command form exists.

For all application CLI commands:

- commands are strictly non-interactive;
- commands are deterministic under fixed environment and data;
- commands run in a trusted contour;
- commands do not terminate the process directly.

## Document Boundary

This document does not describe command business logic, execution algorithms, side effects, code implementation, internal service-call order, or output format. Any change to CLI command space requires explicit change to this document.
