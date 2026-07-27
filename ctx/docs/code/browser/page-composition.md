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

Interest threshold changes flow from Identity Menu to Feed. Score calculation and publication visibility never flow back into the menu as a second threshold; the menu reflects only the manual value or automatic mode.

## Exceptions

The filtered-empty state adds a local “show all” action to the status region. It disables hiding but does not change the interest threshold or highlighting.
