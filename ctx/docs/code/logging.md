# Code Logging — MVP

- Path: `ctx/docs/code/logging.md`
- Template Version: `20260619`
- Changed: `20260620`

## Purpose

This document defines the normative logging principles of the Mindstream MVP code layer.

Logging is treated as a mandatory observability layer that provides reproducible visibility into code execution without affecting product data, architectural flows, or system behavior.

This document belongs only to the `code/` layer and does not introduce architectural, product, composition, or operational decisions.

## Logging Status In The MVP

Within the Mindstream MVP:

- logging is mandatory;
- absence of logging around meaningful actions or errors is an engineering defect;
- logging is not optional diagnostics and cannot be excluded under the excuse of MVP scope.

Logging provides observability of execution but does not participate in system control.

## Status Of Logs As Data

Logs:

- are allowed as an external observational trace of execution;
- are not part of product data;
- do not belong to the Mindstream architectural data model;
- are not used by the system as a source of truth, input, or state-recovery mechanism.

Logs are not part of:

- `Storage`;
- attention signals;
- aggregated attention statistics.

Using logs as a hidden data flow, a side channel for data transfer, or a source of computation is prohibited.

Deletion, unavailability, or rotation of logs does not affect system correctness.

## Logging Levels

The MVP uses a strictly fixed set of logging levels:

- `debug`
- `info`
- `warn`
- `error`

This set is normative.

Absence of a level, arbitrary custom levels, or semantic distortion of levels is a code-layer violation.

## The `exception` Method

Exceptions are logged through a separate method `exception`.

`exception`:

- is not an alias of `error`;
- is intended only for exceptional situations;
- accepts the standard JavaScript `Error` object.

The MVP uses the built-in `Error` contract without custom or extended exception types.

When logging through `exception`, the following must be recorded:

- `error.message`;
- `error.stack`;
- `error.cause`, if present.

Using `error` instead of `exception` to log `Error` objects is a semantic violation.

## Namespace As Mandatory Context

Every log message must contain a namespace.

- the namespace is passed on every logging call;
- missing namespace is an engineering defect;
- the logger does not store the current namespace internally.

The logger is a singleton per execution area:

- one instance for the frontend context;
- one instance for the backend context.

## Logging Input And Output Contract

### Logging Input

Each logging call accepts:

- `namespace`;
- `message` as a string;
- arbitrary additional arguments.

### Logging Output

Logging output is minimally structured and includes:

- timestamp;
- level;
- namespace;
- message;
- additional arguments.

The exact serialization format is not fixed byte-by-byte, but these components are mandatory.

## Platform Neutrality

`Mindstream_Shared_Logger` belongs to the `Mindstream_Shared_` zone and is treated as platform-agnostic.

- the logger does not use platform APIs directly;
- output goes through the console mechanism provided by the runtime;
- the logger does not distinguish frontend from backend by behavior, only by application area.

## Logging And Unit Tests

In unit tests:

- the logger may be mocked with a no-op stub;
- the production logger implementation may be absent;
- the code must still call the logger regardless of whether it is mocked.

Logging is not part of the tested contract and is not used for assertions.

## Document Boundary

This document does not describe logger implementation, log-storage formats, aggregation, rotation, delivery, external observability integration, or operational procedures.

These questions are outside the scope of the MVP and this documentation layer.

## Summary

This document defines logging in the Mindstream MVP as a mandatory, platform-neutral observability layer with fixed level semantics, explicit use of the standard `Error` object, and a strict namespace requirement, without turning logs into product data or an architectural mechanism.
