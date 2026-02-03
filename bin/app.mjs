#!/usr/bin/env node
import Container from '@teqfw/di';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

await loadDotEnv(path.join(projectRoot, '.env'));

const runMode = process.env.MINDSTREAM_MODE ?? process.env.NODE_ENV ?? 'dev';

/** @type {TeqFw_Di_Container} */
const container = new Container();
/** @type {TeqFw_Di_Container_Resolver} */
const resolver = container.getResolver();
resolver.addNamespaceRoot('Mindstream_Back_', path.join(projectRoot, 'src'), 'mjs');
resolver.addNamespaceRoot('Mindstream_Shared_', path.join(projectRoot, 'web', 'app', 'Shared'), 'mjs');
resolver.addNamespaceRoot('Teqfw_Di_', path.join(projectRoot, 'node_modules', '@teqfw', 'di', 'src'));

/** @type {Mindstream_Back_App} */
const app = await container.get('Mindstream_Back_App$');
if (typeof app.run === 'function') {
  await app.run({ mode: runMode });
}

let shuttingDown = false;
const shutdown = async () => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  if (typeof app.stop === 'function') {
    await app.stop();
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function loadDotEnv(filePath) {
  const content = await fs.readFile(filePath, 'utf8').catch((error) => {
    if (error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  });
  if (!content) {
    return;
  }

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (!key) {
      continue;
    }
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
