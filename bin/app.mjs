#!/usr/bin/env node
import env from 'env';
import DiContainer from '@teqfw/di';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

await loadDotEnv(path.join(projectRoot, '.env'));

const runMode = env('MINDSTREAM_MODE', process.env.NODE_ENV ?? 'dev');

const di = new DiContainer();
const resolver = di.getResolver();
resolver.addNamespaceRoot('Mindstream_', new URL('../src/', import.meta.url).href);

const app = await di.get('Mindstream_App$');
if (typeof app.run === 'function') {
  await app.run({ mode: runMode });
}

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
