# Product Overview

- Path: `ctx/docs/product/overview.md`
- Template Version: `20260605`
- Changed: `20260619`

## Product Identity

Mindstream is a personal reading and orientation product for publication streams. It aggregates external publications into one shared corpus and helps each user view that corpus through a personal projection shaped by the user's own attention and by aggregated collective attention statistics.

Mindstream is not a social network, not a classical recommender, and not an account-centric publishing platform.

## Product Mission

The product exists to help a reader orient in a publication corpus without forcing editorial control, negative feedback mechanics, or opaque recommendation authority.

Its stable intention is to provide semantic representations and statistical context so that reading choices remain user-driven while still benefiting from shared corpus processing.

## Product Scope

Mindstream is responsible for:

- collecting external publications into a shared corpus;
- producing semantic representations of those publications as annotations and overviews;
- allowing one browser-bound user context to form a personal feed projection from the corpus;
- using positive attention signals and aggregated statistics as the product basis for that projection.

## Product Areas

- Corpus formation and semantic representation of publications.
- Browser-side user context and profile participation.
- Attention signal capture and aggregated attention statistics.
- Personal feed projection from the shared corpus.

Detailed product meaning is distributed across `domain.md`, `roles.md`, `use-cases.md`, and `glossary.md`.

## Core Lifecycle

The product lifecycle begins with an available corpus of publications and their semantic representations. A user enters either in demo mode or through an initialized profile UUID, explores semantic representations, produces attention signals through reading actions, and receives a personal feed projection of the corpus in the browser.

The useful result is not publication ownership or social interaction. The useful result is improved personal orientation in the corpus through a locally formed feed.

## Product Boundaries

### In Scope

- Shared corpus of external publications and their semantic representations.
- Demo access without profile initialization.
- Full-corpus access for a user with an initialized profile UUID.
- Positive attention signals as input to personal and aggregated projection logic.
- Browser-local feed formation for one user context in MVP.

### Out of Scope

- User registration by email, phone, or identity account.
- Transfer of user profiles between devices.
- Social communication, comments, or user-generated publication content.
- Negative ratings, dislikes, or explicit anti-preference modeling.
- Explanatory recommender logic that claims to decide what the user should read.

## MVP Boundary

The current MVP is intentionally limited to one browser profile context. It validates the personal feed projection model, the profile UUID participation model, and the use of semantic representations instead of full-text personalization.

The MVP does not aim for full multi-device identity, fine-grained personalization theory, or direct processing of full publication text as the product interaction surface.

## Product Invariants

- All users operate against one shared corpus, but each feed is a local personal projection rather than a global system object.
- Full-corpus participation requires an initialized profile UUID, while demo use remains possible without one.
- Attention modeling is positive-only at the product level.
- Semantic work is based on annotations and overviews as canonical compressed representations, not on exposing full-text internals as product objects.

## Documentation Map

- Read `domain.md` to understand the product world, main entities, and domain invariants.
- Read `roles.md` to understand participants, authority, and ownership boundaries.
- Read `use-cases.md` to understand user goals, outcomes, and lifecycle positions.
- Read `glossary.md` to understand stable product terminology.
