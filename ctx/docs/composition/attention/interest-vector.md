# Interest Vector Calculation And Use On The Frontend

- Path: `ctx/docs/composition/attention/interest-vector.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

This document describes the **applied composition** of interest-vector calculation and usage in the Mindstream frontend application.

It defines:

- the order and moments of interest-vector updates;
- its storage and restoration mode;
- the rules for using the interest vector when scoring publications;
- the interaction boundary between the attention module and the UI.

The meaning and architectural invariants of the interest vector are defined in `ctx/docs/architecture/attention/interest-vector.md` and are not duplicated here.

## Role Of The Interest Vector In Frontend Composition

The interest vector is:

- internal state of the attention module;
- local and non-canonical applied state;
- an aggregated derivative of user attention signals.

It is **not** part of global UI state and is **not exposed directly** to external components.

## Initialization

When the frontend application starts:

- the attention module attempts to restore the interest vector from browser-local storage;
- if no saved data exists, the interest vector is initialized as zero.

Initialization:

- does not use historical attention signals;
- does not run background computation;
- does not initiate server requests.

## Interest Vector Update

### Update Triggers

The interest vector is updated **strictly by user attention events**, namely:

- opening a publication overview;
- opening the source link;
- the sequence of overview opening followed by source-link opening.

Background or periodic updates are not allowed.

### Update Order

On each attention event:

1. The interest vector is updated.
2. Publication scores are recalculated relative to the updated interest vector.
3. Scoring results are cached until the next attention event.

## Contribution Aggregation

### General Principle

The interest vector is a **normalized aggregated representation** of user interests in a shared semantic space.

Each new contribution:

- is always added to the current interest vector;
- is followed by vector normalization;
- must not increase the vector without normalization.

### Combined Signals

The scenario `overview + link transition` is treated as **two sequential contributions**:

1. contribution from opening the overview;
2. contribution from opening the source link.

The contribution from the link after overview has higher priority than a standalone link click, reflecting lower confidence in accidental clicks.

## Decay

In the MVP:

- the interest vector accumulates and normalizes;
- explicit contribution decay **may be absent**.

Architecturally, this means:

- without storing contribution statistics, the interest vector may stabilize around the user's current interests;
- decay mechanisms may be added later without changing external composition.

If decay is used:

- it is applied **when the interest vector is updated**;
- it requires no background process;
- it is not numerically fixed at the composition level.

## Use Of The Interest Vector

The attention module uses the interest vector for:

- estimating a user's potential interest in each publication;
- sorting items in the personal feed;
- excluding publications with insufficient relevance.

Scores:

- are recalculated on every interest-vector update;
- are cached until the next attention event;
- are used by the UI without direct access to the interest vector.

## Interaction With The UI

The interest vector:

- is hidden internal state of the attention module;
- is not read directly by the UI;
- is not used by UI components for their own logic.

The UI interacts with the attention module **only through publication-scoring results**, such as:

- sorted lists;
- priorities;
- filtered items.

These results also include the value of the interest indicator and the derived visual rules used to present it on the current page.

Color interpretation of the interest indicator is defined separately in `ctx/docs/composition/attention/interest-indicator-coloring.md` and uses only the locally available range of already calculated publication scores.

## Persistence

The interest vector:

- is stored locally in the frontend context;
- survives browser restarts;
- may be lost when the user manually clears browser storage.

Metadata such as last-update timestamp:

- is treated as an internal implementation detail;
- is not fixed at the composition level.

## Resetting The Interest Vector

In the MVP, manual reset of the interest vector by the user is allowed.

Reset:

- returns the interest vector to the zero state;
- requires no server interaction;
- does not break system integrity.

## Responsibility Boundary

This document does not describe storage formats, data structures, formulas, or numeric coefficients.

It defines the **order of operations and applied-logic modes of the frontend** while staying within composition-level boundaries.
