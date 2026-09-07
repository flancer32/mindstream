# Layouts

- Path: `ctx/docs/code/browser/layouts.md`
- Template Version: `20260726`
- Changed: `20260907`

## Purpose

Defines the structural layout used by the browser application.

## Layout Catalogue

### Feed Layout

Regions:

- header — product title;
- feed — ordered publication-card sequence;
- status — loading, empty, filtered-empty, or failure feedback;
- sentinel — non-visible progressive-loading trigger.

## Region Rules

The header precedes the publication sequence. Status feedback follows loaded publications so pagination failures and recovery remain close to the end of the stream. The identity menu occupies the header region. The sentinel remains after all loaded cards. Hidden cards stay in the feed region so they can be restored immediately.

## Layout Usage

The Feed Page is the only page and always uses the Feed Layout.
