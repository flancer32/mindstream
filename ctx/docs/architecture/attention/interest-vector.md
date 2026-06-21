# User Attention Model

- Path: `ctx/docs/architecture/attention/interest-vector.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

The user interest vector is a local aggregated representation of a user's semantic preferences, formed from **explicit acts of attention** and used to estimate the user's potential interest in publications.

The interest vector is used for:

- estimating publication relevance relative to the user's current attention;
- locally reordering items in the personal feed.

The vector is **not**:

- a user profile;
- a viewing history;
- canonical system state;
- a personality model or long-term-intent model.

It reflects **current and accumulated attention**, including decay of past contributions.

## Responsibility Boundary

This document defines:

- the architectural role of the interest vector;
- the sources of attention signals;
- qualitative signal priorities;
- accumulation and decay principles;
- storage and usage boundaries in the MVP.

This document does **not** define:

- interest-vector update algorithms;
- formulas, coefficients, or numeric parameters;
- concrete UI events or handlers;
- storage mechanisms;
- server-side personalization models.

## Placement And Lifecycle

In the MVP:

- the interest vector is formed and used **only on the frontend**;
- it is stored in the local frontend context and survives application reloads;
- the server does not receive, store, or interpret the interest vector;
- the interest vector is not canonical state and may be lost completely without breaking system integrity.

Loss of the local interest vector is treated as an acceptable loss of derived state.

## Formation Principle

The interest vector is updated **only from deliberate user actions** interpreted as attention signals.

Showing content without user action is **not** an attention signal and does not affect the interest vector.

The vector is an aggregate derivative of:

- semantic representations of publications;
- user attention acts.

## Accumulation And Decay

The interest vector is **accumulating but decaying state**.

Architectural principles:

- the contribution of each attention signal is preserved over time;
- signal contribution **decreases as time passes from the interaction moment**;
- the interest vector reflects current interests rather than the full interaction history.

Decay mechanisms are:

- local;
- deterministic within the frontend;
- not synchronized with the server;
- not numerically fixed at the architectural level.

## Attention Signals

### Counted Signals

#### 1. Interaction With A Publication Overview

Opening an overview is an attention signal.

- Overview reading time is not taken into account.
- The opening action itself is treated as sufficient evidence of interest.

Signal character:

- medium strength;
- reflects interest in the interpretation and semantic content of the publication.

#### 2. Opening The Source Link (`source_url`)

Opening the source is an attention signal of higher strength.

- Repeated openings of the same publication are not normalized in the MVP.
- Each opening is interpreted as a separate attention fact.

Signal character:

- strong;
- reflects confirmed interest in the source material.

#### 3. Combined Signal: Overview + Source Link

The scenario where the user:

- opens the publication overview;
- and then opens the source link,

is treated as the **strongest expression of attention**.

The combined signal:

- does not cancel previous signals;
- is interpreted as a reinforced contribution to the interest vector.

### Signals Not Counted

#### Publication Annotation

The annotation:

- is always available to the user by default;
- is part of the background interface context.

The annotation is **not treated as an attention signal** and does **not participate** in interest-vector updates.

#### Passive Feed Scrolling

Feed scrolling without explicit actions:

- is not treated as a deliberate choice;
- is not used to update the interest vector in the MVP.

## Signal Priority

Attention signals differ in priority as follows, from weaker to stronger:

1. Opening the overview.
2. Opening the source link.
3. Opening the overview and then the source link.

These priorities are qualitative and are used to interpret contributions without numeric coefficients at the architectural level.

## Use Of The Interest Vector

The interest vector is used:

- for local estimation of the user's potential interest in each publication;
- as input to ranking items in the personal feed.

The interest vector is **not used**:

- to filter the Content Collection;
- to change server-side data;
- to form canonical read models.

## MVP Constraints

- The interest vector is not synchronized across devices.
- There is no server-side interpretation of the interest vector.
- There is no shared user profile.
- Decay mechanics are not numerically normalized.
- Loss of local state is acceptable.

All of these constraints are **architectural properties of the MVP**.

## Invariants

- The interest vector is local and non-canonical state.
- The interest vector is updated only by user actions.
- Absence of actions does not change the vector.
- Showing text is not an attention signal.
- The annotation does not participate in interest-vector calculation.
- Signal contribution decreases over time.
- Combining actions strengthens contribution but does not cancel previous contributions.

## Related Documents

- UI architecture documents that define sources of user actions.
- Attention data-flow documents.
- Embedding and semantic-representation documents.
