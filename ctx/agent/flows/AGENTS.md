# Agent Workflow Context

- Path: `ctx/agent/flows/AGENTS.md`
- Template Version: `20260610`
- Changed: `20260619`

## Purpose

Defines the structure of agent event flow operational context for a project.

## Level Map

- `_workflow/` — placeholder workflow bundle showing the template structure for one concrete agent flow.
- `AGENTS.md` — level definition for `ctx/agent/flows/`.

## Level Boundary

Defines:

- Agent event flow documentation and configuration boundaries.
- The structural place where concrete workflow definitions are documented.
- The separation between generic workflow structure and engine-specific specialization.

Does NOT define:

- Project-specific workflow semantics that have not been explicitly provided.
- Engine-specific routing details, prompts, or executable profiles as generic defaults.
- Generic repository architecture or product structure outside workflow concerns.

## Workflow Documentation Constraints

- This template defines the documentation framework for workflow bundles; the project may store full concrete workflow semantics in this branch when that meaning is intentionally documented.
- The agent must not invent workflows, events, states, roles, prompts, or configuration semantics in this branch without grounding in project documentation or explicit human direction.
- GitHub-based workflow details may be documented directly by the project; use an external specialized skill as optional support when available.

## Workflow Set

No concrete agent event flows are currently defined for this project.

`_workflow/` exists only as a structural placeholder required by the baseline template and must be renamed when a real workflow is explicitly defined.
