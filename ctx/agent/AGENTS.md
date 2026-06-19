# Agent Operational Context

- Path: `ctx/agent/AGENTS.md`
- Template Version: `20260610`
- Changed: `20260619`

## Purpose

Defines the structure of agent-facing operational context for a typical ADSM project.

This level contains service assets that guide agent execution through project-local operational flows.

This level does not contain documents that regulate how agents design or generate product source code.

Its documents exist to organize interaction with agents and other AI collaborators through repository-local operational routines, routing, and workflow configuration.

## Level Map

- `flows/` — operational flow documentation and configuration for agent-executed project routines.
- `AGENTS.md` — level definition for `ctx/agent/`.

## Level Boundary

Defines:

- Agent-facing operational guidance for the project.
- Flow-routing context and execution boundaries for project-local routines.
- The structure of operational assets that support recurring agent work.

Does NOT define:

- Product meaning, domain scope, or user-facing requirements.
- Architecture ownership, system structure, or product-level engineering constraints.
- Runtime implementation behavior, source-code generation rules, coding style, or implementation decisions outside project-local agent operations.

## Operational Constraints

- Documents at this level may be more procedural than `ctx/docs/`, but must remain subordinate to declarative constraints defined there.
- Operational assets at this level should stay generic enough for the project type and should not duplicate product documentation.
- Operational assets at this level are service documentation for agent coordination and must not be treated as product-code authoring instructions.
- If only one operational branch exists, it should be represented as `flows/` and treated as the entry point for repository-local agent routines.
