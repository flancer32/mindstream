import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Mindstream_Back_App_Plugin prepares shared application state and releases Knex', async () => {
  const container = await createTestContainer();
  const calls = [];
  container.register('node:fs/promises', {
    async access() {
      const error = new Error('Missing dotenv file');
      error.code = 'ENOENT';
      throw error;
    },
  });
  container.register('TeqFw_Cfg_Loader$', {
    async load(sources) {
      calls.push({ type: 'load', sources });
    },
  });
  container.register('TeqFw_Cfg_Source_ProcessEnv$', { create: (value) => ({ id: 'process-env', value }) });
  container.register('TeqFw_Cfg_Source_DotenvFile$', { create: (value) => ({ id: 'dotenv', value }) });
  container.register('Mindstream_Back_App_Configuration$', {
    async init() { calls.push({ type: 'config-init' }); },
    get() { return { server: { port: 3001, type: 'http' } }; },
  });
  container.register('Fl32_Web_Back_Config_Runtime__Factory$', { configure: (value) => calls.push({ type: 'configure', value }) });
  const apiHandler = { name: 'api' };
  const staticHandler = { init: async (value) => calls.push({ type: 'static-init', value }) };
  container.register('Mindstream_Back_Web_Handler$', apiHandler);
  container.register('Fl32_Web_Back_Handler_Static$', staticHandler);
  container.register('Fl32_Web_Back_Dto_Source__Factory$', { create: (value) => value });
  container.register('Fl32_Web_Back_PipelineEngine$', { addHandler: (value) => calls.push({ type: 'add-handler', value }) });
  container.register('Mindstream_Back_Storage_Knex$', { async destroy() { calls.push({ type: 'destroy' }); } });

  const plugin = await container.get('Mindstream_Back_App_Plugin$');
  await plugin.onStartup();
  await plugin.onStartup();
  await plugin.onShutdown();

  assert.deepEqual(calls.map((item) => item.type), ['load', 'config-init', 'configure', 'static-init', 'add-handler', 'add-handler', 'destroy']);
  assert.deepEqual(calls[2].value, { port: 3001, type: 'http' });
  assert.deepEqual(calls[4].value, apiHandler);
  assert.deepEqual(calls[5].value, staticHandler);
});
