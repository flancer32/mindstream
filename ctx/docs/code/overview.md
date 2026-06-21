# Code Layer — Overview

- Path: `ctx/docs/code/overview.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document describes the **meaning, role, and stable form of the code layer** within the Mindstream documentation corpus.

Its purpose is to define **what counts as the code layer as a system object**, regardless of the current development iteration, task set, or agent composition.

The document does not define procedures or agent behavior. It defines **code-form invariants** within which iterative implementation may happen.

---

## Role Of The Code Layer In The Corpus

The code layer is **derivative** relative to the other corpus levels:

- the product and its target shape;
- MVP constraints;
- architectural form;
- user-experience composition;
- runtime environment.

Code **does not define system meaning** and does not expand system boundaries. It serves as the executable expression of decisions already fixed elsewhere.

---

## Code As Form, Not Source Of Truth

In Mindstream, code:

- is not a source of requirements;
- is not used to fix architectural or product decisions;
- does not replace context documentation.

Any meaning-bearing assumptions embedded in code are treated as a design error if they are not reflected at the proper corpus level.

---

## Code As An Executable Application

In the Mindstream MVP, the codebase is treated as an **executable Node.js application**, not as a library.

This means that:

- the code has its own execution lifecycle;
- there is an explicit execution entry point;
- the server and maintenance tasks run as an application;
- the code is not intended for embedding into third-party projects.

This position is a **stable property of the code layer** and does not depend on a specific iteration.

---

## Structural Form Of The Codebase

The code layer has a **normative structural form** that reflects role separation rather than the current implementation.

The structure is treated as a **form invariant** required for stable agent work.

### Role Zones Of The Code

The following stable zones exist in the codebase:

- **execution entry zone** — code that initiates application and task startup;
- **server application zone** — implementation of API and server logic;
- **client zone** — static frontend artifacts delivered as a PWA;
- **testing zone** — code that verifies correctness of the server and client parts.

These zones reflect **different code roles** and must not be mixed.

---

## Principle Of Role Separation

Within the code layer, the following are considered invalid:

- mixing startup logic with application logic;
- placing client static assets inside server modules;
- using server code to serve static assets;
- introducing alternative entry points that are inconsistent with the project form.

Structural form supports iterative evolution and is not a temporary per-task convention.

---

## External Computational Services

The code layer may use external computational services as **infrastructure dependencies** under the following invariants:

- the external service does not define product or architectural meaning;
- interaction with the service does not change architectural contours or data flows;
- the service is used as a technical resource, not as a domain subsystem.

### LLM API

Within the Mindstream MVP, interaction with external LLM APIs, including the OpenAI API, follows these rules:

- LLM API usage is treated as an **infrastructure integration**;
- the codebase contains **exactly one dedicated entity** that encapsulates access to the LLM API;
- this entity is a **thin client** that performs API calls without domain interpretation;
- direct use of SDKs, HTTP clients, or other access mechanisms to the LLM API outside this entity is **prohibited**.

These rules apply only to code-layer form and do not introduce architectural or product obligations.

---

## Relation To Architecture

Architecture defines the **form of the system**, but not the detailed organization of code.

The code layer implements architectural decisions, does not extend them independently, and does not introduce hidden architectural assumptions.

Architectural decisions must be visible **in documentation**, not reconstructed from code.

---

## MVP Constraints At The Code Level

MVP constraints are rigid and mandatory for the code layer.

Code must not be used to expand scope implicitly, include preparatory structures that alter product form, or introduce “future” functionality outside the MVP.

Any deviation from these constraints must be fixed outside the code.

---

## Runtime As A Boundary

The runtime environment defines the **boundary of what is allowed**, not the optimal solution.

The code layer targets the fixed runtime, does not default to alternative technologies, and does not substitute the runtime with code-level logic.

---

## Uncertainties

When the document corpus gives no explicit guidance, code must not make default decisions, rely on undocumented practices, or introduce implicit conventions.

Gaps are a reason for clarification, not improvisation.

---

## Summary Position

The Mindstream code layer is secondary to the context, executable rather than conceptual, structurally defined, and subordinate to architecture, constraints, and runtime.

This document defines **code as a system layer**, not the procedures for working with it.
