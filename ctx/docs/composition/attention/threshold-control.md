# Manual Threshold For Interest-Indicator Highlighting

- Path: `ctx/docs/composition/attention/threshold-control.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

This document defines the applied form of manual control over the color-highlighting threshold of the interest indicator.

The user can set the threshold value through a slider in the settings panel (hamburger menu in the top-right corner).

The value is interpreted directly: publications with the same or higher interest-indicator value are highlighted with a bright color.

For fine adjustment, decrease and increase arrows are available next to the slider and change the threshold by `1%` per action.

## Motivation

The automatic algorithm computes the threshold from the relative spread of scores in the loaded set. A user may want to control highlighting sensitivity manually:

- lower the threshold to see more potentially relevant publications;
- raise the threshold so that only the highest-scored publications are highlighted.

## Manual-Threshold Rule

When the user sets a manual threshold `p%`, where `p` is an integer from `0` to `100`, a publication is highlighted if its visible interest-indicator value is `>= p%`.

The internal rule exactly matches the visible indicator numbers:

`markThreshold = p / 100`

The manual threshold **fully replaces** the automatic algorithm described in `interest-indicator-coloring.md`.

The slider and arrows modify the same threshold value `p%`.

The arrows:

- decrease or increase the threshold by exactly `1%`;
- do not allow the value to leave the `0..100` range;
- persist the result the same way as slider-based changes.

## Return To Automatic Mode

The user may reset the manual threshold, after which highlighting is computed by the automatic algorithm again.

## Behavior For A Uniform Set

If several publications in the loaded set share the same indicator value, the manual threshold is still compared against their actual value.

The manual-threshold control remains active because the user sets a direct numeric threshold for the indicator, not a relative position inside the current set.

## Document Boundary

This document:

- applies only to browser-side UI composition;
- requires no backend participation;
- does not define CSS, DOM structure, component names, or implementation technology.
