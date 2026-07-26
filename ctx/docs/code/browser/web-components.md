# Browser Web Components

- Path: `ctx/docs/code/browser/web-components.md`
- Template Version: `20260726`
- Changed: `20260726`

## Purpose

Defines the custom-element catalogue for the Mindstream browser surface and the stable responsibility boundary of each element.

## Documentation Rules

Each entry defines a custom element's role, public communication surface, lifecycle ownership, and widget mapping. Internal DOM structure and styling mechanics are not public component contracts.

## Component Index

- `mindstream-feed` — Feed widget and browser application owner.
- `mindstream-identity-menu` — Identity Menu widget and unified interest-control owner.

## `mindstream-feed`

Role: browser application and feed owner.

Responsibilities:

- load feed pages and render publication cards;
- coordinate local interest scoring and attention updates;
- resolve one automatic or manual interest threshold;
- apply that same resolved threshold to highlighting and optional hiding;
- persist the manual threshold and hiding toggle;
- present loading, empty, filtered-empty, ready, and failure states.

The element consumes `interest-settings-change` from its identity-menu child. It does not expose the interest vector to UI children.

## `mindstream-identity-menu`

Role: identity-panel and interest-control owner.

Responsibilities:

- open and dismiss `identity-menu__panel`;
- present or activate the browser-bound profile UUID;
- present one interest-threshold slider, one-percent step actions, and automatic reset;
- present the independent checkbox that enables hiding below the same threshold;
- reflect externally assigned `thresholdPercent` and `filterEnabled` properties.

Event:

- `interest-settings-change` — bubbling `CustomEvent` with `{thresholdPercent, filterEnabled}`. `thresholdPercent` is an integer from `0` to `100` or `null` for automatic mode.

The element does not calculate scores, resolve the automatic cutoff, hide cards, or persist a second numeric threshold.

## Composition

`mindstream-feed` contains one `mindstream-identity-menu`. Publication cards remain internal feed DOM because they are not currently an independently reusable widget or public custom-element contract.

## Widget Mapping

- Feed widget → `mindstream-feed`.
- Identity Menu widget → `mindstream-identity-menu`.

## Technical Conventions

Components use light DOM and documented properties and events for parent-child communication. Each component owns cleanup of observers and document-level listeners created during its connected lifecycle. Native controls retain their accessibility semantics.
