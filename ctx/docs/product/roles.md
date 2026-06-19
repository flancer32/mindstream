# Product Role Model

- Path: `ctx/docs/product/roles.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

This document defines the product participants and authority boundaries of Mindstream at the overview level.

## Level Boundary

Defines:

- Role categories participating in the product.
- Product authority and ownership boundaries.
- Role-level invariants for participation and visibility.

Does NOT define:

- Authentication implementation or credential mechanics.
- UI interaction details or browser workflows.
- Source code policies, handlers, or access-control implementation.

## Role Categories

### Reader In Demo Mode

Purpose: explore the product without profile initialization.

Product authority: may browse only the demo corpus and may read semantic representations locally.

Owned product areas or objects: none in the shared product contour.

Relation to other roles: this role is an entry role that can transition to a participating profiled reader by initializing a profile UUID.

### Profiled Reader

Purpose: use the full product model through one initialized browser profile.

Product authority: may access the full corpus surface available to profiled participation and may produce attention signals that enter the shared statistical contour.

Owned product areas or objects: local interest profile, local feed projection, participation identity through profile UUID.

Relation to other roles: extends the demo reader by joining the collective attention contour.

### Product Runtime

Purpose: maintain the shared corpus, semantic representations, and aggregated attention statistics as product infrastructure.

Product authority: may ingest publications, derive semantic representations, and maintain shared statistical context.

Owned product areas or objects: shared corpus and aggregated product-level semantic assets.

Relation to other roles: serves both reader roles without taking over personal reading decisions.

## Core Roles

- Demo Reader
- Profiled Reader
- Product Runtime

## Authority Principles

- Only the profiled reader may contribute attention signals to the shared aggregated contour.
- The product runtime owns the shared corpus and shared semantic derivatives.
- The local browser context owns the final visible feed projection for the current user context.
- No role in the product model owns a social moderation or editorial authority over user-to-user interaction because such interaction is out of scope.

## Ownership Boundaries

- Demo readers do not own participation state in the shared contour.
- Profiled readers do not own the shared corpus or other users' projections.
- The product runtime does not own the user's reading intention; it prepares shared context but does not claim final feed authority.

## Participation Relations

- A user may start as a demo reader and become a profiled reader by initializing a profile UUID.
- Profiled readers interact with the product runtime by consuming the shared corpus and emitting attention signals.
- The product runtime aggregates shared statistics that may influence but do not replace local user projection.

## Role Invariants

- Demo use remains possible without registration-style identity.
- Profile participation must not be described as a classic account model.
- Shared runtime authority over the corpus must not be confused with authority over an individual user's final reading decision.

## Role Documentation Map

No deeper role documents are currently defined.
