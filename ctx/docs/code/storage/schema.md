# Code Storage Layer — Schema Declaration

- Path: `ctx/docs/code/storage/schema.md`
- Template Version: `20260619`
- Changed: `20260620`

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

The schema is described as a **pure declarative JSON structure** without executable code.

Requirements:

- the declaration contains no executable logic;
- conditions, loops, and computations are not allowed;
- the declaration is data, not code;
- schema application such as DDL is performed by the DB layer, not by the declaration itself.

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

The data schema in the MVP has an **explicit version**.

Requirements:

- the schema version is fixed declaratively;
- the version is also stored in the database in a separate service table;
- the DB layer uses the schema version to control database state.

The storage form of the version is defined by the schema declaration.

## Recreate And Preserve Semantics

The DB layer must support schema recreation with data preservation.

Normative rules:

- data absent from the new schema version is **dropped** during restoration;
- data restoration is limited to structures present in the declaration;
- the order of recreate-with-preserve operations is not described in the declaration and belongs to the DB layer.

## DBMS Independence

The declarative schema must use **only portable constructs** supported by `knex`.

The following are prohibited:

- DBMS-specific extensions;
- conditional branches for concrete DBMSs;
- declarations that depend on runtime environment.

The schema must be applicable to any DBMS supported by `knex`.

## Minimal Declaration Example

The example below illustrates **form**, not the normative structure of a real table.

```json
{
  "tables": {
    "example_table": {
      "columns": {
        "id": { "type": "bigint", "primary": true },
        "uuid": { "type": "uuid", "unique": true, "notNull": true },
        "created_at": { "type": "timestamp", "notNull": true }
      },
      "foreignKeys": [],
      "indexes": [{ "columns": ["uuid"], "unique": true }]
    }
  },
  "schemaVersion": 1
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
