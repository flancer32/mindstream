# Interest Indicator Coloring

- Path: `ctx/docs/composition/attention/interest-indicator-coloring.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

This document defines the applied UI rule for color interpretation of the interest indicator in the Mindstream MVP.

The rule highlights publications that belong to the upper local interest range within the currently loaded set of feed items.

## General Principle

The coloring rule is relative, not absolute.

It is computed only from:

- interest-indicator values already shown for the currently loaded set of publications;
- the current page-local score range.

The rule does not require backend participation and does not depend on global statistics.

## Local Value Space

The algorithm uses the minimum and maximum visible indicator values within the currently loaded publication set.

Example:

- minimum value: `69%`;
- maximum value: `82%`;
- local value space: from `69%` to `82%`.

If `min == max`, the local value space is degenerate and all publications in the set are treated as belonging to the upper interest interval.

## Excluding The Top 10%

From the full local value space, the upper segment of `10%` of the interval width is excluded.

The cutoff is computed as:

`cutoff = min + (max - min) * 0.9`

All publications with value `>= cutoff` are excluded from calculation of the marking threshold. This protects the scale from single outliers when one publication receives a sharply increased score after a click.

If exclusion leaves no remaining data, degenerate mode is used: the marking threshold becomes `min`, and all publications are marked.

## Marking Threshold

On the remaining publications, a new minimum `min'` and maximum `max'` are computed.

From this reduced space, the upper segment of `20%` of the interval width is selected.

The marking threshold is:

`markThreshold = min' + (max' - min') * 0.8`

A publication belongs to the upper interest interval, and is highlighted, if its indicator value is `>= markThreshold`.

This rule is applied to **all** publications in the loaded set, including those excluded during the top-10% step. This means extreme high-score publications still receive highlighting without distorting the threshold.

In the degenerate case where `min' == max'`, the marking threshold is equal to that value, and all publications with `>= markThreshold` are highlighted.

## Full Algorithm

1. Find `min` and `max` across all loaded publications.
2. Compute `cutoff = min + (max - min) * 0.9`.
3. Exclude all publications with value `>= cutoff` from threshold calculation.
4. Find `min'` and `max'` among the remaining publications.
5. If no publications remain, set `markThreshold = min`.
6. Otherwise compute `markThreshold = min' + (max' - min') * 0.8`.
7. Highlight all publications with value `>= markThreshold`.

## Example

Input values: `[10%, 20%, 30%, 95%]`.

1. `min = 10%`, `max = 95%`.
2. `cutoff = 10 + (95 - 10) * 0.9 = 86.5%`.
3. `95%` is excluded.
4. `min' = 10%`, `max' = 30%`.
5. `markThreshold = 10 + (30 - 10) * 0.8 = 26%`.
6. `30%` and `95%` are highlighted.

Without top-10% exclusion, the threshold would be `78%`, so only `95%` would be highlighted.

## Visual Rule

The interest indicator uses a bright color for all publications that fall into the upper interest interval.

All other publications:

- are not treated as the most interesting within the loaded set;
- do not receive bright highlighting based only on the indicator value.

In this rule, bright color means not an absolute global level of interest but relative inclusion in the upper local range of the loaded set.

## Meaning For The User

The color interpretation is a visual cue that helps the user quickly identify publications that currently look most aligned with their interests.

The rule:

- does not explain the reason for a specific score;
- does not replace the percentage value of the indicator;
- does not promise objective importance outside the current local set.

## Manual Override

The user may set a manual highlighting threshold with the settings slider. In that case, the automatic algorithm described here is not used.

Manual mode compares a direct numeric threshold against the numeric indicator shown on the publication card.

The manual-threshold rule is defined separately in `ctx/docs/composition/attention/threshold-control.md`.

## Document Boundary

This document:

- applies only to browser-side UI composition;
- does not require backend participation;
- does not define CSS, DOM structure, component names, or implementation technology.
