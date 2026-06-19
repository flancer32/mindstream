# Product Domain Model

- Path: `ctx/docs/product/domain.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

This document defines the product world of Mindstream at the overview level.

## Level Boundary

Defines:

- Major domain areas and their relation.
- Core domain entities and ownership principles.
- Domain-level invariants independent of implementation.

Does NOT define:

- Storage schema, tables, vectors, or persistence mechanics.
- API routes, browser flows, or transport contracts.
- Source modules, handlers, or implementation algorithms.

## Domain Areas

### Publication Corpus

Purpose: hold the shared product corpus of externally sourced publications and their semantic representations.

Ownership: the corpus is a product-wide shared asset, not a per-user asset.

Primary entities: publication, annotation, overview, embedding, data corpus, demo corpus, full corpus.

Relation to other areas: this area provides the material consumed by browser-side feed projection and attention analysis.

### User Participation

Purpose: define how a user context joins the product either in demo mode or through a profile UUID.

Ownership: the user owns their local browser context and resulting personal projection; the product uses UUID only as a profile identifier for participation in collective statistics.

Primary entities: user context, user profile, profile UUID, demo mode.

Relation to other areas: this area determines which corpus surface is visible and whether attention signals may enter the shared statistical contour.

### Attention And Interest

Purpose: capture user attention as the semantic basis for preference formation and collective statistical aggregation.

Ownership: the local browser context forms the user's interest profile and interest vector; the server-side product contour aggregates statistics across initialized profiles.

Primary entities: attention signal, interest profile, interest vector, aggregated attention statistics.

Relation to other areas: this area connects user behavior to personal feed projection and to product-wide statistical context.

### Personal Feed Projection

Purpose: produce the locally visible feed view of the shared corpus for one user context.

Ownership: the feed belongs to the local user context as a derived projection rather than as a durable global product object.

Primary entities: feed, similarity.

Relation to other areas: this area depends on the corpus, semantic representations, user participation model, and attention-derived preference state.

## Core Domain Entities

- Publication — an externally sourced text item known to the product by reference.
- Semantic Representation — a canonical compressed meaning projection of a publication.
- User Profile — the product-side identity of one participating user context.
- Attention Signal — a positive user interaction fact relevant to preference formation.
- Feed — the local projection of the corpus for one user context.

## Ownership Principles

- Publications and semantic representations belong to the shared product corpus rather than to individual users.
- A user context owns its local interaction history and local feed projection semantics.
- The product may aggregate attention statistics only for initialized profiles participating through profile UUID.
- The feed is derived for a user context and is not treated as a globally owned shared object.

## Semantic Relations

- Publications enter the corpus from external sources and gain semantic representations inside the product.
- Semantic representations provide the basis for embeddings and for attention interpretation.
- A user context becomes a participating product profile when it uses a profile UUID.
- Attention signals contribute to the interest profile and may contribute to aggregated statistics when profile participation is enabled.
- The feed is derived by projecting the corpus through the user's interest state and the shared statistical context.

## Domain Invariants

- The publication remains an external source object even after ingestion into the corpus.
- Annotation and overview are product-recognized semantic representations of a publication.
- Profile UUID distinguishes participation context but does not turn the product into an account-registration system.
- Aggregated attention statistics never replace the user's own local projection authority.

## Domain Documentation Map

No deeper domain-area documents are currently defined.
