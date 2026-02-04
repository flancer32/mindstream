/**
 * @module test.unit.di-back
 * @description Helper to create a clean @teqfw/di container for backend unit tests.
 */

import Container from '@teqfw/di';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Create and configure a clean DI container for backend unit tests.
 * @returns {Promise<TeqFw_Di_Container>}
 */
export async function createTestContainer() {
  /** @type {TeqFw_Di_Container} */
  const container = new Container();
  container.enableTestMode();

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(__dirname, '../..');

  /** @type {TeqFw_Di_Container_Resolver} */
  const resolver = container.getResolver();
  resolver.addNamespaceRoot('Mindstream_Back_', path.join(projectRoot, 'src'), 'mjs');
  resolver.addNamespaceRoot('Mindstream_Shared_', path.join(projectRoot, 'web', 'app', 'Shared'), 'mjs');
  resolver.addNamespaceRoot('Teqfw_Di_', path.join(projectRoot, 'node_modules', '@teqfw', 'di', 'src'));

  return container;
}
