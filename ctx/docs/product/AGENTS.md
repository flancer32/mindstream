# Product Documentation

- Path: `ctx/docs/product/AGENTS.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

Defines the product documentation level as the semantic root of the project documentation chain.

## Level Map

- `AGENTS.md` — level definition for `ctx/docs/product/`.
- `terminology.md` — project vocabulary and semantic term definitions.
- `vision.md` — product purpose, scope focus, and high-level intent.

## Level Boundary

Defines:

- Product meaning, vocabulary, and high-level intent.
- The semantic source of truth for downstream documentation levels.
- The local document set used to supervise product-level invariants.

Does NOT define:

- Architecture structure, internal flows, or state authority.
- Runtime environment prerequisites or implementation-level engineering rules.
- Agent operations, workflow routing, or task procedures.

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
