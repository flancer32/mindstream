# Code Storage Layer — Schema Declaration

- Path: `ctx/docs/code/storage/schema.md`
- Changed: `20261124`

## Model

The canonical logical schema is a reproducible DEM 2 Format 2 descriptor, normally `etc/dem-schema.json`, composed with the DEM infrastructure descriptor through supported acquisition and compilation. The host supplies trusted package information for reserved `/dem/` entities. Host maps use their separate Format 1 contract. The schema declares attributes, identity profiles, keys, relations and indexes supported by DEM; physical layout and lifecycle belong to DEM-RDB.

## Physical Layout

| DEM logical type | DEM-RDB PostgreSQL type / representation |
|---|---|
| `identity` / `ref` with `int`, `large` profile | `bigint`; repository IDs are decimal strings |
| `string` / `text` | `text` |
| `boolean` | `integer`, encoded as `0` or `1` |
| closed `enum` | `text` with a validated CHECK constraint |
| UTC `datetime`, precision 6 | canonical UTC `text` with six fractional digits |
| `teqfw.dem_rdb.vector`, dimensions 1536 | native pgvector `vector(1536)`; writes round to float32 |

The effective declaration must be independent of runtime state and identify attributes, nullability, primary and unique keys, relations and necessary indexes. Identifier strategies distinguish internal generated identifiers from external stable identifiers. Required integrity constraints must be enforced in storage, not replaced solely with application logic; unsupported declarations are a blocker requiring an explicit resolution. Do not implicitly provision PostgreSQL extensions or infer data conversions.

DEM paths contain lowercase alphanumeric segments. DEM-RDB joins the segments with underscores to form PostgreSQL table names and uses attribute names for columns.

Declare the required referential actions through Format 2 `onDelete` and `onUpdate`. All six domain foreign keys cascade on update. Deleting a source with publications is restricted. Deleting a publication cascades to extractions, summaries, embeddings, and attention. Deleting an anonymous identity cascades to its attention rows. SQL constraints must admit only the declared enum alternatives for non-null values, respecting attribute nullability for all writers. On history-managed reopen, validate physical FK actions and enum constraints against the selected model before permitting writes. Initialization leaves incompatible layouts untouched.

The selected adapter must enforce the required referential actions and closed attention type set for every write path, including application-owned SQL. Repository validation alone is insufficient. Do not assume that altering adapter-owned constraints is supported; verify compatibility with its layout validation before changing the schema.

Numeric identity and reference values use DEM's normalized string representation and PostgreSQL `bigint`. Use DEM-RDB repository generation for generated IDs. Application-owned SQL writing those entities must supply IDs consistent with the selected allocation contract. Preserve existing externally visible numeric identifiers where conversion is exact and safe. Reject unsafe conversion at the API boundary.

DEM-RDB stores datetime values as text in PostgreSQL. Use canonical UTC values with six fractional digits where represented by the schema. Queries that compare datetime values or use them in a cursor must use the same canonical representation.

The publication feed orders by `rss_published_at` descending and then `id` descending. Its next-page cursor carries the exact canonical publication timestamp and ID, and the query uses both values to continue after ties without losing microsecond precision.

Declare both publication embedding attributes as `teqfw.dem_rdb.vector` with `dimensions: 1536`. Register the DEM-RDB type definition before compiling the model and bind its handler to the DEM runtime before opening the adapter. PostgreSQL stores both attributes as native pgvector `vector(1536)` columns. The adapter rejects malformed vectors and explicitly rounds components to float32 on write, which can lose precision relative to JavaScript numbers. On reopen, validate the physical type and dimension before writes.

The feed API reads pgvector values through an application-owned PostgreSQL query. Normalize these components to float32 before exposing them so the API preserves the stored vector values represented by DEM-RDB reads.

## Schema History

DEM-RDB initializes `/dem/snapshot` and `/dem/application` in an empty scope. Reopening an incompatible or unconfirmed layout fails visibly and leaves it untouched.
