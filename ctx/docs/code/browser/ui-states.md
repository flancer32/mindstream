# UI States

- Path: `ctx/docs/code/browser/ui-states.md`
- Template Version: `20260726`
- Changed: `20260727`

## Purpose

Defines visible browser states for the feed page and identity-menu widget.

## Common States

- Initial/loading — the page displays loading feedback while requesting a feed page.
- Ready — one or more publication cards are visible.
- Empty — the backend feed contains no publications.
- Filtered empty — loaded publications exist, but all are hidden below the active interest threshold.
- End reached — no later feed page is available.
- Failure — feed loading failed and a concise failure message is shown.

Offline, forbidden, and not-found are not separate in-page states in the current static browser surface.

## Page-Level States

Before an interest profile exists, all loaded cards remain visible regardless of the saved hiding toggle. After a profile exists, hiding uses the same resolved cutoff as bright indicator highlighting.

The filtered-empty state reports the active cutoff and offers a “show all” action. The action disables hiding and immediately restores loaded cards.

## Widget-Level States

The Identity Menu is closed or open. It shows either the identity activation action or the current profile UUID. Its threshold is either automatic or a manual integer percentage, while hiding is enabled or disabled independently. Its About dialog is closed or open and presents the same static application-purpose description in English or Russian.

## State Transitions

- Feed loading moves to ready, empty, end reached, or failure.
- An attention action may activate the local interest profile and immediately apply saved hiding.
- Threshold adjustment recalculates highlighting and visibility in the same update.
- Disabling hiding restores cards without changing their highlighting.
