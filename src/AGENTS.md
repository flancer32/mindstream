# Source Code — AGENTS

Path: `./src/AGENTS.md`

## Purpose

This document defines the **procedural requirements for an agent working with the production backend code of the Mindstream project** located in the `src/` directory.

This document applies to all subdirectories under `src/` and complements the rules defined in the root `AGENTS.md` and in the project's cognitive context documentation (`ctx/`).

This document **does not define engineering code invariants** and **does not duplicate the normative requirements** described in `ctx/docs/code/`.
Its role is to define **which actions the agent must perform and which normative context the agent must load** before working with backend code.

---

## Level Map

- `src/` — the production source code of the **backend part** of the Mindstream project.
- `AGENTS.md` — this document; procedural requirements for agent actions when changing backend code at this level.

The shared-layer code **does not belong** to this level and is located in `web/app/Shared`.

---

## Agent Responsibility Boundaries

Within the `src/` directory, the agent:

- modifies **backend code only** for the Mindstream project;
- operates strictly within the project's established DI model;
- does not expand product scope without explicit human direction;
- does not introduce engineering assumptions that are absent from the context documentation.

Before making any changes, the agent **must load into the working context the normative documents of the code layer** that apply to backend code, including at minimum:

- `ctx/docs/code/conventions.md` — baseline engineering code conventions;
- `ctx/docs/code/di-compatibility.md` — hard invariants of the `@teqfw/di` DI model;
- `ctx/docs/code/es6-modules.md` — the normative ES6 module shape used in the project;
- `ctx/docs/code/logging.md` — normative principles of code-layer logging and observability requirements;
- `ctx/docs/code/testing.md` — testing invariants for the code layer.

Failure to comply with any of these norms must be treated as a codebase defect, not as a stylistic deviation.

---

## Type Declaration Requirement

When adding new classes to backend code under `src/`, the agent must:

- add a declaration for the corresponding class to `types.d.ts`;
- specify the correct source file for the class;
- ensure consistency of the class name and namespace with the project's DI model.

Code changes in which a new class is missing from `types.d.ts` are considered incomplete and invalid.

---

## Test Execution Requirement

Any change to production code in the `src/` directory requires mandatory verification with unit tests.

The agent must:

- create unit tests for each new module added under `src/`, unless the module is an entry point or an explicitly fixed stable interface;
- run `npm run test:unit` after making changes;
- verify that the tests complete without errors;
- record the fact that tests were executed and their result in the iteration report.

---

## Behavior When Tests Fail

If `npm run test:unit` finishes with errors, the agent must:

- not consider the task complete;
- either fix the code and rerun the tests;
- or explicitly record the reason for the failure in the iteration report and hand the decision over to the human.

Making backend code changes without successful test execution is considered invalid.

---

## Prohibited Actions

Within the `src/` directory, the agent must not:

- modify backend code without loading the normative context of the code layer;
- make changes without subsequently running unit tests;
- claim the task is complete while tests are failing;
- bypass or ignore the project's test infrastructure;
- substitute compliance with normative requirements by a subjective judgment of code correctness.

---

## Final Requirement

Backend code changes in `src/` **must not be considered valid** if:

- the agent did not load the required normative documents of the code layer;
- the changes do not comply with the established engineering invariants;
- the changes are not confirmed by successful execution of `npm run test:unit`;
- the test results are not recorded in the iteration report.
