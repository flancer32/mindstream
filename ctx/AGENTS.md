# Cognitive Context

- Path: `ctx/AGENTS.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

This level defines the cognitive context of the project.

The cognitive context is located under `./ctx/` during execution, which is its canonical location.
It may also be developed and maintained as a standalone repository.

The cognitive context consists of declarative documentation that governs project knowledge across the documentation levels, including product meaning, architecture, environment, code constraints, and project-level conventions, without including product implementation.

## Level Map

- `agent/` — context for agent behavior and project-local operational flows.
- `assets/` — non-normative supporting materials for the cognitive context.
- `docs/` — declarative project documentation and domain guidance.
- `AGENTS.md` — level definition for the cognitive context.
- `README.md` — brief entry description for the cognitive context.
- `adsm.json` — baseline metadata describing the ADSM context schema and version.

The cognitive context MUST include:

- `docs/filesystem.md` — declarative description of top-level repository directories and root-level files, defining repository boundaries and serving as a navigation map for the agent.

## Level Boundary

Defines:

- The cognitive context as the authoritative project knowledge space shared by humans and agents.
- The dependency order and governance model for project documentation levels.
- Structural rules for context documents, including how declarative knowledge is organized and maintained.

Does NOT define:

- Product implementation, source code structure, or runtime behavior as such.
- Testing artifacts, deployment infrastructure, or execution-environment specifics outside documented context governance.
- Project-specific product or architecture facts that must instead live in subordinate context documents.

Each `Level Boundary` section in context `AGENTS.md` documents should expose exactly three primary `Defines` items and exactly three primary `Does NOT define` items.

Project knowledge is distributed across documentation levels and refined through the dependency order:

```text
product
  -> architecture
  -> environment
  -> code
```

Within this model, the context acts as the authoritative project memory used by both humans and agents.

## Human-Agent Knowledge Space

Humans and agents use the context as a shared knowledge space because they have different cognitive capabilities.

- Humans primarily operate in the direction-setting and result-evaluation loop.
- Agents primarily operate in the refinement, analysis, planning, and execution-support loop.
- Documentation connects these loops by carrying goals, constraints, decisions, findings, and corrections across the project.

## Document Attributes

Each document of the cognitive context must include an attribute block placed immediately after the document title.

```md
- Path: `ctx/{{subdir}}/file.md`
- Template Version: `YYYYMMDD`
- Changed: `YYYYMMDD`
```

- `Path` must exactly match the canonical location of the document under `./ctx/`, regardless of the current repository layout.
- `Template Version` must use the `YYYYMMDD` format and identify the template revision on which the document is based.
- `Changed` must use the `YYYYMMDD` format and be updated when the document changes.

## Structural Constraints

These constraints apply to all documents of the cognitive context.

- Documents should be primarily declarative and describe structure, boundaries, and invariants.
- Procedural instructions and workflows are allowed but must not dominate or redefine the declarative model.
- Declarative definitions have priority over any procedural descriptions.

## Level Map Rules

Each `AGENTS.md` within the cognitive context must contain a `Level Map` section.

The `Level Map` must:

- list all subdirectories and files of the level
- list subdirectories before files
- use alphabetical order within each group
- include `AGENTS.md`
- match the actual filesystem exactly

Each entry must include a declarative description of its purpose.

## Hierarchy Rules

These rules apply only to `AGENTS.md` files within the cognitive context.

This file operates:

- as a root level when the context is used independently
- as a subordinate level when mounted into a product repository

Within this level:

- Subdirectories inherit constraints defined by this `AGENTS.md`
- Lower-level `AGENTS.md` files may refine but must not redefine invariants

Hierarchy resolution:

- When a root `AGENTS.md` is present, it defines the hierarchy model.
- Otherwise, this file defines it: the working context is the aggregate of `AGENTS.md` files along the path; deeper levels override higher levels within their scope; invariants must not be contradicted.

## Change Policy

This file is a template-level definition and is not subject to modification within the project.

- The agent must not modify, replace, delete, or relocate this file
- The agent must not introduce changes that effectively alter its content or presence in the repository
- Updates to this file are performed only at the template level and propagated explicitly

Violation of these rules constitutes an execution error.
