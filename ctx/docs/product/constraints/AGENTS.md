# Constraints Documentation

- Path: `ctx/docs/product/constraints/AGENTS.md`
- Template Version: `20260619`
- Changed: `20260727`

## Purpose

Defines the nested product constraint branch.

## Level Map

- `AGENTS.md` — level definition for `ctx/docs/product/constraints/`.
- `mvp-scope.md` — fixed boundary of what is included and excluded in the MVP.
- `overview.md` — compact overview of how this branch constrains the project.

## Level Boundary

Defines:

- Project-local hard constraints that bound valid implementation space.
- Constraint documents that complement product, architecture, and environment guardrails.
- The local document set used to supervise non-negotiable scope restrictions.

Does NOT define:

- Product meaning, domain vocabulary, or role definitions.
- Architecture structure, runtime environment topology, or code-shaping rules.
- Agent workflow procedures or implementation task instructions.

## Priority Rule

Constraint statements in this branch are literal and restrictive.

Lower levels must not weaken them.

This branch remains subordinate to product meaning while taking priority over downstream realization choices.
