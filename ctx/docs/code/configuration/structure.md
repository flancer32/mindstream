# Code Configuration — Structure

- Path: `ctx/docs/code/configuration/structure.md`
- Template Version: `20260619`
- Changed: `20260810`

## Purpose

This document defines the **normative parameter-level structure of the Mindstream backend configuration object**.

It specifies:

- which parameters belong to the configuration;
- how they are grouped;
- which names are valid.

It **does not describe values**, loading sources, parameter semantics, or the logic of their use.

---

## General Configuration Form

`@teqfw/cfg` addresses values as `NAMESPACE__PARAMETER`. The application uses `TEQFW_WEB` for web transport, `TEQFW_DB` for package-owned database settings, and `MINDSTREAM` for product-owned LLM settings. `Mindstream_Back_App_Configuration` maps only the application-owned settings below; `@teqfw/db` owns its immutable typed database projection.

The backend configuration is represented as a single object with these top-level sections:

```
configuration:
    server
    llm
```

Every configuration parameter **must belong to one of these sections**.

---

## `server` Section

The `server` section contains parameters of the backend runtime web server.

The normative MVP parameter set is:

```
server:
    port
    type
```

---

---

## `llm` Section

The `llm` section contains connection parameters for the external LLM API.

The normative MVP parameter set is:

```
llm:
    apiKey
    baseUrl
    generationModel
    embeddingModel
```

---

## Structure Invariants

Within the MVP, the following are true:

- the configuration contains **only** the parameters listed in this document;
- adding a new parameter requires updating this document;
- parameter names are part of the contract;
- application code does not read `process.env` directly;
- all parameters are available through `Mindstream_Back_App_Configuration`.

---

## Structure Evolution

Changing the configuration structure is allowed only through:

- adding a parameter to an existing section;
- adding a new section.

Any such change must be recorded by **changing this document** together with a synchronized code change.

---

## Document Boundary

This document does not define:

- environment-variable names;
- parameter values;
- default values;
- whether a parameter is required;
- secret formats;
- validation rules.

---

## Summary

This document defines the **rigid parameter skeleton of the Mindstream backend configuration**, sufficient for agents to generate, verify, and modify code without guesswork or interpretation.
