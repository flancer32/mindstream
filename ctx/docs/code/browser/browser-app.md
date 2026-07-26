# Browser Application Overview

- Path: `ctx/docs/code/browser/browser-app.md`
- Template Version: `20260726`
- Changed: `20260726`

## Purpose

Defines the browser application delivery model, entry point, initialization, and the boundary between DOM-owning UI components and browser-local services.

## Delivery Model

Mindstream uses one static browser entry document enhanced by native ES modules and Web Components. It is not a client-side routed SPA and does not require framework bootstrapping.

## Entry Points

`web/index.html` hosts the `mindstream-feed` custom element and loads its ES module. Custom-element registration upgrades that host and starts feed initialization when it becomes connected.

The browser surface uses the document DOM as its styling boundary. Global CSS may style the registered elements and their light-DOM descendants.

## Main User Flows

- Load and progressively extend the publication feed.
- Inspect annotation and overview content and open the source publication.
- Activate the browser-bound profile UUID.
- Adjust one automatic or manual interest threshold and optionally hide publications below it.

Detailed presentation and action semantics remain in `ctx/docs/composition/`.

## Accessibility Baseline

Interactive elements use native buttons, checkbox, range input, links, details, and summary controls. Disclosure state is exposed through `aria-expanded`; icon-only actions have accessible names; keyboard dismissal includes `Escape`.

## Bootstrapping And Initialization

Custom-element registration upgrades the feed host. The connected feed restores optional browser-local settings, creates its child identity-menu component, initializes observers, and requests the first feed page. The scoring service initializes from the first feed payload and restored local attention state.

## UI Ownership And Module Boundary

JavaScript units that own a visible reusable UI region, DOM lifecycle, or document-level UI listeners must be implemented as Web Components.

Pure calculation, scoring, local-state, transport, and identity services remain ordinary ES modules. Such services must not be converted into custom elements solely to satisfy file-location conventions because they do not own DOM or a browser element lifecycle.

## State And Communication

The feed component owns loaded publications, pagination, local projection state, and card rendering.

The identity-menu component owns its panel DOM, identity activation interaction, and the unified interest-threshold controls. It communicates setting changes through a browser event and does not calculate publication scores or card visibility itself.

Browser-local persistence is an implementation concern of the feed boundary. One stored manual threshold may be absent to represent automatic mode; the hiding toggle is stored independently because it enables a consumer of the threshold rather than defining another threshold.

## Lifecycle

Document-level dismissal listeners and observers must be removed when their owning component disconnects.

The interface must remain usable before an interest profile exists: interest scores may be shown, but saved hiding state must not hide publications until the scoring service reports an active profile.
