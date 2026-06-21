# Mindstream — Composition State

- Path: `ctx/docs/composition/state.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines the permitted user-experience states in the Mindstream MVP as stable forms of reading and attention, not as system states, execution stages, or transitions.

## Description Principle

In this document, a state is a normal form of user experience within the product and constraint invariants of the MVP.

Causes, events, transitions, and triggers are not described here.

## Basic Experience States

### Reading In Demo Mode

The user reads publications from the demo corpus.

State characteristics:

- the user profile is not initialized and no UUID exists;
- the personal feed is formed locally;
- attention signals are recorded and used locally;
- there is no participation in server-side statistics.

This state is valid and self-sufficient.

### Reading In Full-Access Mode

The user reads publications from the full data corpus.

State characteristics:

- the user profile is initialized and a UUID exists;
- the personal feed is formed locally using available server data;
- attention signals participate in aggregated statistics;
- the access mode is visually indicated.

This state is valid and requires no additional confirmation.

## Feed States

### Empty Feed

The absence of publications in the feed is a normal user-experience form.

Emptiness is not treated as an error, failure, or temporary state.

### Small Feed

A feed with a very limited number of publications is an allowed experience form.

A small feed does not require explanation and is not considered interface degradation.

## Publication States

For each publication, the following user-experience state forms exist in the MVP and reflect sequential deepening of attention:

- the publication is present in the feed with title and meta information;
- the annotation has been read;
- the overview has been read;
- the original publication has been opened.

These states form an ordered sequence of increasing attention.

This sequence belongs to the applied user experience and does not describe the architectural attention-signal model.

Each later state is possible only after the previous one is reached, and deeper attention does not cancel or replace earlier forms of attention.

## User Attention States

Only positive forms of user attention are allowed in the MVP:

- attention recorded at the annotation level;
- attention recorded at the overview level;
- attention recorded through opening the original;
- attention recorded through a positive publication mark.

A positive mark is an independent form of attention and may accompany any form of access.

Absence of attention to a publication is a normal state.

Negative forms of attention and rating are absent.

## Prohibited And Absent States

States prohibited in `constraints/mvp-scope.md` are absent, including:

- repeated publication state in the feed;
- error state as a separate user-experience form;
- state of controlling algorithms or personalization parameters;
- state of explaining why the feed was formed;
- state of social interaction.

## Document Boundary

This document does not describe transitions between states, causes of states, events, signals and triggers, architectural or computational states, or the visual mechanisms that implement these states.

## Summary

`composition/state.md` defines the permitted user-experience states of the Mindstream MVP as stable forms of reading, attention, and presence inside the product, including valid emptiness states and constraints, without moving into mechanics, architecture, or implementation.
