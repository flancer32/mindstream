# Architecture Integration

- Path: `ctx/docs/architecture/integration.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Describe external integrations and major internal contracts between architectural blocks.

## External Integrations

The architecture depends on several external integration classes:

- source systems that provide publication or content inputs
- LLM services used for summarization or other enrichment
- embedding services or models used for vectorized representations
- browser clients that consume projected read models and submit attention-related signals

This level records the integration classes and boundary roles, not protocol or endpoint inventories.

## Internal Contracts

Major internal contracts include:

- ingress-to-processing handoff contracts for admitted work
- processing-to-storage contracts for durable commits
- storage-to-delivery contracts for read-model projection
- attention-signal contracts that connect browser-visible behavior to server-side attention processing

Deeper contract details may live in existing architecture subdocuments when necessary.

## Boundary Rules

- new integrations must be explicit here before they appear in implementation
- integration descriptions must stay at architectural boundary level, not code or schema level
- contradictions with product scope must be surfaced instead of normalized silently
