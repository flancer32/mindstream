# Architecture State

- Path: `ctx/docs/architecture/state.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Describe state ownership and sources of truth.

## Sources Of Truth

The primary architectural source of truth is the durable stored state maintained by the storage boundary.

Collected source records, publication metadata, attention records, and derived ranking inputs must remain traceable to persisted authoritative state.

## State Categories

- authoritative durable state — persisted records that define system truth
- temporary state — transient execution context used during ingestion, enrichment, or delivery
- derived state — summaries, embeddings, rankings, and other downstream projections derived from authoritative durable state

Authoritative durable state is the source of truth. Derived state must remain subordinate to it.

## Ownership Boundaries

- persistence responsibility lives at the storage boundary
- derived state originates from authoritative durable state and must not silently re-own it
- browser-delivered projections are downstream reflections, not independent state authorities
- external providers may influence derived outputs but do not own internal persisted truth

## Ownership Rules

- only components operating through the documented storage authority may commit durable state changes
- attention-related durable records must remain explicit architectural entities rather than hidden side effects
- new persistent state categories require architecture updates and human approval

## State Authority

Durable change authority belongs to the architecture areas that write through the storage boundary.

Derived state must remain reproducible or explainable from authoritative records.

Persistence responsibility must stay explicit at the architecture level.

## Change Discipline

Agents must not introduce new persistent state owners or categories without updating architecture documents and obtaining human approval.
