# Bootstrap Reference (Node.js)

Path: `./ctx/docs/code/bootstrap-reference.md`

## Назначение

Документ фиксирует референсную кодовую форму bootstrap-запуска backend-приложения Mindstream для Node.js (ESM) и служит иллюстрацией нормативной архитектурной модели, зафиксированной в `ctx/docs/architecture/runtime/bootstrap.md`.

## Референсная реализация

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

## Статус

Документ является кодовой справкой и не определяет архитектурных инвариантов запуска. Источник инвариантов: `ctx/docs/architecture/runtime/bootstrap.md`.
