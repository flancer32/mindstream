# Code Testing — Invariants

- Path: `ctx/docs/code/testing.md`
- Template Version: `20260619`
 - Changed: `20260727`

## Purpose

This document defines the rigid engineering invariants for testing the Mindstream code layer.

Tests are treated as a first-class part of the codebase, not as auxiliary artifacts. Violating this document is a defect.

This document is not a guide to writing tests and does not define concrete test scenarios.

## Status Of Tests In The Project

Tests belong to the same code layer as production code. For all backend and frontend `.mjs` modules, unit tests are the default norm. Absence of tests is allowed only for entry points and explicitly fixed stable interfaces.

## Namespaces And Test Zones

Tests use the same namespaces as production code: `Mindstream_Back_`, `Mindstream_Web_`, and `Mindstream_Shared_`.

Test-only namespaces such as `Mindstream_Test_*` are not allowed. Tests verify code within the same namespace boundaries in which it is used in production.

## DI And Composition Root In Tests

Each unit test creates its own DI container. The DI container is not reused across tests. All tests run in test mode through `enableTestMode()`.

### Test Composition Root

Tests use a dedicated composition root independent from production. Resolver configuration may be minimal and sufficient for the concrete test. Helper modules must be pure container factories, must not inject unused dependencies, and must not hide DI configuration.

## Imports And Access To Production Code

Tests must not statically import production code from `src/` or `web/app/`, must not directly import production modules even for form validation, and must not bypass the DI container by any means.

Static import is allowed only for test helpers, fixtures, snapshot data, and standard Node.js modules from `node:*`. Access to production code is performed only through the DI container via `container.get(...)`.

A test that bypasses the DI container is not a valid project test.

## Platform API And Side Effects

Real side effects are prohibited in tests, including filesystem access, network access, sockets, timers, and background processes. Any access to platform APIs must happen only through DI. Mocking platform dependencies is fully allowed.

## Test Types

Only unit tests are allowed in the MVP. Integration, e2e, snapshot, property-based, and fuzz tests are not used.

## Testing Tools

The normative testing stack is `node:test` and `node:assert/strict`.

Using third-party libraries is allowed only with explicit human approval. Preference is given to standard Node.js tools.

## Logging In Tests

Using the production logger in unit tests is not mandatory. `console.log` may be used for diagnostics. Test logs are not part of the checked contract, are not used for assertions, and are treated only as debug output.

## Idempotency And Isolation

Each test must be idempotent and must not leave traces of execution behind. If a test changes global state such as `process`, `window`, or `document`, it must restore that state in `finally`. Shared state inside a single test file is allowed only if the tests remain logically isolated.

## Web Tests

Frontend code is tested in Node.js. Real browsers and e2e tests are absent in the MVP. Libraries such as `jsdom` and `happy-dom` are not allowed.

DI-managed frontend modules receive manual browser API mocks through `Mindstream_Web_Platform_Browser$`. Web Component definitions are resolved through the test container, then exercised against minimal manual browser globals. Such tests must restore changed globals after execution.

## Document Status

The rules in this document are rigid engineering invariants. Violating any of them is a codebase defect and is not treated as a recommendation, style preference, or technical debt.
