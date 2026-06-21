# Attention Storage Data Model

- Path: `ctx/docs/architecture/storage/attention-storage-model.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

This document defines the **structural data model** for storing attention statistics in the Mindstream MVP.

The model is intended for:

- formulating tasks for agents that generate the database schema;
- enforcing invariants already fixed in architectural documents;
- providing an unambiguous mapping of logical storage entities to a relational schema.

This document does not describe SQL, migrations, ORM, performance indexes, or data-access methods.

## Target Storage Model

- Storage type: **relational**
- Target DBMS: **PostgreSQL** using a compatible schema

## Logical Entities And Attributes

### 1. Anonymous Identity

Anonymous Identity represents a registered anonymous identifier of a browser context.

**Attributes:**

- `identity_id`
- type: UUID
- required
- primary key
- `registered_at`
- type: timestamp (UTC)
- required
- records the identity-registration moment

**Invariants:**

- an identity may exist without attention events;
- an identity without events may be removed by TTL;
- identity removal is full and irreversible;
- storage does not generate identity.

### 2. Publication Reference

Publication Reference represents a reference to a publication that exists in the Content Collection.

**Attributes:**

- `publication_id`
- type: defined by the Content Collection
- required
- primary key
- foreign key to the publications table

**Invariants:**

- an attention event may reference only an existing publication;
- attempting to write an event for a non-existent publication is an error;
- removing a publication causes cascade deletion of related attention data.

### 3. Attention Event (State)

Attention Event represents a **logical attention state**, not a historical event.

The state records the fact that attention of a given type is considered expressed for the pair `(identity, publication)`.

**Attributes:**

- `identity_id`
- type: UUID
- required
- foreign key to Anonymous Identity
- `publication_id`
- type: matches Publication Reference
- required
- foreign key to Publication Reference
- `attention_type`
- type: enum
- required
- `created_at`
- type: timestamp (UTC)
- required
- records the moment of first state registration

**Keys and constraints:**

- composite unique key:

```text
(identity_id, publication_id, attention_type)
```

**Invariants:**

- for one triple `(identity, publication, attention_type)`, at most one state is allowed;
- rewriting the same event is fully ignored;
- `created_at` is not updated on repeated submission;
- repetition history is not stored.

## Attention Type Enum

The set of allowed attention-signal types is **closed** in the MVP.

Allowed values:

- `overview_view`
  records the fact of opening a publication overview.
- `link_click`
  records the fact of opening the publication source link.
- `link_click_after_overview`
  records the fact of opening the link after previewing the overview.

Expanding the `attention_type` set requires revision of the architectural documentation set.

## Constraint Invariants

Storage must enforce:

1. **Existence**
- an attention event cannot exist without an existing identity;
- an attention event cannot exist without an existing publication.

2. **Uniqueness**
- uniqueness of `(identity_id, publication_id, attention_type)`.

3. **Referential integrity**
- cascade deletion of attention events when a publication is removed;
- cascade deletion of attention events when an identity is removed.

4. **Immutability**
- an attention state does not change after first registration.

## Retention And Cleanup

At the storage level, the schema must allow:

- deletion of identities without events;
- deletion of attention events older than a configured threshold;
- manual cleanup execution;
- preservation of aggregated statistics outside primary tables during attention-event cleanup.

## Conceptual Write-Event Example

The following example is non-normative and included only for context:

```json
{
  "identity_id": "550e8400-e29b-41d4-a716-446655440000",
  "publication_id": "pub_12345",
  "attention_type": "overview_view",
  "timestamp": "2026-02-10T15:30:00Z"
}
```

## Document Boundary

This document:

- does not define SQL DDL;
- does not describe optimization indexes;
- does not introduce aggregate tables;
- does not describe ORM models;
- does not define API contracts.

All of these belong to the implementation level and are formulated through agent tasks.

## Related Documents

- `ctx/docs/architecture/anonymous-identity/invariants.md`
- `ctx/docs/architecture/ingress/attention-write-ingress.md`
- `ctx/docs/architecture/data-flow/attention.md`
- `ctx/docs/architecture/attention/storage-invariants.md`

## Summary

This document defines the **complete and unambiguous structural data model** for storing attention statistics in the Mindstream MVP and is intended for direct use when assigning a Codex agent to generate the database schema.
