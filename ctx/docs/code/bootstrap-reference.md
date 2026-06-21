# Bootstrap Reference (Node.js)

- Path: `ctx/docs/code/bootstrap-reference.md`
- Template Version: `20260619`
- Changed: `20260619`

## Purpose

This document defines the reference bootstrap form for starting the Mindstream backend application on Node.js (ESM) and serves as an illustration of the normative architecture and runtime-start model defined in `ctx/docs/architecture/` and `ctx/docs/environment/`.

## Reference Implementation

```js
#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import Container from "@teqfw/di";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const container = new Container();
const resolver = container.getResolver();

resolver.addNamespaceRoot("Mindstream_Back_", path.join(projectRoot, "src"), "mjs");
resolver.addNamespaceRoot("Mindstream_Shared_", path.join(projectRoot, "web", "app", "Shared"), "mjs");
resolver.addNamespaceRoot("Teqfw_Di_", path.join(projectRoot, "node_modules", "@teqfw", "di", "src"));

const app = await container.get("Mindstream_Back_App$");
await app.run({ projectRoot });
```

## Status

This document is a code reference and does not define architectural startup invariants. The authoritative invariants are defined in the `architecture/` and `environment/` documents.
