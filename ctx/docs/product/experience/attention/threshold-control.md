# Unified Interest Threshold Control

- Path: `ctx/docs/product/experience/attention/threshold-control.md`
- Template Version: `20260619`
- Changed: `20260727`

## Purpose

This document defines the one interest threshold used by both bright interest-indicator highlighting and optional local publication hiding.

The user can set the threshold value through a slider in the settings panel (hamburger menu in the top-right corner).

The value is interpreted directly: publications with the same or higher interest-indicator value are highlighted with a bright color and, when hiding is enabled, remain visible.

For fine adjustment, decrease and increase arrows are available next to the slider and change the threshold by `1%` per action.

## Motivation

The automatic algorithm computes the threshold from the relative spread of scores in the loaded set. A user may want to control the projection sensitivity manually:

- lower the threshold to highlight and optionally show more potentially relevant publications;
- raise the threshold so that only higher-scored publications are highlighted and optionally shown.

## Manual-Threshold Rule

When the user sets a manual threshold `p%`, where `p` is an integer from `0` to `100`, a publication is highlighted if its visible interest-indicator value is `>= p%`. If local hiding is enabled and an interest profile exists, the same comparison determines visibility.

The internal rule exactly matches the visible indicator numbers:

`markThreshold = p / 100`

The manual threshold **fully replaces** the automatic algorithm described in `interest-indicator-coloring.md` for both consumers.

The slider and arrows modify the same threshold value `p%`.

The arrows:

- decrease or increase the threshold by exactly `1%`;
- do not allow the value to leave the `0..100` range;
- persist the result the same way as slider-based changes.

## Return To Automatic Mode

The user may reset the manual threshold, after which one threshold is computed by the automatic algorithm again. Highlighting immediately uses the computed threshold; optional hiding uses it after an interest profile exists.

## Behavior For A Uniform Set

If several publications in the loaded set share the same indicator value, the manual threshold is still compared against their actual value.

The manual-threshold control remains active because the user sets a direct numeric threshold for the indicator, not a relative position inside the current set.

## Hiding Toggle

The settings panel provides a checkbox that only enables or disables hiding below the active interest threshold. It does not own a second numeric value and does not change highlighting.

The hiding toggle is enabled by default, persists locally, and has no visible effect before a meaningful interest profile exists.

## Document Boundary

This document:

- applies only to browser-side UI composition;
- requires no backend participation;
- does not define CSS, DOM structure, component names, or implementation technology.
