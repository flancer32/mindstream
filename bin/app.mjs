#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Container from '@teqfw/di';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/** @type {TeqFw_Di_Container} */
const container = new Container();
/** @type {TeqFw_Di_Api_Container_Resolver} */
const resolver = container.getResolver();

resolver.addNamespaceRoot('Mindstream_Back_', path.join(projectRoot, 'src'), 'mjs');
resolver.addNamespaceRoot('Mindstream_Shared_', path.join(projectRoot, 'web', 'app', 'Shared'), 'mjs');
resolver.addNamespaceRoot('Teqfw_Di_', path.join(projectRoot, 'node_modules', '@teqfw', 'di', 'src'));

/** @type {Mindstream_Back_App} */
const app = await container.get('Mindstream_Back_App$');
const exitCode = await app.run({ projectRoot, cliArgs: process.argv.slice(2) });
if (typeof exitCode === 'number') {
  process.exitCode = exitCode;
}
