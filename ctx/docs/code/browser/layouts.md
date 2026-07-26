# Layouts

- Path: `ctx/docs/code/browser/layouts.md`
- Template Version: `20260726`
- Changed: `20260726`

## Purpose

Defines the structural layout used by the browser application.

## Layout Catalogue

### Feed Layout

Regions:

- header — product title and identity-menu widget;
- status — loading, empty, filtered-empty, or failure feedback;
- feed — ordered publication-card sequence;
- sentinel — non-visible progressive-loading trigger.

## Region Rules

The header and status precede the publication sequence. The identity menu is anchored to the header and overlays content when open. The sentinel remains after all loaded cards. Hidden cards stay in the feed region so they can be restored immediately.

## Layout Usage

The Feed Page is the only page and always uses the Feed Layout.
