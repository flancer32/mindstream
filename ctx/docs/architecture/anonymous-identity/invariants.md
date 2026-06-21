# Anonymous Identity

- Path: `ctx/docs/architecture/anonymous-identity/invariants.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines the architectural model of **anonymous identity**: an anonymous identifier used in Mindstream as the anchor for collecting and aggregating attention statistics. It defines identity-registration invariants, allowed operations, and lifecycle boundaries within the MVP.

Anonymous identity is not a user, subject, profile, or participant in system interaction. It exists only as a technical identifier for the source of statistical signals.

## Anonymous Identity Concept

Anonymous identity is:

- a passive identifier;
- represented as a standard UUID;
- generated only on the frontend;
- bound to one browser profile.

Anonymous identity:

- has no authentication;
- has no access rights;
- has no user state;
- is not used to personalize system responses.

Using the term `user` for this entity is not allowed.

## Identity Registration

Registration of an anonymous identity is an **explicit architectural event**.

Registration invariants:

- The UUID must be registered on the server before any attention events are accepted.
- Events received without a registered identity are invalid and must not be accepted.
- Implicit identity registration through the first event is prohibited.
- Re-registering an existing UUID is idempotent and does not change system state.

Identity registration records only the existence of the UUID and does not create additional data.

## Identity Usage In The Write Path

Anonymous identity is used only in the write path for:

- linking attention events;
- deduplicating events;
- later server-side aggregation.

All attention events must:

- include the UUID of a registered identity;
- reference a concrete publication;
- have a fixed event type;
- include a UTC timestamp.

There is no read access to identity-related data in the MVP.

## Deduplication And Integrity

For one anonymous identity, no more than one event of the same type is allowed for the same publication.

Resending identical events is allowed, but must not change aggregated state. Idempotency is a storage invariant.

## Identity Lifecycle

The anonymous identity lifecycle includes these states:

1. No identity: the UUID has not been generated or has been removed on the frontend.
2. Registered identity without events.
3. Registered identity with attention events.

An anonymous identity without related events may be removed by TTL. Removing an identity causes loss of access to previously accumulated data and does not allow recovery.

## Constraints And Prohibitions

The following are prohibited in the MVP:

- using anonymous identity for personalization;
- linking identity to IP addresses or user-agent strings;
- introducing a read API for identity;
- treating identity as a user;
- storing any personal data.

Any expansion of the role of anonymous identity beyond these invariants is outside MVP scope and requires architectural revision.

## Related Documents

- `ctx/docs/architecture/data-flow/attention.md` — Attention flows.
- `ctx/docs/architecture/ingress/http-ingress.md` — HTTP ingress.
- `ctx/docs/architecture/ingress/attention-write-ingress.md` — write ingress for attention signals.

## Summary

This document defines anonymous identity as a technical write-path entity that is not a user and does not introduce personalization, and it establishes the invariants of its registration and use in the Mindstream MVP.
