# Code Configuration — MVP

- Path: `ctx/docs/code/configuration.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines the **normative configuration model of the Mindstream backend application** at the code layer.

It specifies:

- how configuration is handled in the project;
- which invariants are mandatory;
- which value sources are allowed.

This document belongs only to the `code/` layer and does not introduce architectural, product, or operational decisions.

---

## Status Of Configuration

The Mindstream backend configuration is represented as an **internal application object**.

The configuration object:

- is not part of the runtime contract;
- does not participate in the architectural startup model;
- is not passed from bootstrap code as a ready-made structure;
- is created and used only inside the application.

The architecture and environment layers **do not operate** on configuration as an object.

---

## Single Configuration Object

There is **exactly one** configuration object in the backend application: `Mindstream_Back_App_Configuration`.

- the object is created by a single assembly point in application code;
- it remains in process memory for the lifetime of the application;
- it is used as a **read-only** structure and is not changed after initialization;
- it is accessed through standard code-binding mechanisms such as import or DI, without global state.

Creating additional configuration objects, configuration duplicates, or alternative configuration services is a violation.

---

## Value Sources

**The canonical source of configuration values is `process.env`.**

There are no other value sources in the configuration model.

Use of a `.env` file is allowed **only as a mechanism for preparing `process.env`** and is not treated as an alternative configuration source.

---

## Loading The `.env` File

Loading a `.env` file located at the project root is allowed.

`.env` loading invariants:

- loading is initiated by application code during configuration initialization;
- the project root path is passed into the application from outside, through bootstrap;
- if the `.env` file exists, it is parsed and its values are written into `process.env`;
- absence of the `.env` file is not an error;
- values already present in `process.env` are not overwritten.

Loading `.env` is treated as **runtime-environment preparation**, not as part of the configuration model.

---

## Access To Environment Parameters

Reading `process.env` is allowed **only** at the initialization point of `Mindstream_Back_App_Configuration`.

Direct access to `process.env` from application modules, services, adapters, or infrastructure components is prohibited and treated as an engineering violation.

---

## Normalization

All values from `process.env` are converted to the required types and shape **at the moment the configuration object is initialized**.

The configuration object contains **only normalized values** ready for direct use. Passing raw environment strings into application code is prohibited.

---

## Relation To Configuration Structure

The structure of the configuration object is normatively fixed in:

```
ctx/docs/code/configuration/structure.md
```

Using parameters absent from the normative structure is treated as a codebase defect.

---

## Document Boundary

This document does not describe:

- concrete environment-variable names;
- parameter values and defaults;
- secret-storage format;
- deployment and environment-setup procedures;
- the architectural application-startup model.

These aspects belong to other context levels and are not fixed at the `code/` level.
