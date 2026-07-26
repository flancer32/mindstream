# Pages

- Path: `ctx/docs/code/browser/pages.md`
- Template Version: `20260726`
- Changed: `20260726`

## Purpose

Defines the browser entry points and their user-facing purpose.

## Page Index

### Feed Page

- Entry: `/`
- Purpose: provide the single reading and orientation surface.
- Important actions: load publications, inspect semantic representations, open sources, activate identity, adjust the interest threshold, and toggle hiding below it.

There are no additional browser routes in the MVP.

## Access And Visibility

The page is available in demo and full-access modes. Corpus availability and attention-signal transmission differ by mode, but route and layout do not.

## Page-Specific Notes

The page uses progressive feed loading without URL transitions. Missing routes are handled by the delivery layer and do not introduce browser-side pages.
