#!/usr/bin/env node

import path from 'node:path';
import processModule from 'node:process';
import { fileURLToPath } from 'node:url';
import Container from '@teqfw/di';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/** @type {TeqFw_Di_Container} */
const container = new Container();
// @LLM-DOC: don't use `container.register` in this boostrap, it's for tests only

/** @type {TeqFw_Di_Api_Container_Resolver} */
const resolver = container.getResolver();
resolver.addNamespaceRoot('Mindstream_Back_', path.join(projectRoot, 'src'), 'mjs');
resolver.addNamespaceRoot('Mindstream_Shared_', path.join(projectRoot, 'web', 'app', 'Shared'), 'mjs');
resolver.addNamespaceRoot('Fl32_Web_', path.join(projectRoot, 'node_modules', '@flancer32', 'teq-web', 'src'), 'js');
resolver.addNamespaceRoot('Teqfw_Di_', path.join(projectRoot, 'node_modules', '@teqfw', 'di', 'src'));

const ensureError = function (err) {
  if (err instanceof Error) return err;
  return new Error(String(err));
};

const cliArgs = processModule.argv.slice(2);
const logger = await container.get('Mindstream_Shared_Logger$');

/** @type {Mindstream_Back_App} */
const app = await container.get('Mindstream_Back_App$');
let exitCode = 1;
let runError = null;

try {
  exitCode = await app.run({ projectRoot, cliArgs });
} catch (err) {
  runError = ensureError(err);
  if (logger?.exception) {
    logger.exception('Mindstream_Back_Bootstrap', runError);
  }
  exitCode = 1;
} finally {
  try {
    await app.stop();
  } catch (err) {
    const stopError = ensureError(err);
    if (logger?.exception) {
      logger.exception('Mindstream_Back_Bootstrap', stopError);
    }
    exitCode = 1;
  }
}

const normalizedExitCode = typeof exitCode === 'number' ? exitCode : 1;
processModule.exit(normalizedExitCode);
