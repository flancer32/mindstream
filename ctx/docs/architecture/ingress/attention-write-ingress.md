# Attention Write Ingress

- Path: `ctx/docs/architecture/ingress/attention-write-ingress.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

**Attention Write Ingress** is a specialized architectural boundary of Mindstream through which the system accepts **write events for attention signals** that originate in the browser context.

This ingress exists only to record statistical facts of attention and is not a channel for reading data or controlling system state.

## Architectural Position

Attention Write Ingress:

- is a subset of HTTP Ingress;
- serves only write flows;
- belongs to the class of **Attention flows**;
- connects the browser contour of attention signals to the server-side storage contour.

This ingress does not participate in **Content Collection flows** and does not affect the canonical state of the Content Collection.

## Responsibility Boundary

Attention Write Ingress is responsible for:

- accepting write events for attention signals from the browser context;
- checking architectural validity of an event;
- passing valid events into the internal storage contour.

Attention Write Ingress is **not responsible** for:

- forming or interpreting the interest vector;
- aggregating statistics;
- affecting the order or composition of read models;
- providing read access to data.

## Ingress Invariants

The following invariants are fixed for the MVP:

1. **Write-only character**: Attention Write Ingress accepts only write events. Read operations through this ingress are architecturally prohibited.
2. **Statistical nature of events**: events are treated as records of attention facts, not as commands or control inputs to the system.
3. **No feedback loops**: accepting attention events does not trigger recalculation of the Content Collection, semantic representations, or embeddings.
4. **Fire-and-forget model**: the ingress is not required to return data used for further browser-side logic.

## Anonymous Identity As A Mandatory Condition

Every event accepted by Attention Write Ingress must be bound to a **registered anonymous identity**.

Architectural rules:

- the ingress accepts events **only** when a registered identity exists;
- events without identity are architecturally invalid;
- the ingress does not register identity;
- the ingress does not interpret identity as a subject.

The anonymous-identity model is defined in `ctx/docs/architecture/anonymous-identity/invariants.md`.

## Allowed Classes Of Attention Events

In the MVP, Attention Write Ingress accepts only events that correspond to architecturally allowed classes of attention signals.

Allowed classes:

- opening a publication overview;
- opening the publication source link;
- the combined fact of opening an overview and then opening the link.

This list is **closed** within the MVP. Expanding it requires revising the architectural documentation layer.

## Deduplication And Idempotency

Attention Write Ingress allows repeated submission of identical events from the browser contour.

Architectural invariants:

- for one anonymous identity, at most one event of the same type is allowed for one publication;
- repeated submission must not change aggregated state;
- idempotency is a storage invariant, not an ingress-logic invariant.

## Relation To Data Flows

Attention Write Ingress is the architectural entry point for **Attention flows** defined in:

- `ctx/docs/architecture/data-flow/attention.md`

The ingress does not change flow direction or expand flow role.

## Constraints And Prohibitions

The following are prohibited through Attention Write Ingress in the MVP:

- transmitting aggregated or interpreted data;
- performing read requests;
- requesting interest-vector state;
- using attention events as control commands;
- linking events to IP addresses or user-agent strings.

## Document Boundary

This document:

- does not describe API endpoints or their formats;
- does not define DTOs or payload structures;
- does not define transport mechanisms;
- does not describe implementation of ingress handlers;
- does not contain product UI scenarios.

All of these belong to the implementation or composition level and are not fixed at the architectural level.

## Related Architectural Documents

- `ctx/docs/architecture/anonymous-identity/invariants.md`
- `ctx/docs/architecture/ingress/http-ingress.md`
- `ctx/docs/architecture/data-flow/attention.md`
- `ctx/docs/architecture/attention/interest-vector.md`

## Summary

Attention Write Ingress defines the architecturally valid write path for statistical attention signals in the Mindstream MVP, preserving isolation of the Content Collection from attention, absence of reactive effects, and strict dependence on the anonymous-identity model.
