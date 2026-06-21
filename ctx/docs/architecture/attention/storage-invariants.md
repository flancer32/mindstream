# Attention Storage Invariants

- Path: `ctx/docs/architecture/attention/storage-invariants.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

This document defines the **storage invariants** for the attention-signal subsystem in the Mindstream MVP.

These invariants define which states **must hold true in storage** regardless of the concrete DBMS, table schema, SQL, indexes, or service implementation.

This document applies only to the storage contour for attention signals and does not describe ingress, API, UI, aggregation algorithms, or any computational processes.

## Role Of Storage In Architecture

Storage in the attention-signal contour is an **enforcement layer** and:

- records accepted statistical data in durable form;
- ensures integrity and deduplication at the data level;
- contains no domain logic beyond enforcement of invariants;
- does not initiate reactive processes;
- does not form read models for anonymous identity.

## Logical Storage Entities

Only the following logical entities are allowed in this storage contour in the MVP:

1. **Anonymous Identity**
2. **Publication Reference**
3. **Attention Event (State)**

Other entities, including auxiliary ones such as profiles, sessions, counters, and aggregates, are not introduced in this contour.

## Invariants: Anonymous Identity

### Identity Source

- Anonymous identity is represented by a standard UUID.
- The UUID is generated only on the frontend and registered explicitly on the server.
- Storage is not the source of identity and does not generate UUIDs.

### Existence And Registration

- Any attention event may be recorded only if a registered identity exists.
- An identity may exist in storage even without attention events.

### Identity Metadata

- Storage must record the **identity registration time** in UTC.

### Identity Removal

- An identity without attention events may be removed by TTL.
- Identity removal is full and irreversible.
- No tombstone mechanism or trace preservation is used in the MVP.

## Invariants: Publication Reference

### Publication Existence Requirement

- An attention event may reference only a publication that exists in Content Collection storage.
- Attempting to record an attention event for a non-existent publication is an error.

### Publication Removal

- If a publication is removed from the Content Collection, related attention data must be deleted cascade-style.
- After cascade cleanup, no attention state may remain that references the removed publication.

## Invariants: Attention Event (State)

### Event Ontology

In the MVP, an Attention Event is not a historical event but a **logical attention state**:

- it records that attention of a given type is considered expressed for a pair `(identity, publication)`;
- storage does not keep the repetition history of the same attention event.

### State Uniqueness

- For each triple `(anonymous_identity, publication_id, attention_type)`, at most one attention state is allowed.
- Storage must not contain duplicates that violate state uniqueness.

### Repeated Submission

- Repeated submission of the same attention event must be **fully ignorable** at the durable-state level.
- A repeated submission must not:
- create new rows;
- update the timestamp;
- change any derived state.

### Timestamp

- The timestamp associated with an attention state is the **moment of its first recording** in UTC.
- The timestamp is not updated by repeated submissions.

## Deduplication Invariants

- Deduplication is a storage invariant, not an ingress-logic invariant.
- Storage must ensure that duplicate attention states cannot exist.
- Storage does not have to prevent duplicate submissions from reaching the backend, but it must ensure that duplicates do not change durable state.

## Retention And Cleanup

### Cleanup Of Identities Without Events

- TTL cleanup of identities without events is allowed.
- Cleanup may run manually and is not a required runtime-contour process.

### Cleanup Of Expired Attention Data

- Removing attention data older than a configured period, for example one year, is allowed.
- Cleanup may be implemented as a separate manual run and is not a required runtime-contour process.

### Preserving Aggregated Statistics During Cleanup

- Preserving aggregated statistics while cleaning up primary attention states is allowed.
- Aggregates are not a required part of storage in the MVP, but they may appear as long as they do not violate the invariants in this document.

## Derived Data Boundary

In the future, the following may be added:

- server-side aggregates;
- derived tables;
- materialized views;

if all of the following hold:

- they do not change the ontology of primary attention states;
- they do not introduce read models for identity within the write-ingress contour;
- they do not violate enforcement invariants for uniqueness, existence, or cascade cleanup.

## Related Documents

- `ctx/docs/architecture/anonymous-identity/invariants.md`
- `ctx/docs/architecture/ingress/http-ingress.md`
- `ctx/docs/architecture/ingress/attention-write-ingress.md`
- `ctx/docs/architecture/data-flow/attention.md`
- `ctx/docs/architecture/attention/interest-vector.md`

## Summary

The attention-signal storage contour in the MVP stores:

- registered anonymous identities with registration time;
- references to publications that exist in the Content Collection as an external dependency;
- attention states, not history, unique by `(identity, publication, attention_type)`, fully idempotent under repeated submission, and removed cascade-style when a publication is removed.

Data cleanup is allowed and may be run manually. Derived data may be added later if the invariants of this document are preserved.
