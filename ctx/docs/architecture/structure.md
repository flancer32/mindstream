# Architecture Structure

- Path: `ctx/docs/architecture/structure.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Describe the major architectural blocks, runtime areas, and responsibility boundaries.

## Architectural Blocks

The main architectural blocks of Mindstream are:

- ingress boundaries that admit requests, events, and background processing entry points
- content collection processing that acquires and normalizes source material
- attention processing that records and applies user-interest signals
- storage authority that persists durable system truth
- browser-facing delivery surfaces that expose read models and interaction endpoints
- external AI and source-system dependencies that remain outside the system boundary

This is not code structure.

## Responsibility Boundaries

- ingress boundaries validate and route work but do not become durable state owners by themselves
- collection and attention areas transform or interpret information within bounded responsibilities
- storage remains the durable authority boundary for persisted truth
- browser delivery surfaces project existing state and processing outcomes without becoming an independent source of truth
- external systems provide input or enrichment capabilities but do not own internal architectural authority

## Optional Expansion

The project already uses deeper subdocuments for several architecture areas.

Additional deeper structure documents should be created only when they materially improve supervision of architectural boundaries.
