import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Mindstream_Back_App_Plugin initializes and releases the @teqfw/db connection', async () => {
  const container = await createTestContainer();
  const calls = [];
  container.register('TeqFw_Cli_Config$', { applicationRoot: '/application', cwd: '/other', argv: [], dotenvPath: undefined, dotenvExplicit: false });
  container.register('Mindstream_Back_App_Configuration$', {
    async init() { calls.push({ type: 'config-init' }); },
    get() { return { server: { port: 3001, type: 'http' } }; },
  });
  container.register('TeqFw_Web_Back_Config_Runtime__Factory$', { configure: (value) => calls.push({ type: 'configure', value }) });
  container.register('node:path', { join: (...parts) => parts.join('/') });
  const apiHandler = { name: 'api' };
  const staticHandler = { init: async (value) => calls.push({ type: 'static-init', value }) };
  container.register('Mindstream_Back_Web_Handler$', apiHandler);
  container.register('TeqFw_Web_Back_Handler_Static$', staticHandler);
  container.register('TeqFw_Web_Back_Dto_Source__Factory$', { create: (value) => value });
  container.register('TeqFw_Web_Back_PipelineEngine$', { addHandler: (value) => calls.push({ type: 'add-handler', value }) });
  container.register('Mindstream_Back_Storage_Database$', {
    async init() { calls.push({ type: 'database-init' }); },
    async destroy() { calls.push({ type: 'destroy' }); },
  });

  const plugin = await container.get('Mindstream_Back_App_Plugin$');
  await plugin.onStartup();
  await plugin.onStartup();
  await plugin.onShutdown();

  assert.deepEqual(calls.map((item) => item.type), ['database-init', 'config-init', 'configure', 'static-init', 'add-handler', 'add-handler', 'destroy']);
  assert.deepEqual(calls[2].value, { port: 3001, type: 'http' });
  assert.deepEqual(calls[4].value, apiHandler);
  assert.deepEqual(calls[5].value, staticHandler);
  assert.equal(calls[3].value.sources[0].root, '/application/web');
  assert.equal(calls[3].value.sources[1].root, '/application/node_modules/@teqfw/di/src');
});
