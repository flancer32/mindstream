# Deployment Environment — MVP

- Path: `ctx/docs/environment/deployment.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines the **normative deployment form of the Mindstream MVP** as part of the product. It describes the invariant deployment model, component roles, and responsibility boundaries without moving into instructions, configurations, or operational procedures.

The deployment form is considered part of the MVP product and must be reproduced across all execution environments.

## Deployment Status In The MVP

Within the MVP, the following is true:

- the Mindstream deployment model is **rigidly fixed**;
- deployment is **part of the product**, not an operational choice;
- `dev` and `prod` differ by parameters and startup mode, but **not by deployment form**;
- the architectural form of the system does not depend on the execution environment.

## General Deployment Form

The Mindstream MVP is deployed in the form:

**Apache → Node.js application → PostgreSQL**

where Apache is the only external entry point and the Node.js application operates exclusively behind the proxy server.

## HTTPS And PWA Requirements

The Mindstream client is implemented as a **Progressive Web App (PWA)**.

Within the MVP, the following is true:

- HTTPS is a **mandatory condition** for product operation;
- access over plain HTTP without TLS is not allowed;
- TLS is the responsibility of the web server.

## Role Of Apache

Apache is a **mandatory MVP component** and the only external HTTPS entry point of the system.

In the MVP, Apache:

- serves client-side static assets directly;
- proxies API requests to the server application;
- enforces backend access policies, including filtering, limiting, and request modification;
- terminates TLS connections.

Apache is treated as a full reverse proxy with complete control over incoming HTTP request handling.

## Static Assets And Client Side

The Mindstream client side:

- is a **pure static PWA** using HTML, JavaScript, and CSS;
- does not use server-side rendering;
- does not use a build step;
- is served directly by Apache without Node.js involvement.

Static assets have a **version**, treated as part of the product and used in the PWA context.

Serving static assets through Node.js is not allowed in the MVP.

## API And Routing

There is **exactly one API namespace** in the MVP:

- `/api/*`

No other namespaces, API versions, service paths, or diagnostic paths exist.

Apache may arbitrarily modify API requests, including headers and routes, as long as the single public namespace `/api/*` is preserved.

## Node.js Application

The server side of Mindstream is implemented as a Node.js application.

Within the MVP, the following is true:

- the Node.js application serves **only the API contour**;
- the application does not serve static assets;
- the application is not directly reachable from the external network;
- the application listens only on an internal interface intended for Apache.

### Startup Modes

- In `prod`, the Node.js application runs in **cluster mode under PM2**.
- In `dev`, single-process execution without PM2 is allowed.

The choice of PM2 is fixed for the MVP as normative for production.

## Console Access And Tasks

The Mindstream codebase supports:

- starting the server application from the command line;
- running support and service tasks outside the HTTP context.

CLI access does not change the network or architectural deployment boundaries and does not imply external HTTP access to Node.js.

## Component Responsibility Boundaries

Within the MVP, the following is true:

- Apache is responsible for TLS, receiving external HTTP(S) requests, serving static assets, and proxying and controlling access to the API.
- The Node.js application is responsible for API handling, server logic, and access to server-side data storage.
- The roles of these components do not directly overlap.

## Document Boundary

This document:

- contains no setup instructions;
- contains no commands, config files, or paths;
- does not define operational procedures;
- does not describe alternative deployment models;
- does not introduce cloud or network infrastructure requirements.

It defines **form**, not the implementation process.

## Summary

`deployment.md` fixes the Mindstream MVP deployment model as a rigid part of the product, where Apache is the only external entry point and proxy layer, Node.js implements the API contour behind an internal interface, the client runs as an HTTPS PWA, and environment differences do not affect the architectural form of the system.
