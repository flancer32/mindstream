# Code Storage Layer — Schema Declaration

- Path: `ctx/docs/code/storage/schema.md`
- Changed: `20261123`

## Model

The canonical logical schema is a reproducible DEM 2 Format 2 descriptor, normally `etc/dem-schema.json`, composed with the DEM infrastructure descriptor through supported acquisition and compilation. The host supplies trusted package information for reserved `/dem/` entities. Host maps use their separate Format 1 contract. The schema declares attributes, identity profiles, keys, relations and indexes supported by DEM; physical layout and lifecycle belong to DEM-RDB.

The effective declaration must be independent of runtime state and identify attributes, nullability, primary and unique keys, relations and necessary indexes. Identifier strategies distinguish internal generated identifiers from external stable identifiers. Required integrity constraints must be enforced in storage, not replaced solely with application logic; unsupported declarations are a blocker requiring an explicit resolution. Do not implicitly provision PostgreSQL extensions or infer data conversions.

DEM paths contain lowercase alphanumeric segments, and DEM-RDB maps path segments to underscore-separated table names; columns use attribute names. Explicitly map the existing physical layout during migration. Preserve uniqueness, referential integrity, cascade behavior and the closed attention type set. Confirm that the selected DEM and adapter contracts enforce each required constraint; fail preflight if they cannot, rather than silently weakening it. Keep legacy `schema_version` as migration input, not the target history authority.

Declare the required referential actions through Format 2 `onDelete` and `onUpdate`. All six domain foreign keys cascade on update. Deleting a source with publications is restricted. Deleting a publication cascades to extractions, summaries, embeddings, and attention. Deleting an anonymous identity cascades to its attention rows. SQL constraints must admit only the declared enum alternatives for non-null values, respecting attribute nullability for all writers. On history-managed reopen, validate physical FK actions and enum constraints against the selected model before permitting writes. Missing or divergent enforcement blocks cutover. Initialization leaves incompatible layouts untouched.

The selected adapter must enforce the required referential actions and closed attention type set for every write path, including application-owned SQL. Repository validation alone is insufficient. Do not assume that altering adapter-owned constraints is supported; verify compatibility with its layout validation before cutover.

Numeric identity and reference values use DEM's normalized string representation and PostgreSQL `bigint`. Use DEM-RDB repository generation for generated IDs. Application-owned SQL writing those entities must supply IDs consistent with the selected allocation contract. Preserve existing externally visible numeric identifiers where conversion is exact and safe. Reject unsafe conversion at the API boundary.

DEM-RDB stores datetime values as text in PostgreSQL. Use canonical UTC values with six fractional digits where represented by the schema. Preserve the original instant and stored precision during migration, including microseconds. Queries that compare datetime values or use them in a cursor must use the same canonical representation.

Declare both publication embedding attributes as `teqfw.dem_rdb.vector` with `dimensions: 1536`. Register the DEM-RDB type definition before compiling the model and bind its handler to the DEM runtime before opening the adapter. PostgreSQL stores both attributes as native pgvector `vector(1536)` columns. The adapter rejects malformed vectors and explicitly rounds components to float32 on write, which can lose precision relative to JavaScript numbers. On reopen, validate the physical type and dimension before writes.

During explicit migration, preserve the order and stored float32 value of every legacy component. Verify both vectors through the target DEM-RDB codec against the original stored values. Compare values at float32 precision if the source is read through pgvector's decimal text output. Measure target size and query performance on representative data before cutover.

## History And Migration

An empty target scope establishes `/dem/snapshot` and `/dem/application` history through DEM-RDB initialization before migrated application rows are loaded. Existing incompatible or unconfirmed layouts fail fast; ordinary application startup does not rebuild, migrate or modify them. A separate explicit cutover procedure requires an independently restorable backup, preflight, explicit mapping and conversion, constraint and data checks, and a tested rollback. Isolate the target schema and verify its search path and full table set; row counts alone are insufficient evidence of equivalence.
