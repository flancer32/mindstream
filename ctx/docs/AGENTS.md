# Project Documentation

- Path: `ctx/docs/AGENTS.md`
- Template Version: `20260605`
- Changed: `20260619`

## Purpose

Defines the structure of project-level declarative documentation organized by ADSM levels.

Documents at this level describe the system as a design object, including meaning, structure, environment, and implementation constraints.

## Level Map

- `_img/` — non-normative diagrams and visual aids used by documentation files in this branch.
- `architecture/` — structural form of the system, architectural entities, boundaries, and interaction model.
- `code/` — engineering invariants governing how architecture is expressed in source code.
- `composition/` — project-specific applied composition documents for user-facing form and interaction shape.
- `constraints/` — project-specific constraint documents that add hard limits below product meaning and above implementation.
- `environment/` — runtime environment and infrastructural prerequisites required for system operation.
- `product/` — system meaning, domain entities, and product-level invariants.
- `AGENTS.md` — level definition for `ctx/docs/`.
- `filesystem.md` — declarative description of top-level repository directories and root-level files, defining repository boundaries and serving as a navigation map.

## Level Boundary

Defines:

- System meaning and domain intent through the documentation dependency chain rooted in `product`.
- System realization guardrails through `architecture`, `environment`, and `code`.
- Mandatory declarative constraints that bound any valid implementation.

All statements defined at this level and below are mandatory constraints for any valid implementation.

Violation of these constraints constitutes an incorrect result, regardless of functional correctness.

Does NOT define:

- Agent operations, workflow execution, or prompt-routing assets under `ctx/agent/`.
- Concrete implementation artifacts such as `src/`, `bin/`, `test/`, or other product files.
- Ad hoc task instructions that bypass or override the documentation dependency order.

## Level Order

Documentation levels form a strict dependency order:

```text
product
↓
architecture
↓
environment
↓
code
```

`architecture` translates product intent into stable engineering structure.

Lower levels may refine but must not redefine statements established at higher levels.

Lower levels may increase explicitness, constraint, and operational precision, but must not introduce new meaning absent from higher levels.

They must not add new product capabilities, invariants, authority, or semantic boundaries unless those are first named upstream.

## Project Extensions

This project currently keeps additional documentation branches beyond the minimal baseline:

- `composition/` captures applied user-facing composition and presentation structure.
- `constraints/` captures project-local hard limits that complement architecture and environment constraints.
- `_img/` stores non-normative diagrams referenced by documents in this branch.

These branches may refine the documentation landscape of this project, but they remain subordinate to the baseline dependency order rooted in `product`.

## Documentation As A Cognitive Interface

Project documentation is the cognitive interface through which humans and agents cooperate across the documentation levels.

- It communicates human goals, constraints, and decisions to agents.
- It communicates agent findings, inconsistencies, and refinements back to humans.
- It connects the human direction-setting and result-evaluation loop with the agent refinement and execution-support loop.
- It must remain compact enough for human control and precise enough for agent execution.
- It must support the full dependency order from product through architecture, environment, and code.

## Document Attributes

Documents under `ctx/docs/` use:

```md
- Path: `ctx/docs/{{subdir}}/file.md`
- Template Version: `YYYYMMDD`
- Changed: `YYYYMMDD`
```

All stable documents use `Path`, `Template Version`, and `Changed` attributes.
