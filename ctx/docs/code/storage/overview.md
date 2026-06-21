# Code Storage Layer — Overview

- Path: `ctx/docs/code/storage/overview.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

This document defines the **engineering role and form of the relational-database layer** in the Mindstream MVP.

The data-storage layer belongs only to the `code/` level and implements the architectural `Storage` contour already fixed in the architecture documents, **without extending or changing system architecture**.

This document describes what counts as the DB layer as an engineering object, what responsibilities it carries, and which invariants are mandatory in the MVP.

## Architectural Position Of The Layer

The DB layer:

- is not an architectural contour;
- introduces no new data flows;
- does not extend the architectural storage model;
- implements the existing `Storage` contour at the engineering level.

All architectural properties of `Storage`, such as canonicity, monotonicity, and absence of reactivity and control feedback loops, are treated as **defined externally** and are not restated here.

## Role Of The DB Layer In The Codebase

The DB layer is responsible for:

- implementing CRUD + L operations for canonical storage entities;
- managing schema at the code-layer level;
- ensuring reproducibility of database structure;
- supporting controlled schema recreation with data preservation;
- isolating application code from SQL details and concrete DBMS behavior.

The DB layer contains no product logic, does not interpret attention signals, and does not participate in formation of the personal feed.

## Technology Base

In the Mindstream MVP:

- `knex` is the **only DBAL**;
- direct SQL use outside `knex` is prohibited;
- the DB layer remains isolated from low-level SQL details but is implemented for **PostgreSQL 16+ with mandatory `pgvector`**, as fixed in the `environment/` layer.

The choice of PostgreSQL with `pgvector` is not an interchangeable option but part of the fixed runtime environment.

## Data Schema Model

The data schema:

- is described **declaratively** as JavaScript-based descriptions;
- is treated as the **canonical source of truth** for database structure;
- is not derived from code and is not formed as a side effect of application execution.

The DB layer must support **full restoration of the schema** from declarative description without relying on the current database state.

The schema must remain compatible with storage of publication vector representations through types and capabilities provided by PostgreSQL and `pgvector`.

## Schema Lifecycle Management

The DB layer owns schema-lifecycle operations as a separate engineering responsibility.

In the MVP, the following are allowed:

- full schema recreation;
- schema rebuild with preservation of existing data;
- manual destructive operations on the schema.

All destructive operations:

- run **only manually**;
- are triggered through CLI or an explicit engineering call;
- are not part of the regular runtime application;
- are not triggered automatically during system operation.

In operational mode, the state of `Storage` is considered monotonic.

## Domain And Persistence

In the MVP, a **one-to-one correspondence** is allowed between:

- domain entities;
- persistence model such as tables, fields, and indexes.

There is no separate domain-to-persistence mapping layer.

Domain entities are treated as canonical data structures, not rich domain models with encapsulated behavior.

## Data-Access Contracts

CRUD + L operations are implemented through **explicit domain-specific contracts** tied to each storage entity.

Generic repositories and generic contracts are not used in the MVP.

Each storage module:

- is responsible for one concrete entity;
- implements only the operations required for that entity;
- uses `knex` directly in its implementation.

## Testability

The DB layer is designed with unit testing as a priority.

In the MVP:

- DB-layer unit tests run with a fully mocked DBAL;
- real DBMS connections are not used in unit tests;
- side effects such as filesystem, network, and real database access are excluded.

Integration tests for the DB layer are outside the MVP scope.

## Document Boundary

This document does not describe:

- concrete tables and fields;
- SQL structures and indexes;
- application-service APIs;
- CLI interfaces and commands;
- implementation of concrete storage modules.

These topics belong to later documents in `code/storage/`.

## Summary

The DB layer of the Mindstream MVP is an engineering layer of the codebase that implements the architectural `Storage` contour without extending it, provides declarative schema description, explicit CRUD + L contracts, and controlled schema-lifecycle management within the MVP.
