# Code Storage Layer — Overview

- Path: `ctx/docs/code/storage/overview.md`
- Changed: `20261124`

## Boundary

The server-side storage layer realizes the existing PostgreSQL Storage contour without changing product behavior. Browser state remains in `localStorage`; DEM-IDB is outside this scope.

The storage layer introduces no architectural contour or data flow. It provides reproducible schema and persistence operations for canonical entities, but does not interpret attention signals or form the personal feed. Normal operation preserves the architecture's monotonic storage behavior. Destructive schema operations are explicit maintenance actions, never automatic runtime behavior.

## Persistence And Access

The host composes Format 2 declarations using `@teqfw/dem` 2.x and initializes `@teqfw/dem-rdb` 2.x with the PostgreSQL driver. DEM-RDB owns the shared Knex client, schema lifecycle, and connection disposal; the host loads CFG before initialization and closes the backend before disconnecting. The package configuration namespace is `TEQFW_DEM_RDB`.

Use DEM Repository and atomic Batch for operations their contracts express. Application-owned PostgreSQL queries may borrow the package-owned client for operations such as joins, anti-joins, cursor pagination and conflict handling that cannot be expressed correctly or efficiently through those contracts. Keep this boundary specific to application queries; do not construct another connection or introduce a generic adapter.

Publication embeddings use the DEM-RDB vector extension with native PostgreSQL storage. The [schema declaration](schema.md) defines the type, dimensions, and precision contract. The API, feed ordering, identity and attention semantics remain unchanged.

## Lifecycle And Safety

Initialize an empty scope with the compiled application and DEM infrastructure entities. DEM-RDB records and validates model history in `/dem/snapshot` and `/dem/application`; a different, incomplete, or incompatible layout fails visibly. Initialization must not automatically rebuild or migrate persistent data.

Focused tests cover essential contracts; critical flows require real isolated PostgreSQL verification. Schema details are defined in [schema.md](schema.md).
