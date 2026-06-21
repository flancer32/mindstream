# Runtime Environment — MVP

- Path: `ctx/docs/environment/runtime.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines the **runtime environment of the Mindstream MVP**.

It specifies the permitted platforms, runtimes, and external dependencies within which the system may be implemented and run.

This document is an **overview runtime context** and does not describe:

- application architecture;
- subsystem composition;
- application or domain logic;
- concrete infrastructure contracts.

Specialized runtime aspects are moved into subordinate documents.

---

## Scope

The runtime context describes:

- where and in what environment the application runs;
- the minimum environment requirements;
- which infrastructure assumptions are considered true for the MVP.

---

## Execution Environment

- The server side runs on a **VPS**.
- The client side runs in the **user's browser**.
- Multiple execution environments are allowed, for example `dev` and `prod`, with different access parameters and environment settings.
- There are no constraints by region, provider, or operating system.

---

## Execution Platform

- Server platform: **Node.js**.
- Client platform: **browser runtime**.
- Serverless approaches are not used.
- The minimum runtime is fixed as:
- **Node.js LTS** with target version `20.x`;
- **modern evergreen browsers**;
- **PostgreSQL 16+**.

---

## Client Environment

- The client is designed as a **PWA** with a **mobile-first** approach.
- Only **modern evergreen browsers** are supported.
- Legacy browsers are excluded.
- Offline mode is **out of scope** for the MVP.

---

## Data Storage

- Server storage: **PostgreSQL**.
- Client local storage: **IndexedDB**.
- The system uses one shared server-side store for all users and one local store per user.
- Data is separated by physical location:
- local data in IndexedDB;
- remote data in PostgreSQL.

### PostgreSQL And Extensions

Within the MVP it is assumed that the server-side data store, PostgreSQL, supports the **pgvector** extension.

Using pgvector is a **mandatory runtime requirement**, because publication embeddings are stored as vector data and used for semantic similarity operations.

PostgreSQL environments without pgvector support are considered invalid for running the Mindstream MVP.

---

## Integrations And External Dependencies

- External APIs are allowed **only for LLM usage**.
- SaaS infrastructure such as auth, analytics, and queues is not used.
- The number of dependencies is minimized.
- All direct dependencies must be approved by a human.

---

## LLM And Embeddings

- LLMs are used **through an API**.
- The **openai** library is used.
- The LLM provider may be any provider compatible with the API.
- Embeddings are stored:
- on the server in PostgreSQL;
- on the client in IndexedDB.

---

## Scale And Usage Model

- The MVP is intended for **tens to hundreds of users**.
- One browser corresponds to one user.
- Multiple users inside the same browser are not assumed.
- No hard limits are set for memory, CPU, or latency.

---

## Security And Isolation

- User data is isolated through isolation of client execution environments.
- Storage of sensitive personal data is not allowed.
- There are no compliance-driven constraints.
- Only anonymous statistics are collected.

---

## Specialized Runtime Contexts

The following runtime aspects are defined in separate normative documents:

- **HTTP server and web runtime mode**  
  See `ctx/docs/environment/runtime/web-server.md`.

These documents extend the runtime context and are meant to be used together with this overview.

---

## Prohibited

- **TypeScript** is prohibited.
- Any **reactive frameworks** are prohibited, including temporary use.
