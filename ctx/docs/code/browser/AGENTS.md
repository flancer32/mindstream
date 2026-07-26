# Browser Code Documentation

- Path: `ctx/docs/code/browser/AGENTS.md`
- Template Version: `20260726`
- Changed: `20260726`

## Purpose

Defines the code-level documentation branch for the browser-delivered Mindstream interface.

## Level Map

- `AGENTS.md` — level definition for `ctx/docs/code/browser/`.
- `browser-app.md` — browser delivery model, entry point, initialization, and UI ownership rules.
- `layouts.md` — feed-page layout catalogue and region rules.
- `page-composition.md` — mapping between the feed page, layout regions, and widgets.
- `pages.md` — browser page and entry-point catalogue.
- `ui-states.md` — visible page-level and widget-level browser states.
- `web-components.md` — custom-element catalogue and browser-facing component contracts.
- `widgets.md` — browser widget catalogue and Web Component mapping.

## Level Boundary

Defines:

- Browser UI ownership and bootstrapping constraints.
- Custom-element boundaries and communication contracts.
- Separation between DOM-owning components and browser-local service modules.

Does NOT define:

- Product meaning, user goals, or composition semantics.
- Backend behavior, persistence authority, or deployment topology.
- Concrete styling, internal DOM construction, or task procedures.

## Reading And Editing Rules

Read `browser-app.md` before changing browser UI structure. Read `web-components.md` before adding or changing a custom element or its public event contract.
