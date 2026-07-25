# Code Configuration — MVP

- Path: `ctx/docs/code/configuration.md`
- Template Version: `20260619`
- Changed: `20260725`

## Purpose

This document defines the **normative configuration model of the Mindstream backend application** at the code layer.

It specifies:

- how `@teqfw/cfg` is composed and consumed in the project;
- which invariants are mandatory;
- which value sources are allowed.

This document belongs only to the `code/` layer and does not introduce architectural, product, or operational decisions.

---

## Status Of Configuration

The Mindstream backend uses `@teqfw/cfg` as the sole raw-configuration loader and snapshot owner. `Mindstream_Back_App_Configuration` is an internal typed projection over its namespace readers.

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

The bootstrap explicitly loads the optional project-root `.env` Source followed by the explicit `process.env` Source. `@teqfw/cfg` therefore gives `process.env` higher precedence for each complete key. No module reads `process.env` directly. `MINDSTREAM` is the product configuration namespace; `TEQFW_WEB` is reserved for the `@flancer32/teq-web` runtime configuration.

---

## Loading The `.env` File

The bootstrap creates a dotenv Source only when `.env` exists; absence is not an error. Loading is one-shot and completes before `Mindstream_Back_App_Configuration.init()` reads the snapshot.

---

## Access To Environment Parameters

Reading `process.env` is allowed only in the bootstrap when it creates `TeqFw_Cfg_Source_ProcessEnv`. Application code reads detached namespace projections through `TeqFw_Cfg_Reader`.

---

## Normalization

Raw values from `@teqfw/cfg` are converted to the required types and shape **at the moment the configuration object is initialized**.

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
