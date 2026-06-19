# Architecture Constraints

- Path: `ctx/docs/architecture/constraints.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Record non-negotiable architecture restrictions and trust boundaries.

## Core Constraints

- server-side processing is organized as a predominantly one-directional pipeline rather than a cyclic reactive mesh
- durable truth must remain explicit at the storage boundary
- derived artifacts such as summaries, embeddings, and ranking signals must stay subordinate to persisted authoritative state
- browser-originated attention feedback may influence downstream behavior but must not silently redefine source truth

## Boundary Constraints

- architecture must not redefine product meaning, domain entities, or user-facing outcomes
- architecture must not allow external providers to become implicit owners of internal durable state
- architecture must not collapse ingress, processing, storage, and delivery into an unbounded authority surface

## Change Constraints

The following always require human approval:

- new architectural owners
- new persistent state
- new external integrations
- new major system boundaries
