# Mindstream — Constraints Overview

- Path: `ctx/docs/product/constraints/overview.md`
- Template Version: `20260619`
- Changed: `20260727`

## Purpose

Provide a compact entry point to the project-specific constraints branch.

This document summarizes how constraint documents bound the MVP without repeating product meaning, architecture structure, or implementation mechanics.

## Constraint Role

The constraints branch defines hard limits that all downstream documentation and implementation must respect.

These limits are intentionally restrictive and should be read literally.

When a capability, mode, or behavior is not explicitly allowed inside the MVP constraint set, it is treated as outside scope.

## Main Constraint Areas

The active constraint areas for Mindstream are:

- MVP scope remains limited to validating personal projection of a shared publication corpus.
- access is limited to demo mode and full-access mode tied to UUID-based participation.
- semantic processing is limited to annotation, overview, and their embeddings.
- attention signals are positive-only and must not create global reactive learning loops.
- UI remains read-oriented and does not expose personalization controls or recommendation explanations.

## Dependency Position

This branch is subordinate to product meaning and complementary to architecture and environment.

It may narrow the allowed solution space, but it must not redefine product semantics.

## Navigation

- Read `mvp-scope.md` for the full hard boundary of the MVP.
- Use this overview when you need the compact reminder of what kinds of expansion are currently forbidden.
