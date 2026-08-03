# Code CLI Documentation

- Path: `ctx/docs/code/cli/AGENTS.md`
- Template Version: `20260619`
- Changed: `20260803`

## Purpose

Defines the local code documentation level for the command-line surface.

## Level Map

- `AGENTS.md` — level definition for `ctx/docs/code/cli/`.
- `command-tree.md` — normative command-tree structure and admissible command branches.
- `dispatcher.md` — Teq host model for command routing and termination semantics.
- `overview.md` — compact overview of the CLI role and its engineering boundaries.

## Level Boundary

Defines:

- The engineering model of the CLI surface.
- Stable command-routing and dispatch constraints.
- The local document set used to supervise CLI-specific implementation rules.

Does NOT define:

- Product meaning or user-facing outcomes outside the CLI surface.
- Broader architectural ownership outside CLI-related execution entry points.
- Runtime deployment procedures or agent operations.
