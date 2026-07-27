# Mindstream — Composition Interaction

- Path: `ctx/docs/product/experience/interaction.md`
- Template Version: `20260619`
- Changed: `20260727`

## Purpose

This document defines the permitted user actions in the Mindstream MVP as applied facts of activity and describes them declaratively without scenarios, sequences, or UX mechanics.

## Description Principle

In this document, an action is a fact of user activity with product-level meaning.

The document defines which actions exist without describing how, when, or under what conditions they happen.

## Basic User Actions

The following user actions exist in the Mindstream MVP.

### Feed Orientation

The user scans the publication feed as a personal projection of the available corpus.

This action records initial contact with publications and is not treated as deep attention.

### Interest-Threshold Adjustment

The user may adjust one local interest threshold that controls bright indicator highlighting and, after an interest profile exists, may independently enable or disable hiding below that same threshold. These actions do not control scoring, ranking, or the shared corpus.

### Reading The Annotation

The user reads the publication annotation.

This is the first form of semantic deepening and marks the shift from orientation to attention.

### Reading The Overview

The user reads the publication overview.

This action reflects a higher level of semantic attention and a deeper stage of reading after the annotation.

### Opening The Original Publication

The user opens the original external publication.

This action is a form of explicit attention and reflects movement toward the source material.

### Positive Mark On A Publication

The user explicitly records a positive attitude toward a publication as a form of attention.

This action is an independent positive mark and does not replace the access sequence of other publication interactions.

## Hierarchy Of Attention Actions

The actions that reflect access and attention deepening form an ordered hierarchy of increasing attention:

1. feed orientation;
2. reading the annotation;
3. reading the overview;
4. opening the original publication.

This hierarchy reflects the sequence of user access to a publication and belongs to the applied level, not the architectural processing of attention signals.

A positive mark is a separate attention action and may accompany any form of access.

## Missing Actions

Actions prohibited by `../constraints/mvp-scope.md` are absent, including:

- negative publication ratings;
- controlling algorithms or personalization parameters beyond the unified local interest threshold and hiding toggle;
- manual sorting of the feed;
- explanations of why the feed was formed;
- social interaction;
- content creation or editing.

## Document Boundary

This document does not describe UX sequences or user scenarios, visual mechanics or controls, events, triggers, or system reactions, data recording, storage or processing, or architectural and computational processes.

## Summary

`product/experience/interaction.md` defines the permitted user actions of the Mindstream MVP as a bounded set of applied activity facts that form a hierarchy of access-to-attention forms, without moving into mechanics, implementation, or architecture.
