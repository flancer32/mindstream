# Code Storage Layer — Schema Declaration

- Path: `ctx/docs/code/storage/schema.md`
- Template Version: `20260619`
- Changed: `20260810`

## Purpose

This document defines the **normative form of declarative schema description** for the DB layer of the Mindstream MVP.

The data schema is treated as the **canonical source of truth** for relational database structure and is used by both agents and the DB layer for reproducible creation, recreation, and evolution of storage structure.

This document describes the **schema meta-level**: allowed declaration form, required elements, invariants, and responsibility boundaries. It does not introduce concrete entities or tables.

## Schema As The Source Of Truth

The declarative schema is the **only source of truth** for database structure.

The declaration must explicitly describe:

- tables;
- columns and their types;
- primary keys;
- foreign keys;
- unique constraints;
- `NOT NULL` and `CHECK` constraints;
- indexes.

Any structure present in the database but absent from the declaration is a defect.

Manual modification of the schema without reflecting it in the declarative form is prohibited, including dev experiments.

## Format Of Declarative Description

The schema is described as a **DEM v2 declarative object** compatible with `@teqfw/db` 2.x.

Requirements:

- the resulting declaration contains only closed data accepted by the DEM v2 compiler;
- constructor-local helpers may remove repetition but must not branch on runtime state or mutate the resulting model;
- the declaration is authoritative data rather than schema-application behavior;
- schema application such as DDL is performed by `@teqfw/db` compilation, planning, and execution components, not by the declaration itself.

## Schema Composition

The schema is formed as **one logical structure** assembled from separate declarative fragments.

The following are allowed:

- splitting the schema across multiple files;
- grouping declarations by functional or domain criterion;
- assembling the final schema by composing fragments.

The resulting schema must be reproducible as one unambiguous declarative object.

## Schema Granularity

The atomic unit of schema declaration is the **table**.

Each table declaration describes:

- table name;
- set of columns;
- primary key;
- foreign keys;
- constraints;
- indexes.

Domain entities do **not have to** correspond directly to tables.

The following are allowed:

- auxiliary tables;
- technical tables;
- aggregate tables;
- service tables, including schema-version tables.

## Identifiers And Keys

Identifier strategy is defined **per concrete table**, not globally for the entire schema.

The following are allowed:

- internal numeric identifiers such as `bigint` or `serial`;
- external stable identifiers such as `uuid`;
- identifier generation:
- on the application side;
- on the database side;
- or in mixed mode.

The schema must explicitly state:

- which columns are identifiers;
- which are used as primary keys;
- which are intended for external use.

## Relations And Constraints

Use of **foreign keys** is mandatory.

Requirements:

- all logical relations between tables must be expressed through foreign keys;
- foreign keys are used as fully as possible for related entities;
- integrity constraints are not replaced by application logic.

All constraints must be declared declaratively, including:

- `UNIQUE`;
- `NOT NULL`;
- `CHECK` constraints;
- referential-integrity rules.

## Indexes

Indexes are a **mandatory part** of the declarative schema.

Requirements:

- all indexes must be explicitly described;
- indexes that belong to a table are described in that table declaration;
- absence of an index in the declaration means absence of that index in a valid schema.

## Schema Versioning

The data schema in the MVP has an explicit DEM version and deterministic compilation fingerprint.

Requirements:

- the declaration uses `version: 2`;
- successful compilation produces the authoritative physical plan and fingerprint;
- the service table stores a derived audit copy of the declaration and fingerprint and is not a second schema authority.

The storage form of the version is defined by the schema declaration.

## Recreate And Preserve Semantics

The DB layer must support schema recreation with data preservation.

Normative rules:

- rebuild uses an explicit readable snapshot before an in-place mutation;
- entity additions, removals, renames, and conversions are never inferred;
- rebuild evidence remains unaccepted until the human or an external operational authority evaluates it;
- the order of recreate-with-preserve operations is derived by `@teqfw/db` from the compiled model.

## DBMS Independence

The declarative schema separates portable logical types from explicit PostgreSQL storage bindings.

The following are prohibited:

- raw SQL types or unchecked Knex method names;
- implicit provisioning of PostgreSQL extensions;
- runtime-dependent mutation of the declaration.

The selected PostgreSQL adapter must compile the declaration and preflight PostgreSQL and pgvector capabilities before mutation.

## Minimal Declaration Example

The example below illustrates **form**, not the normative structure of a real table.

```json
{
  "version": 2,
  "requires": ["postgresql.core"],
  "entity": {
    "example_table": {
      "attr": {
        "id": {"type": {"id": "core.integer", "params": {"bits": 64, "unsigned": false}}}
      },
      "index": {
        "pk": {"kind": "primary", "keys": [{"attr": "id"}], "phase": "table", "include": [], "options": {}}
      },
      "relation": {}
    }
  },
  "package": {},
  "refs": {}
}
```

## Document Boundary

This document does not describe:

- concrete Mindstream tables;
- names of real entities;
- SQL implementation;
- DB-layer APIs;
- schema-application order;
- CLI commands.

These questions are described in later `code/storage/` documents.

## Summary

`schema.md` defines a declarative, reproducible, and DBMS-independent form of schema description for the Mindstream MVP DB layer, giving both agents and code a shared normative basis for managing storage structure.
