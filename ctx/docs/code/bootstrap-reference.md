# Bootstrap Reference (Node.js)

- Path: `ctx/docs/code/bootstrap-reference.md`
- Template Version: `20260619`
- Changed: `20260725`

## Purpose

This document defines the reference bootstrap form for starting the Mindstream backend application on Node.js (ESM) and serves as an illustration of the normative architecture and runtime-start model defined in `ctx/docs/architecture/` and `ctx/docs/environment/`.

## Reference Implementation

```js
#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import Container from "@teqfw/di";
import NamespaceRegistry from "@teqfw/di/src/Config/NamespaceRegistry.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const container = new Container();
const registry = new NamespaceRegistry({fs, path, appRoot: projectRoot});
for (const entry of await registry.build()) {
  container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
}

const loader = await container.get("TeqFw_Cfg_Loader$");
const dotenv = await container.get("TeqFw_Cfg_Source_DotenvFile$");
const processEnv = await container.get("TeqFw_Cfg_Source_ProcessEnv$");
const dotenvPath = path.join(projectRoot, ".env");
let dotenvFile;
try {
  await fs.access(dotenvPath);
  dotenvFile = dotenv.create({path: dotenvPath, id: "project-dotenv"});
} catch (error) {
  if (!error || error.code !== "ENOENT") throw error;
}
await loader.load([...(dotenvFile ? [dotenvFile] : []), processEnv.create(process.env)]);

const app = await container.get("Mindstream_Back_App$");
await app.run({projectRoot, cliArgs: process.argv.slice(2)});
```

## Status

This document is a code reference and does not define architectural startup invariants. The authoritative invariants are defined in the `architecture/` and `environment/` documents.
