# HTTP Ingress

- Path: `ctx/docs/architecture/ingress/http-ingress.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

**HTTP Ingress** is the infrastructure-level architectural boundary of Mindstream through which the system accepts all external HTTP requests from the web context and other HTTP clients.

HTTP Ingress accepts only read/write requests and passes them into the internal backend application without making domain decisions, generating identifiers, or managing state.

## Responsibility Boundary

HTTP Ingress is responsible for:

- receiving external HTTP requests;
- transferring control into the internal backend application;
- providing a single controlled HTTP boundary for the system.

HTTP Ingress is **not responsible** for:

- domain data-processing logic;
- lifecycle management of entities;
- storage or interpretation of data;
- UUID generation;
- authentication, authorization, or role handling.

## Architectural Invariants

The following inbound invariants are fixed for the MVP:

1. **Apache is a mandatory component of the runtime contour.** All external HTTP requests reach the system through Apache.
2. **Direct external access to the Node application is not allowed.** The Node application is not exposed directly to the external network. Direct access is allowed only in dev or test contours.
3. **HTTP Ingress is canonically implemented through `@teqfw/web`.** The `@teqfw/web` dispatcher model (`pre / process / post`) is part of the architectural invariant of the MVP. Alternative HTTP entry mechanisms or libraries are not provided.

## Read/Write Boundary

HTTP Ingress:

- accepts only read/write requests;
- is not a channel for batch or operational commands;
- does not expand architectural contours beyond ingress.

## Anonymous Identity And HTTP Ingress

In the MVP, HTTP Ingress works only with **anonymous identity** as the technical identifier of the source of write signals.

HTTP Ingress:

- **does not generate UUIDs**;
- **does not manage identity lifecycle**;
- **does not interpret identity as a subject**;
- **does not implement authentication or authorization**.

Write operations that require source identification are allowed **only when a registered anonymous identity exists**. Requests without registered identity are architecturally invalid for the corresponding write paths.

## Usage Context

HTTP Ingress exists for:

- delivering read models into the browser context;
- accepting statistical write events when architectural conditions are satisfied.

API formats, serialization approaches, and endpoint-handler implementation are not fixed at the architectural level.

## Related Architectural Documents

- `ctx/docs/architecture/anonymous-identity/invariants.md`
- `ctx/docs/architecture/ingress/attention-write-ingress.md`
- `ctx/docs/architecture/data-flow/attention.md`

## Summary

HTTP Ingress defines the infrastructure HTTP boundary of the Mindstream MVP, accepting read/write requests while preserving isolation of domain logic, identity, and storage from direct external access.
