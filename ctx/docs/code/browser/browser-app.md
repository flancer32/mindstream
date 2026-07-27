# Browser Application Overview

- Path: `ctx/docs/code/browser/browser-app.md`
- Template Version: `20260726`
 - Changed: `20260727`

## Purpose

Defines the browser application delivery model, entry point, initialization, and the boundary between DOM-owning UI components and browser-local services.

## Delivery Model

Mindstream uses one static browser entry document enhanced by a browser DI composition root and native Web Components. It is not a client-side routed SPA.

## Entry Points

`web/index.html` hosts the `mindstream-feed` custom element and loads `web/bootstrap.mjs`. The bootstrap loads the browser build of `@teqfw/di`, maps `Mindstream_Web_` to `/app/Web`, resolves `Mindstream_Web_App$`, and starts component registration before the host upgrades.

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

The DI-managed browser application registers component classes created by DI definitions. The connected feed restores optional browser-local settings, creates its child identity-menu component, initializes observers, and requests the first feed page. The scoring service initializes from the first feed payload and restored local attention state.

## UI Ownership And Module Boundary

JavaScript units that own a visible reusable UI region, DOM lifecycle, or document-level UI listeners must be implemented as DI-created Web Component definitions.

Pure calculation, scoring, local-state, transport, and identity services remain ordinary ES modules. Such services must not be converted into custom elements solely to satisfy file-location conventions because they do not own DOM or a browser element lifecycle.

## Module Decomposition

- `Mindstream_Web_App` — browser composition root application service; starts component registration.
- `Mindstream_Web_Component_Registry` — registers linked element classes under their public custom-element names.
- `Mindstream_Web_Component_Feed` — Feed Web Component definition; owns feed DOM, pagination, projection, and lifecycle listeners.
- `Mindstream_Web_Component_IdentityMenu` — Identity Menu Web Component definition; owns panel DOM and control events.
- `Mindstream_Web_Identity` — browser-local anonymous identity and attention-beacon transport service.
- `Mindstream_Web_Attention` — browser-local interest-vector state, persistence, scoring cache, and attention recording service.
- `Mindstream_Web_InterestScore` — publication-to-embedding adaptation for the attention service.
- `Mindstream_Web_InterestFilter` — visibility policy for a resolved threshold.
- `Mindstream_Web_InterestIndicator` — threshold and marker calculation service.
- `Mindstream_Web_Platform_Browser` — injected boundary for browser globals and constructors.

## State And Communication

The feed component owns loaded publications, pagination, local projection state, and card rendering.

The identity-menu component owns its panel DOM, identity activation interaction, and the unified interest-threshold controls. It communicates setting changes through a browser event and does not calculate publication scores or card visibility itself.

Browser-local persistence is an implementation concern of the feed boundary. One stored manual threshold may be absent to represent automatic mode; the hiding toggle is stored independently because it enables a consumer of the threshold rather than defining another threshold.

## Lifecycle

Document-level dismissal listeners and observers must be removed when their owning component disconnects.

The interface must remain usable before an interest profile exists: interest scores may be shown, but saved hiding state must not hide publications until the scoring service reports an active profile.
