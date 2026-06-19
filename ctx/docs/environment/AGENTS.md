# Environment Documentation

- Path: `ctx/docs/environment/AGENTS.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

Defines the documentation level for runtime environment and operational prerequisites.

This branch records environment assumptions required to run the system without redefining product meaning, architecture ownership, or code-shaping rules.

## Level Map

- `runtime/` — deeper environment notes for runtime-serving concerns.
- `setup/` — deeper environment notes for setup prerequisites such as database provisioning.
- `AGENTS.md` — level definition for `ctx/docs/environment/`.
- `deployment.md` — deployment-facing environment constraints and assumptions.
- `overview.md` — compact overview of the environment branch.
- `runtime.md` — runtime environment model and serving assumptions.

## Level Boundary

Defines:

- Runtime and infrastructural prerequisites required by the system.
- Environment-level constraints that implementation must respect.
- The local document set supervising setup, runtime, and deployment assumptions.

Does NOT define:

- Product semantics, domain vocabulary, or user-facing outcomes.
- Architecture ownership, major system boundaries, or state authority.
- Source-level implementation structure or agent workflow procedures.

## Dependency Position

This branch sits between architecture and code in the baseline dependency order:

```text
product
  -> architecture
  -> environment
  -> code
```

It may refine runtime assumptions but must not introduce new product or architecture meaning.
