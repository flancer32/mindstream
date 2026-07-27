# ES6 Module Form — `@teqfw/di`

- Path: `ctx/docs/code/es6-modules.md`
- Template Version: `20260619`
 - Changed: `20260727`

## Purpose

This document defines the **normative ES6 module form** for the Mindstream project when used with the `@teqfw/di` container.

It specifies the mandatory module form, constructor structure, encapsulation model, and rules for building the public API of an instance.

This document belongs to the `code/` layer and describes engineering implementation form. It does not describe architecture, product meaning, dependency-binding rules, or DI-graph configuration.

## Scope Boundary

This normative form applies to server modules under `src/` and to other modules explicitly assembled through `@teqfw/di`, currently including `web/app/`.

Browser modules under `web/app/Web/` are DI-managed. Web Component definition modules may return a native `HTMLElement` subclass from their DI-created default-export class; the returned subclass may use platform lifecycle methods, while its dependencies are captured from the definition's constructor closure.

## Normative Module Form

The only allowed ES6 module form in Mindstream is:

- ES6 module;
- `default export`;
- exported object is a **`class`**.

Using factory functions as the default export is prohibited, even if functionally equivalent to a class.

Absence of a `class` in the default export is a violation of the normative code-layer form.

## Standard Module Template

The following example is normative in form:

```js
/**
 * @module Namespace_Area_Module
 * @description Standard ES6 module for the DI container.
 */
export default class Namespace_Area_Module {
  constructor({ "node:http": http, Namespace_Area_Defaults$: DEF }) {
    const server = http.createServer();

    this.start = async function (cfg) {
      server.listen(cfg?.port ?? DEF.PORT);
    };

    this.stop = async function () {
      if (server) server.close();
    };
  }
}
```

The example is normative in form, not a recommendation for implementation logic.

## Constructor And Dependencies

- The constructor accepts **exactly one argument**, the dependency object `deps`.
- Dependencies are declared **only** through constructor parameters.
- Dependencies are accessed by destructuring the `deps` object.
- The constructor **must not validate** dependency presence. Checks such as `if (!deps)` are prohibited.

`@teqfw/di` guarantees correctness of the `deps` composition. Any defensive or validation logic in the constructor is a defect.

The `deps` object is treated as logically immutable and must not be modified inside the constructor.

## Encapsulation And State

The primary mechanism of data and function encapsulation is **constructor closure**.

The following is allowed and encouraged:

- storing internal state in constructor-local variables;
- binding functions to that state through closure.

The following mechanisms are not required and are not normative project practice:

- `#private` fields;
- `private` modifiers;
- protected fields or methods;
- complex OO hierarchies.

This position follows from the DI model and widespread use of singleton components.

## Public API Of The Instance

- All public instance methods are declared **only through `this.` inside the constructor**.
- Class methods declared outside the constructor are prohibited.
- A module instance is treated as an **assembled object with an explicit API**, not as a classical object hierarchy.

Any behavior not added through `this.` in the constructor is considered unavailable and must not be used as part of the module contract.

## Classes And Object Model

Use of `class` is mandatory and formal.

The class is used only as:

- the module-form container;
- the carrier of the constructor invoked by the DI container.

The class is **not used** for:

- inheritance;
- polymorphism;
- extensible hierarchies;
- behavior reuse through `extends`.

Use of `extends`, `super`, and inheritance chains is a violation of the server and DI-managed normative form, except for the native `HTMLElement` subclasses returned by documented browser component definitions.

## Top-Level Module Logic

Top-level code in an ES6 module is allowed only if all of the following are true:

- it creates no side effects;
- it does not access platform APIs;
- it does not initiate application logic before instance creation through DI.

Any initialization that affects module behavior must occur inside the constructor.

Browser component registration is performed by `Mindstream_Web_Component_Registry$` after definitions have been linked. It is not a module-scope side effect.

## Constraints And Prohibitions

The following are prohibited for ES6 modules in Mindstream:

- using factory functions instead of `class`;
- declaring public methods outside the constructor;
- modifying the `deps` object;
- statically importing project code outside a DI composition root;
- using private modifiers as the primary encapsulation mechanism;
- building OO hierarchies and inheritance.

## Requirement Status

The rules in this document are **rigid engineering invariants** of the Mindstream code layer.

DI-managed code that violates the fixed ES6 module form:

- is treated as incompatible with the project code layer;
- is a codebase defect;
- is not a permissible style deviation or technical debt.

Native Web Components are valid only as classes returned by documented DI component definitions and remain defects if their DOM-owning responsibility or custom-element contract is undocumented.
