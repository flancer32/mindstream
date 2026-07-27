# Shared Transport Contracts

- Path: `ctx/docs/code/shared-contracts.md`
- Template Version: `20260727`
- Changed: `20260727`

## Purpose

Defines the code-level contract boundary shared by the Node.js backend and browser application.

## Ownership

`Mindstream_Shared_` contains only platform-neutral DTO creators, normalizers, validators, and pure calculations. It has no dependency on HTTP, DOM, browser storage, Node.js modules, logging, database access, clocks, or random generators.

`Mindstream_Back_` owns HTTP request decoding, database orchestration, and response delivery. `Mindstream_Web_` owns browser transport, persistence, DOM, and rendering. Both platform zones pass transport data through the same `Shared` contract services.

## Current Contract Catalogue

- `Mindstream_Shared_Api_Feed` creates a validated feed response, its sources, publication items, embeddings, and pagination cursor.
- `Mindstream_Shared_Api_Identity` creates an anonymous identity-registration DTO.
- `Mindstream_Shared_Api_Attention` creates and validates attention-signal DTOs, including the browser-event to persisted-event mapping.

Contract DTOs are immutable after creation. Invalid external data must be rejected at the boundary before it enters a platform-specific service.

## Evolution Rules

- A field that crosses the browser/backend boundary must be added to a `Shared` contract before either platform consumes it.
- Backward-compatible optional fields may be introduced only with validation in the `Shared` contract and tests for absent and present values.
- HTTP route names, status codes, SQL schemas, Web Components, and browser storage keys do not belong to `Shared`.
- Every `Shared` contract must have direct unit tests and must be resolvable from both configured DI roots.
