# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Record durable architecture decisions in a short ADR-like form.

## Decision Format

Use short entries that contain:

- the decision
- rejected alternatives
- reasoning

Keep only durable architecture decisions here.

Do not use this document as a changelog or backlog.

## Decision Entries

### One-Way Server Pipeline

- decision: organize the server-side architecture as a predominantly one-directional processing pipeline
- rejected alternatives: a generalized reactive mesh with cyclical ownership between collection, attention, and delivery areas
- reasoning: the pipeline model keeps authority boundaries, failure analysis, and supervision simpler for one human and many agents

### Storage As Durable Authority

- decision: keep persisted storage as the explicit durable source of truth
- rejected alternatives: treating browser-visible projections or external AI outputs as independent durable authorities
- reasoning: this preserves traceability, reproducibility, and stable state ownership

### External AI As Environmental Dependency

- decision: treat LLM and embedding capabilities as external integration dependencies rather than internal state owners
- rejected alternatives: embedding external AI providers into the core ownership model
- reasoning: this preserves internal authority boundaries while allowing derived enrichment
