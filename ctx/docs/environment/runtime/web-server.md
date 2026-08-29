# Web Server Runtime

- Path: `ctx/docs/environment/runtime/web-server.md`
- Template Version: `20260619`
- Changed: `20260829`

## Purpose

This document defines the contract and responsibility boundaries of the HTTP server in **Mindstream** at the runtime level. It is a normative context document used during development and integration of infrastructure components.

This document does not describe the domain or application logic of Mindstream.

---

## HTTP Server Status

The HTTP server in Mindstream is an **infrastructure transport layer**.

The server is implemented using `@teqfw/web`, which:

- is not part of the domain model;
- does not participate in composition of application subsystems;
- provides only a mechanism for receiving HTTP requests and dispatching handlers.

The server is treated as a permanent infrastructure dependency of the project, while remaining architecturally replaceable.

---

## Application Startup Model

Mindstream is a CLI-started backend application.

The application enters web-server mode through the explicit CLI command:

```
web:start
```

`Mindstream_Back_App_Plugin` prepares configuration and registers handlers before command selection. Only when `web:start` is executed:

- the HTTP server is initialized;
- application HTTP handlers are registered;
- the process enters long-running mode.

In all other startup modes, the HTTP server is absent.

---

## Instance Model And Scaling

Within one application process:

- there is **exactly one HTTP server**;
- repeated server initialization is not allowed.

Horizontal scaling is done **externally** through PM2 by running multiple processes. Each process contains its own HTTP-server instance.

---

## Server Lifecycle

The HTTP server:

- starts when `web:start` is executed;
- lives for the lifetime of the process;
- does not terminate the process on its own.

The application may:

- subscribe to process termination signals;
- call methods on the server or HTTP handlers to release resources cleanly.

Graceful-shutdown requirements are defined at the application and handler level, not at the server layer as an infrastructure component.

---

## Configuration

HTTP-server configuration is part of the **shared application configuration object**.

The server receives parameters such as port, mode, and other runtime settings only through this object. There is no separate server configuration.

---

## TLS And Network Environment

TLS termination is handled by an **external reverse proxy (Apache)**.

The Mindstream HTTP server:

- runs behind a reverse proxy;
- does not serve TLS directly;
- assumes TLS exists in all environments, including `dev`.

---

## Type Of Content Served

The HTTP server serves the browser entry assets together with the backend JSON API.

- Interaction model: REST-like HTTP requests (`GET` / `POST`).
- API response format: JSON.
- The static browser entry must remain available at `/`, including query-string URLs used to address a publication permalink.

---

## Status Of HTTP Handlers

HTTP handlers:

- belong to the Mindstream application;
- are registered in the server through the `@teqfw/web` infrastructure mechanism;
- act as adapters between HTTP requests and internal application operations.

HTTP handlers may:

- call application and domain operations;
- serialize execution results;
- participate in shutdown handling for the application.

The contract and implementation rules for HTTP handlers are defined in composition-level documents.

---

## Document Boundary

This document **does not describe**:

- domain operations;
- API endpoint structure;
- business logic;
- DTO formats;
- behavior of specific HTTP handlers.

All of these aspects are defined in documents at higher abstraction levels.
