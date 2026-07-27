# Product Documentation

- Path: `ctx/docs/product/AGENTS.md`
- Template Version: `20260619`
- Changed: `20260727`

## Purpose

Defines the product documentation level as the semantic root of the project documentation chain.

## Level Map

- `constraints/` — hard MVP scope constraints that narrow the permitted product space.
- `experience/` — applied user-facing experience, state, interaction, and presentation projections.
- `AGENTS.md` — level definition for `ctx/docs/product/`.
- `domain.md` — product world model, core domain areas, entities, and domain invariants.
- `glossary.md` — stable project terminology and naming boundaries.
- `overview.md` — product identity, mission, scope, and semantic navigation entry point.
- `roles.md` — product participants, authority boundaries, and ownership model.
- `use-cases.md` — product-level user goals, outcomes, and lifecycle-oriented use cases.

## Level Boundary

Defines:

- Product identity, scope, and durable semantic boundaries.
- Product language, role model, and domain-level meaning.
- Product-level goals and outcomes that supervise downstream levels.

Does NOT define:

- Architecture structure, internal flows, or state authority.
- Runtime environment prerequisites or implementation-level engineering rules.
- UI implementation mechanics, agent operations, workflow routing, or task procedures.

## Dependency Role

This level is the root of the baseline documentation dependency order:

```text
product
  -> architecture
  -> environment
  -> code
```

Lower levels may refine this meaning but must not redefine it.

Changes here imply possible downstream alignment work in architecture, environment, and code documentation.
