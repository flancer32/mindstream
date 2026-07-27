# Code Documentation

- Path: `ctx/docs/code/AGENTS.md`
- Template Version: `20260619`
- Changed: `20260727`

## Purpose

Defines the engineering documentation level that governs how architecture is realized in source code.

Documents at this level record code-shaping invariants, implementation constraints, and engineering guidance that remain subordinate to product, architecture, and environment documentation.

## Level Map

- `browser/` — browser application, Web Component, and browser-resident UI-state contracts.
- `cli/` — deeper code-level documentation for the command-line surface and its execution model.
- `configuration/` — deeper code-level documentation for configuration structure and subordinate configuration contracts.
- `storage/` — deeper code-level documentation for the storage implementation layer and schema-oriented engineering rules.
- `AGENTS.md` — level definition for `ctx/docs/code/`.
- `bootstrap-reference.md` — reference bootstrap shape for backend startup.
- `configuration.md` — top-level configuration model and access invariants.
- `conventions.md` — engineering conventions for language use, modularity, dependencies, and code shape.
- `di-compatibility.md` — invariants for DI compatibility and expected integration boundaries.
- `es6-modules.md` — normative ES module shape used in the project.
- `logging.md` — logging invariants, namespace expectations, and observability rules.
- `overview.md` — compact overview of the code documentation level and its role in the dependency chain.
- `publication-statuses.md` — normative registry of publication statuses and transitions.
- `shared-contracts.md` — platform-neutral browser/backend transport-contract rules.
- `testing.md` — testing constraints, scope expectations, and isolation rules.

## Level Boundary

Defines:

- Engineering constraints governing how architecture is expressed in source code.
- Code-shaping rules for configuration, modularity, logging, storage, CLI, and testing.
- Implementation-level guardrails that remain consistent with higher documentation levels.

Does NOT define:

- Product meaning, domain vocabulary, or user-facing outcomes.
- Architectural ownership, system boundaries, or environment-level runtime prerequisites.
- Agent workflow routing or operational procedures under `ctx/agent/`.

## Dependency Position

This level is the last stage in the baseline dependency order:

```text
product
  -> architecture
  -> environment
  -> code
```

It may refine implementation precision, but it must not introduce new meaning or redefine higher-level constraints.

## Authoring Rules

- Keep this level declarative and implementation-governing rather than task-procedural.
- Use deeper subdirectories only where a stable engineering subdomain already exists.
- Reflect actual filesystem structure exactly in the level map.
- Surface conflicts with architecture or environment documentation instead of normalizing them locally.
