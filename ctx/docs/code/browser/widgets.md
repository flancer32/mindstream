# Widgets

- Path: `ctx/docs/code/browser/widgets.md`
- Template Version: `20260726`
- Changed: `20260726`

## Purpose

Defines the widget catalogue for the Mindstream browser surface.

## Documentation Rules

Widgets describe visible reusable responsibilities. Their technical custom-element mapping is recorded here and refined in `web-components.md`.

## Shared Widgets

- Identity Menu — exposes profile identity and the unified interest controls in the feed header.

## Domain Widgets

- Feed — owns the publication stream and its local interest projection.
- Publication Card — presents one publication, its semantic representations, interest indicator, and reading actions.

## Page-Specific Widgets

No additional page-specific widgets are defined.

## Widget To Implementation Mapping

- Feed → `mindstream-feed`.
- Identity Menu → `mindstream-identity-menu`.
- Publication Card → internal light DOM of `mindstream-feed`; no independent custom-element contract exists in the MVP.
