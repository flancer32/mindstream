#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import Container from '@teqfw/di';
import NamespaceRegistry from '@teqfw/di/src/Config/NamespaceRegistry.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const container = new Container();
const namespaceRegistry = new NamespaceRegistry({ fs, path, appRoot: projectRoot });
for (const entry of await namespaceRegistry.build()) {
  container.addNamespaceRoot(entry.prefix, entry.dirAbs, entry.ext);
}

/** @type {Mindstream_Back_App} */
const app = await container.get('Mindstream_Back_App$');
const cliArgs = process.argv.slice(2);
let stopping = false;

const loadConfiguration = async function () {
  const loader = await container.get('TeqFw_Cfg_Loader$');
  const dotenvSource = await container.get('TeqFw_Cfg_Source_DotenvFile$');
  const processEnvSource = await container.get('TeqFw_Cfg_Source_ProcessEnv$');
  const dotenvPath = path.join(projectRoot, '.env');
  let dotenv;
  try {
    await fs.access(dotenvPath);
    dotenv = dotenvSource.create({ path: dotenvPath, id: 'project-dotenv' });
  } catch (error) {
    if (!error || error.code !== 'ENOENT') throw error;
  }
  await loader.load([
    ...(dotenv ? [dotenv] : []),
    processEnvSource.create(process.env),
  ]);
};

const stopApp = async function () {
  if (stopping) return;
  stopping = true;
  if (typeof app.stop === 'function') await app.stop();
};

const shutdown = async function (code = 0) {
  await stopApp();
  process.exitCode = typeof code === 'number' ? code : 1;
};

process.once('SIGINT', () => { void shutdown(0); });
process.once('SIGTERM', () => { void shutdown(0); });

try {
  await loadConfiguration();
  process.exitCode = await app.run({ projectRoot, cliArgs });
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await stopApp();
}
