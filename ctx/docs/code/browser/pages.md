# Pages

- Path: `ctx/docs/code/browser/pages.md`
- Template Version: `20260726`
- Changed: `20260829`

## Purpose

Defines the browser entry points and their user-facing purpose.

## Page Index

### Feed Page

- Entry: `/`
- Purpose: provide the single reading and orientation surface.
- Important actions: load publications, inspect semantic representations, open sources, activate identity, adjust the interest threshold, and toggle hiding below it.

### Publication Permalink

- Entry: `/?publication={positive-integer-id}`.
- Purpose: present one processed publication with the same card composition and reading actions as the feed, with its Overview disclosure expanded.

There are no additional browser pages in the MVP.

## Access And Visibility

The page is available in demo and full-access modes. Corpus availability and attention-signal transmission differ by mode, but route and layout do not.

## Page-Specific Notes

The feed page uses progressive loading without URL transitions. A publication permalink is a query-string variant of the same static entry document; it loads one publication directly instead of discovering it through feed pagination. The complete product-heading block links to `/` so a focused publication view always provides a return path to the feed.
