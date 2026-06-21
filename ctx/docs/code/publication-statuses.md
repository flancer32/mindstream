# Code — Publication Statuses

- Path: `ctx/docs/code/publication-statuses.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines the normative registry of publication statuses in the Mindstream MVP, their contour ownership, and the permitted transitions between them.

## Status Registry

- `extract_pending` — ingestion; the publication is registered and waiting for Markdown-text extraction.
- `extracted` — ingestion; the publication Markdown text has been extracted and saved.
- `extract_failed` — ingestion; temporary failure during Markdown-text extraction.
- `extract_broken` — ingestion; Markdown-text extraction is considered impossible.
- `summary_ready` — processing; the Markdown annotation and Markdown overview have been produced.
- `summary_failed` — processing; generation of the Markdown annotation and overview failed.
- `embedding_pending` — processing; the publication is waiting for embedding calculation.
- `embedding_done` — processing; the annotation and overview embeddings have been saved.
- `embedding_failed` — processing; embedding calculation failed.

## Allowed Transitions

- `extract_pending` -> `extracted`.
- `extract_pending` -> `extract_failed`.
- `extract_pending` -> `extract_broken`.
- `extract_failed` -> `extract_pending`.
- `extracted` -> `summary_ready`.
- `extracted` -> `summary_failed`.
- `summary_ready` -> `embedding_pending`.
- `embedding_pending` -> `embedding_done`.
- `embedding_pending` -> `embedding_failed`.

## Transition Invariants

- `extract_broken` is a terminal state of the ingestion contour.
- `summary_failed` is a terminal state of the processing contour for semantic-representation generation.
- `embedding_failed` is a terminal state of the processing contour for embedding calculation.
- Any transition absent from this registry is invalid.
