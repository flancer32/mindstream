# Mindstream — MVP Scope Constraints

- Path: `ctx/docs/constraints/mvp-scope.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines the hard and mandatory constraints of the Mindstream MVP and identifies the allowed and disallowed product properties without interpretation or extension.

Any decision that goes beyond this document is considered out of MVP scope.

## Base MVP Frame

The Mindstream MVP exists to validate the idea of a personal projection of a publication corpus and a user's participation in a shared statistical contour, not to optimize personalization, scaling, or social features.

The MVP implements a strictly limited set of product entities and access modes sufficient to demonstrate the core value of the product.

## Access Modes

The MVP allows exactly two access modes to product data: demo mode and full-access mode.

There are no other access modes, intermediate states, or automatic transitions between modes in the MVP.

## Demo Mode

In demo mode, the user uses Mindstream without profile initialization and without a UUID.

In demo mode, the user has access only to the demo corpus, whose size and composition are limited and do not represent the full publication corpus.

In demo mode, generating a personal feed from the full corpus is prohibited.

In demo mode, attention signals may be recorded locally but are not sent to the server and do not participate in aggregated attention statistics.

## Full Access

Full access to Mindstream data is granted only to a user with an initialized profile identified by a UUID.

Profile initialization is a condition for access to the full corpus and participation in the product's shared statistical contour.

The UUID is not a registration, account, authentication mechanism, or proof of identity and is not tied to personal user data.

## User Context And Profile

Within the MVP, one user context corresponds to one browser profile.

Each user context has at most one user profile identified by a UUID.

Moving a profile across browsers, devices, or user contexts is prohibited in the MVP.

## Data Corpus

The MVP distinguishes between the demo corpus and the full corpus.

The demo corpus is used only in demo mode and does not require user participation in attention-statistics collection.

The full corpus is used only in full-access mode and may be used for personal-feed formation with aggregated attention statistics taken into account.

## Semantic Representations And Embeddings

In the MVP, only two semantic representations are produced for publications: annotation and overview.

Generating other semantic projections, additional condensation layers, or publication chunking is prohibited.

Embeddings are generated only for annotations and overviews.

Generating embeddings for full publication text is prohibited in the MVP.

## Attention Signals

The MVP records only positive attention signals, including reading an annotation, reading an overview, opening the original publication, and explicitly marking a publication positively.

Negative attention signals, dislikes, and negative ratings are prohibited in the MVP.

Sending attention signals to the server and using them in aggregated attention statistics is possible only when a profile UUID exists.

## Personal Feed

The user feed in the MVP is the result of a local personal projection of the available corpus through the lens of the user's interest profile.

The feed is not a global entity, is not stored as an object, and has no canonical representation.

Generating a personal feed from the full corpus without a profile UUID is prohibited.

## Personalization And Feedback

The MVP allows local personalization inside the user's browser without global data recalculation.

Global feedback loops, reactive system learning, and real-time recalculation of the corpus, annotations, overviews, embeddings, or aggregated attention statistics are prohibited.

## Interface

The MVP user interface exists only for reading publications, recording attention signals, and visualizing the personal feed.

The interface does not provide controls for algorithms, personalization settings, or explanations of why the feed was formed the way it was.

## Outside MVP Scope

Out of scope for the MVP are account registration, social features, user-to-user interaction, user-generated content, negative ratings, profile transfer across devices, recommendation explainability, payment mechanisms, and any form of global system learning.

Any change beyond these constraints requires this document to be revised.
