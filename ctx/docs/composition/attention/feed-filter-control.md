# Feed Hiding Control

- Path: `ctx/docs/composition/attention/feed-filter-control.md`
- Template Version: `20260725`
- Changed: `20260726`

## Purpose

Defines the reader-facing toggle that hides already loaded publications below the same interest threshold used for bright indicator highlighting.

## Default And Threshold Semantics

Hiding is enabled by default. It has no independent numeric value. The displayed percentage, range adjustment, one-percent steps, and automatic reset all belong to the unified interest-threshold control defined in `threshold-control.md`.

A publication is shown when its local score is equal to or above the active threshold. That exact comparison also determines bright highlighting, including equality at the boundary.

## Profile And Highlighting Relationship

Before a meaningful attention signal forms an interest profile, all publications remain shown and the saved hiding state has no effect. Highlighting may still present the current threshold projection, but hiding never introduces a separate cutoff.

## Filtered Feed State And Pagination

Hidden cards remain available for immediate restoration. If all available backend pages have been loaded and every loaded card is hidden, the feed states that no publications meet the current threshold and offers an action to disable hiding. While more pages are available, loading continues one page at a time until a visible card is found or the feed ends.

## Boundary

The filter is a browser-local projection. It does not change order, corpus contents, attention statistics, backend availability, or another browser context.
