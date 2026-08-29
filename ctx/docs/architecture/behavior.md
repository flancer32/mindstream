# Architecture Behavior

- Path: `ctx/docs/architecture/behavior.md`
- Template Version: `20260605`
- Changed: `20260829`

## Purpose

Describe major internal architectural flows and processing behavior.

This document explains how the system works internally, not which product outcomes users want.

## Major Flows

The architecture is organized around a predominantly one-directional server-side pipeline.

- content collection flow gathers source material into the system boundary and prepares it for downstream processing
- enrichment flow derives machine-oriented representations such as summaries and embeddings from collected material
- attention flow records user attention signals and feeds them into ranking and personalization logic
- delivery flow serves user-facing read models and interaction endpoints without redefining upstream truth

The delivery flow can project either a paginated personal feed or one processed publication addressed by its stable permalink. Both projections read the same authoritative corpus state.

Detailed flow slices may be expanded in `data-flow/`, `ingress/`, and other deeper architecture documents.

## Flow Boundaries

For the main flows:

- ingress starts at explicit HTTP or background-entry boundaries
- content collection and enrichment operate inside server-side processing areas
- durable decisions are committed only at the storage and state-authority boundaries
- browser-visible responses terminate at read-model and API delivery surfaces

## Failure And Recovery

Architectural failure handling is expected to keep ingestion, enrichment, and attention processing isolated enough that one failing route does not silently redefine system truth.

Recovery should preserve traceability back to authoritative stored state rather than normalize inconsistent derived artifacts.

## Product Dependency

Behavior must realize product intent.

If product behavior is missing or contradictory, expose the gap instead of inventing architectural behavior silently.
