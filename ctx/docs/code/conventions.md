# Code Conventions — MVP

- Path: `ctx/docs/code/conventions.md`
- Template Version: `20260619`
 - Changed: `20260803`

## Purpose

This document defines the **engineering code conventions of the Mindstream MVP**.

It specifies allowed languages, code-organization forms, execution models, and engineering invariants mandatory for the whole MVP codebase.

This document does not describe system architecture, product properties, or the user interface.

## Language And Dialect

- The primary code language is **JavaScript**.
- Server and client code are written in JavaScript.
- Other formats are allowed only for declarative configuration and infrastructure scripts.
- Only JavaScript counts as executable product code.
- Project-owned server code and other explicitly DI-managed modules follow **Tequila Framework** principles:
- dependency injection through the constructor;
- use of `@teqfw/di` as the DI container.
- Static imports in server and DI-managed modules are allowed only in the composition root.
- In all other server and DI-managed code, dependencies are resolved through DI and container-driven dynamic import.
- Browser-delivered project modules under `web/app/Web/` are DI-managed; only `web/bootstrap.mjs`, the browser composition root, may statically import `@teqfw/di`.
- CommonJS is allowed only inside third-party dependencies.

## Code Execution Environment

- Code may be **shared** and used both on the server and in the browser.
- Code intended only for Node.js or only for the browser is allowed.
- Separation between server and client does not affect the dependency-injection model.
- Conditional runtime logic and feature detection are allowed.

## Environment Configuration

- Environment configuration is read from `process.env`.
- `.env` support is implemented **natively** through platform means such as `fs`, without third-party libraries.
- `.env` loading is performed explicitly by the backend CLI lifecycle plugin before command selection.
- Values from `.env` must not overwrite already defined environment variables.
- Packages such as `dotenv`, `env`, and similar are **not allowed by default** and require explicit human approval.
- `process.env` is treated as an allowed form of platform-provided global state.

## Dependencies And Imports

- Third-party libraries may be used only with explicit human approval.
- Native platform capabilities are preferred.
- The following are prohibited:
- large frameworks;
- code generation;
- decorators.
- `@teqfw/di` is the only allowed DI container.
- Direct use of platform APIs such as DOM, Fetch, `fs`, and `process` is allowed without abstraction layers.
- Adding dependencies that duplicate standard platform capabilities is undesirable and requires justification.

## Asynchrony And Execution Control

- Asynchrony is the base execution mode through `async/await`.
- The following are allowed:
- callbacks, including public contracts;
- event emitters;
- reactive abstractions such as streams and observables.
- Background execution such as timers and workers is allowed.

## State And Mutability

- Mutable state is allowed but undesirable.
- Functional style has priority.
- The code should adhere as much as possible to:
- data immutability;
- one-way state changes.
- Global state is allowed only in platform-provided forms such as `process` and `window`.
- User-defined global state should be avoided.

## Errors And Failures

- Errors are treated as **observable facts**.
- Errors must be logged.
- After recording an error, code must not crash the application.
- Error suppression is allowed only after logging.

## Code Format And Structure

- Module and class names follow Tequila Framework rules.
- The project root namespace is declared explicitly.
- Browser DI modules use the `Mindstream_Web_` namespace. Native Web Component classes returned by their definitions are registered under `mindstream-*` names by the DI-managed component registry.
- No rigid module-length limit is fixed, but keeping modules within roughly three screens is recommended.
- “Quick code” without structure is not allowed, including in the MVP.
- Code duplication is allowed as a temporary measure.
- The project maintains `types.d.ts` for public class declarations of the codebase.
- Whenever a new class is added, the matching class declaration and source-file reference **must** be added to `types.d.ts`.
- Absence of a new class declaration in `types.d.ts` is an engineering violation of the code layer.

## Browser Web Component Form

`Mindstream_Web_Component_*` modules are DI-created definitions. Their constructors receive declared dependencies and return one native class extending the injected `HTMLElement` base. The returned class may use lifecycle callbacks and prototype methods because the Custom Elements platform invokes it without DI arguments. `Mindstream_Web_Component_Registry$` is the sole registration authority; module-scope `customElements.define(...)` is prohibited.

## Testing

- **Unit tests** are sufficient for the MVP.
- Integration tests are not used in the MVP.
- Absence of tests is allowed only for application entry points and stable interfaces unlikely to change.

## Prohibited

- **TypeScript** is prohibited.
- `eval` is prohibited.
- Dynamic imports are allowed only through the DI container.
- Reflection-like techniques are prohibited.

## Role Of Conventions

- Conventions define the minimal engineering frame.
- Deviations from conventions are allowed.
- Violations of conventions are treated as **technical debt**.
- Technical debt must be recorded in the agent iteration report.
