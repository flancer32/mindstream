# Product Use Cases

- Path: `ctx/docs/product/use-cases.md`
- Template Version: `20260605`
- Changed: `20260726`

## Purpose

This document defines the major user goals and expected product outcomes of Mindstream at the product level.

## Level Boundary

Defines:

- Major user goals and expected product outcomes.
- Lifecycle position of primary use-case groups.
- Product-level invariants for use-case interpretation.

Does NOT define:

- Browser interaction flows or UI mechanics.
- API routes, storage effects, or implementation workflows.
- Test procedures or code-level execution logic.

## Use Case Groups

### Entry And Orientation

User goal: understand what the product offers and begin exploring a publication corpus.

Participating roles: demo reader, profiled reader.

Expected product outcome: the user gains access to an appropriate corpus surface and can begin semantic orientation.

Related domain areas: publication corpus, user participation.

Lifecycle position: entry stage.

### Profile Participation

User goal: join the full product contour in order to work with the full corpus and contribute attention signals.

Participating roles: profiled reader.

Expected product outcome: a user context becomes bound to a profile UUID and is recognized as participating in the collective statistical contour.

Related domain areas: user participation, attention and interest.

Lifecycle position: transition from limited exploration to full participation.

### Semantic Reading

User goal: understand whether a publication is relevant before opening the original source.

Participating roles: demo reader, profiled reader.

Expected product outcome: the user reads annotation and overview representations and decides whether to continue to the original source.

Related domain areas: publication corpus, semantic representation.

Lifecycle position: core repeated reading loop.

### Personal Feed Formation

User goal: receive a more useful local ordering or projection of the shared corpus.

Participating roles: profiled reader, product runtime.

Expected product outcome: the browser context forms a personal feed using the user's preference state and shared aggregated context.

Related domain areas: attention and interest, personal feed projection.

Lifecycle position: recurring value-delivery stage.

### Interest-Threshold Feed Projection

User goal: use one understandable interest level to identify matching publications and optionally hide locally loaded publications below it, while retaining the ability to restore them immediately.

Participating roles: profiled reader, product runtime.

Expected product outcome: highlighting and optional hiding use the same browser-local cutoff; after an interest profile exists, the reader can narrow the local feed projection without changing the shared corpus or another reader's availability.

Related domain areas: attention and interest, personal feed projection.

Lifecycle position: recurring reading-orientation stage.

## Core Use Cases

- Explore the demo corpus without profile initialization.
- Initialize a profile UUID to gain access to the full corpus and participation mode.
- Read semantic representations of a publication before opening the original source.
- Generate positive attention signals through meaningful reading actions.
- Receive a locally formed feed projection of the shared corpus.
- Set one local interest threshold for publication highlighting and optional feed hiding.

## Use Case Format

Each use case in this document is intentionally described only through product goal, participating roles, expected outcome, and domain relation.

Detailed interaction steps belong outside the product level.

## Lifecycle Model

The product lifecycle starts with corpus access, proceeds through semantic reading, optionally upgrades to profiled participation, and repeats through attention-driven feed formation.

For profiled readers, semantic reading and attention generation feed an ongoing loop that improves local corpus projection over time.

## Outcome Principles

- A useful product result is the user's improved orientation in the publication corpus.
- A durable product outcome exists when the user context participates through a profile UUID or when shared product statistics are updated from valid participation.
- Temporary reading decisions remain local unless they are expressed as valid attention signals under profiled participation.

## Use Case Invariants

- Demo exploration must remain meaningful even without profile participation.
- Full-corpus participation must remain conditional on profile UUID initialization.
- The product must remain centered on reading orientation rather than on social or editorial interaction.

## Use Case Documentation Map

No deeper use-case documents are currently defined.
