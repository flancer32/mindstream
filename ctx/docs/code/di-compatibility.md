# DI Compatibility — `@teqfw/di`

- Path: `ctx/docs/code/di-compatibility.md`
- Template Version: `20260619`
 - Changed: `20260727`

## Purpose

This document defines the **rigid engineering invariants of code organization** required for the codebase to be considered **compatible with the `@teqfw/di` DI model** within the Mindstream project.

This document is normative. Any deviation is an architectural defect.

It is not a usage guide for `@teqfw/di` and does not duplicate the library README.

## Role Of DI In The Project

In Mindstream:

- `@teqfw/di` is the **only allowed mechanism for binding project code**;
- DI is the **primary form of composition**, not a helper tool;
- all dependencies between modules are expressed **only declaratively** through Dependency IDs.

Code that bypasses the DI model is not part of the correct project codebase.

## Namespaces And Code Zones

The project fixes a **strictly limited set of root namespaces**:

- `Mindstream_Back_`
- `Mindstream_Web_`
- `Mindstream_Shared_`

Use of any other root namespace in the MVP is prohibited.

The package declares the active roots in `package.json#teqfw.namespaces`: `Mindstream_Back_` maps to `src/`, `Mindstream_Web_` maps to `web/app/Web/`, and `Mindstream_Shared_` maps to `web/app/Shared/`. The composition root builds these rules, together with dependency namespaces, through `TeqFw_Di_Config_NamespaceRegistry` before its first `container.get()` call.

### Zone Semantics

- `Back` means server logic and backend services.
- `Web` means browser-resident client logic and frontend execution.
- `Shared` means platform-agnostic code.

`Mindstream_Shared_`:

- has no access to platform APIs;
- does not use `node:*`, DOM, `fetch`, `process`, or similar dependencies;
- contains DTOs, utilities, and pure business logic.

`Mindstream_Web_`:

- is resolved only by the browser composition root;
- owns browser-local services, platform adapters, and Web Component definitions;
- accesses browser APIs only in explicitly injected platform adapter modules or in Custom Element classes created by an injected component definition.

## Code Import And Binding

### Prohibited

In any business module, the following are prohibited:

- static import of project code;
- relative imports such as `../X.mjs`;
- direct import of platform APIs;
- direct import of dependencies from `node_modules`.

### Allowed

- All dependencies are declared **only through DI**.
- Access to platform APIs and `node_modules` is allowed **only through Dependency IDs**.

Violation of any of these rules is an architectural defect.

## Dependencies From `node_modules`

All dependencies supplied through `node_modules` in Mindstream:

- are **used as ES6 modules**;
- are **registered in the DI container with the `node:` prefix**;
- are **injected into constructors or factories as ready-made modules**, without wrappers or proxying.

Normative Dependency ID form:

- `"node:<package-name>"`

Normative injection form:

- the dependency is passed into a constructor or factory as an ES6 module, for example `"node:knex" -> knex`.

The following uses of `node_modules` dependencies are prohibited and are architectural defects:

- without the `node:` prefix;
- through static `import` in business code;
- through dynamic `require`;
- through the container as a service locator.

## Composition Root

### Count And Role

The project fixes the following production composition roots:

- one for `Back`;
- one for `Web`;
- one for Service Worker.

Tests use a **separate composition root**, created either per test suite or per unit test.

### Composition-Root Authority

Only the composition root may:

- use static imports of project code;
- use static imports of dependencies from `node_modules`;
- register dependencies with the `node:` prefix;
- configure the namespace resolver;
- define namespace-to-filesystem correspondence;
- resolve Dependency IDs into real objects.

Any DI configuration outside a composition root is prohibited.

## Service Locator Prohibition

The DI container `Container` is an **infrastructure object** and is **not part of the application domain model**.

The following are prohibited in Mindstream:

- passing the DI container through function, constructor, or method parameters;
- storing the container or its wrappers in object properties;
- using the container for dynamic dependency retrieval through `container.get(...)` outside composition root and test mode;
- building business logic that depends on the container as a service.

Any signature that accepts `Container` or a compatible object is an architectural defect without exception.

## Normative Dependency Model

In a correct Mindstream DI model:

- an object **does not know** where its dependencies come from;
- an object **does not manage** their creation or lifecycle;
- all dependencies of an object are:
- expressed **explicitly**;
- declared **declaratively** through Dependency IDs;
- resolved **before business logic begins**.

If an object needs direct access to the DI container, that is an architectural defect.

## Factory Objects

Factory objects are allowed as composition elements, but they:

- accept **only concrete dependencies**, not the container;
- do not resolve dependencies dynamically;
- do not act as proxy access to the container.

A factory object creates objects, but does **not participate in dependency-graph resolution**.

Violation of any of these points is an architectural defect.

## Dependency ID Model

### Suffixes

Use of suffixes `$` and `$$` is mandatory:

- `$` means singleton from default export;
- `$$` means new instance from default export;
- absence of suffix means raw module or export without instantiation.

### Exports

- The normative form is `default export`.
- `.export` is allowed but is not the base path.
- `(factory)` and `(proxy)` are not part of the base MVP set.

## Platform Dependencies

- Dependency IDs with the `node:` prefix are allowed **only in `Mindstream_Back_`**.
- `Web` and `Shared` do not use `node:` or `npm:` Dependency IDs.
- Any access to the platform happens only through DI.

## Test Mode

`enableTestMode()` defines whether intervention in the DI graph is allowed.

In test mode, the following are allowed:

- registration and override of any dependencies;
- mocking of `node:*` dependencies.

Outside test mode, such actions are prohibited.

## Compatibility Criterion

Code is considered **compatible with `@teqfw/di` in the Mindstream project** only when **all provisions of this document are satisfied simultaneously**.

Any violation is recorded as an **architectural defect** and is not open to reinterpretation.
