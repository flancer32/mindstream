# Layouts

- Path: `ctx/docs/code/browser/layouts.md`
- Template Version: `20260726`
- Changed: `20260727`

## Purpose

Defines the structural layout used by the browser application.

## Layout Catalogue

### Feed Layout

Regions:

- header — product title;
- status — loading, empty, filtered-empty, or failure feedback;
- feed — ordered publication-card sequence;
- sentinel — non-visible progressive-loading trigger.

## Region Rules

The header and status precede the publication sequence. The identity menu is a fixed floating widget above the page and does not occupy a feed-layout region. The sentinel remains after all loaded cards. Hidden cards stay in the feed region so they can be restored immediately.

## Layout Usage

The Feed Page is the only page and always uses the Feed Layout.
