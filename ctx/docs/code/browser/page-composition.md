# Page Composition

- Path: `ctx/docs/code/browser/page-composition.md`
- Template Version: `20260726`
- Changed: `20260727`

## Purpose

Connects the browser page to its layout regions and widgets.

## Composition Matrix

| Page | Layout | Header | Status | Feed | Sentinel |
| --- | --- | --- | --- | --- | --- |
| Feed Page | Feed Layout | Product heading | Feed status feedback | Feed with Publication Cards | Progressive-loading trigger |

## Shared Composition Rules

The `mindstream-feed` element owns the layout. It contains one `mindstream-identity-menu` as a fixed floating widget and renders publication cards as feed data arrives.

The product-heading block is a single home link to `/`, including its title and subtitle. It remains available on both the paginated feed and a focused permalink view, so a focused card never removes the reader's return path to the feed.

Interest threshold changes flow from Identity Menu to Feed. Score calculation and publication visibility never flow back into the menu as a second threshold; the menu reflects only the manual value or automatic mode.

## Publication Card Composition

A publication card has a header, a reading body, and an Overview disclosure. The header places source and date metadata on the left and action buttons on the right.

The original-publication and permalink actions appear both in the header for rapid access and in the action row within an open Overview for contextual access. Both locations use the same icon-only action-button form, accessible names, hover and focus treatment, and target behavior. Moving an action to the header must not remove its contextual counterpart from the Overview action row.

## Exceptions

The filtered-empty state adds a local “show all” action to the status region. It disables hiding but does not change the interest threshold or highlighting.
