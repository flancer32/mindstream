# Composition Documentation

- Path: `ctx/docs/composition/AGENTS.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

Defines the project-specific documentation branch for applied user-facing composition.

This branch records presentation shape, interaction framing, and user-visible state projections without redefining product meaning or architecture.

## Level Map

- `attention/` — deeper composition notes for attention-related user-visible projections.
- `AGENTS.md` — level definition for `ctx/docs/composition/`.
- `interaction.md` — admissible user actions as composition-level facts.
- `overview.md` — compact overview of the composition branch and its role.
- `state.md` — user-visible experience states and their composition-level distinctions.
- `ui.md` — visual and presentational composition of the user-facing surface.

## Level Boundary

Defines:

- User-facing composition structure and presentation-level distinctions.
- Interaction framing and experience-state projections subordinate to product meaning.
- The local document set for supervising project-specific composition extensions.

Does NOT define:

- Product vocabulary, roles, or semantic entities.
- Architecture boundaries, internal flows, or state authority.
- Implementation details such as components, source files, or CSS/JS mechanics.

## Dependency Position

This branch is a project-specific extension under `ctx/docs/`.

It must remain consistent with product meaning and must not override architecture, environment, or code constraints.
