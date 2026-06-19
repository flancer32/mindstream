# Workflow Template

- Path: `ctx/agent/flows/_workflow/AGENTS.md`
- Template Version: `20260610`
- Changed: `20260619`

## Purpose

Defines the document set for one concrete workflow under `ctx/agent/flows/`.

This placeholder bundle exists only to keep the baseline template structure present until a real workflow is explicitly defined.

## Level Map

- `cfg/` — executable or semi-executable workflow configuration consumed by the selected workflow engine.
- `AGENTS.md` — level definition for `ctx/agent/flows/_workflow/`.
- `configuration.md` — repository-specific and environment-specific constants, bindings, and provisioning commands.
- `execution.md` — detailed executable workflow model for roles, triggers, routes, states, and transition rules.
- `overview.md` — high-level workflow shape, purpose, boundaries, and terminal outcomes.

## Level Boundary

Defines:

- The document structure for one workflow bundle.
- The separation between workflow description, executable logic, and environment binding.
- The minimum documentation set required for a future concrete workflow.

Does NOT define:

- Any real workflow semantics for this project.
- Engine-specific defaults not grounded in project documentation.
- Product, architecture, or repository facts outside this placeholder scope.

## Workflow Documentation Constraints

- This directory is a structural placeholder and must be renamed when a concrete workflow identifier is defined.
- Placeholder texts in this directory must not be mistaken for active workflow semantics.
- Real workflow content must be introduced only from explicit human direction or project-local documentation.
