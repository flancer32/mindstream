# Content Collection Invariants

- Path: `ctx/docs/architecture/content-collection/invariants.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines the architectural invariants of the **Content Collection** in the Mindstream MVP.

The Content Collection is treated as the technical set of publications and derived representations used as material for the feed and for attention-related processing.

The document defines what is included in and excluded from the Content Collection and its relation to other architectural axes, without describing storage schemas or implementation.

---

## Content Collection Definition

The Content Collection is:

- the canonical set of publications and their derived representations;
- the shared data source for read models;
- the result of server-side Content Collection flows.

The Content Collection:

- is not personalized;
- does not depend on anonymous identity;
- does not depend on attention signals;
- is not treated as a model of “reality.”

A publication is the atomic artifact of the Content Collection.

---

## What Is Included

The Content Collection includes:

- publications accepted by server-side ingestion flows;
- derived publication representations such as annotation and overview;
- embeddings derived from those representations.

---

## What Is Excluded

The Content Collection does not include:

- anonymous-identity data;
- attention signals and any derived attention statistics;
- personalized read models;
- UI states and user contexts.

---

## Relation To Other Axes

### Anonymous Identity

The Content Collection contains no references to anonymous identity and exists independently of whether identity is present.

### Attention

Attention is an external observation over the Content Collection and does not affect its composition or structure.

### Ingress And Storage

The Content Collection is formed only by server-side flows and stored in canonical storage without reactive feedback loops.

---

## Publication Lifecycle

### Creation

Publications enter the Content Collection through server-side ingestion and content-processing flows.

### Change

The Content Collection may update or replace derived representations of publications without changing the architectural status of the publication.

### Removal

Removing a publication from the Content Collection causes cascade cleanup of related attention data and does not initiate reverse flows.

---

## Boundaries And Prohibitions

The following are prohibited in the MVP:

- personalizing the Content Collection based on attention or identity;
- using the Content Collection as a reaction to user signals;
- storing attention-derived data inside the Content Collection;
- treating the Content Collection as a read model for identity.

---

## Related Documents

- `ctx/docs/architecture/data-flow/content-collection.md`
- `ctx/docs/architecture/data-flow/attention.md`
- `ctx/docs/architecture/attention/storage-invariants.md`

---

## Summary

In the Mindstream architecture, the Content Collection is the canonical, non-personalized technical set of publications, independent of attention and anonymous identity, and used as material for the feed and attention-related processing in the MVP.
