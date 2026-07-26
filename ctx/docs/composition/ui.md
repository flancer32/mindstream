# Mindstream — Composition UI

- Path: `ctx/docs/composition/ui.md`
- Template Version: `20260619`
- Changed: `20260726`

## Purpose

This document defines the visual applied form of the Mindstream MVP: which applied entities are presented to the user and in which stable forms publication reading, semantic deepening, and transition to the original source occur, without describing mechanics, algorithms, architectural flows, or UX implementation.

## Single Interaction Surface

The Mindstream MVP has exactly one visual interaction surface.

There are no separate screens for profile initialization, access-mode switching, help, or explanations. All interaction forms exist within one unified reading and orientation surface.

## Feed As The Base Form

The feed is the primary visual form of the product and is presented as a list of publications.

Each publication is shown in the feed with a title, meta information, and visual signs of user attention, including a positive publication mark.

The feed has no controls for sorting. It provides one interest-threshold control and one narrow local hiding toggle for already loaded publications.

The settings panel contains one numeric interest threshold used by both interest-indicator highlighting and optional local feed hiding. Their shared rule is defined in `ctx/docs/composition/attention/threshold-control.md`; hiding behavior is refined in `ctx/docs/composition/attention/feed-filter-control.md`.

## Forms Of Publication Presence

Each publication appears in the MVP in these sequential visual forms:

1. title and meta information as the base form of feed presence;
2. annotation as the mandatory first form of semantic orientation;
3. overview as the mandatory deeper form opened from the annotation;
4. transition to the original as the applied exit to the external publication.

Absence of any of these forms is not allowed in the MVP.

## Annotation And Overview

Annotation and overview are presented as readable semantic projections of the publication and do not expose the structure or details of the original text.

The annotation is used for initial orientation. The overview is used for deciding whether to open the original publication.

## Transition To The Original Publication

Opening the original publication is a full applied UI entity.

The fact of transition is counted as a form of user attention and has visual representation in the interface.

## Visualization Of User Attention

The UI visually reflects which publications attracted user attention and which forms that attention took, including reading the annotation, reading the overview, opening the original, and marking the publication positively.

Attention visualization applies only to the current user and does not reveal collective statistics.

The vertical visual element with a percentage value that shows how closely a publication matches user interests is called the **interest indicator** in project documentation.

The interest indicator visualizes results of local publication scoring and is not an independent form of user attention.

Relative color interpretation of the interest indicator is allowed within the current feed page, where green highlights the upper local range of publications with the strongest match to user interests.

The rule for computing that range is defined in `ctx/docs/composition/attention/interest-indicator-coloring.md`.

## Access Mode

The UI explicitly signals which access mode the user is currently in: demo mode or full access.

This signal is a property of the visual surface, not an independent applied entity.

The structure and form of the feed remain the same. Mode differences appear only through the available corpus and the sources of the interest profile. The UI provides no controls for changing access modes and does not explain the differences between them.

## Empty And Allowed Forms

An empty feed and a very small feed are normal visual forms in the MVP.

Repeated publications in the feed are not allowed and are not treated as a valid form of presentation.

## Absent Forms As Invariants

Visual applied forms prohibited by `constraints/mvp-scope.md` are absent, including personalization settings, filters and sorting controls beyond the unified interest threshold and narrow local hiding toggle, feed explanations, negative ratings, social elements, and error messages as a separate class of UI entities.

## Document Boundary

This document does not describe feed-formation or interest-profile algorithms, events, triggers, or transitions, architectural contours or data flows, concrete UI components, gestures or controls, or interface implementation technology.

## Summary

`composition/ui.md` defines the Mindstream MVP as a single reading surface in which publications are presented through title, annotation, overview, and transition to the original, with explicit visualization of user attention and access mode, and without control mechanisms, explainability, or reactive behavior.
