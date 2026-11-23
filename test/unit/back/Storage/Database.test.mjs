import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Database exposes and closes the application DEM-RDB storage', async () => {
  const container = await createTestContainer();
  const calls = [];
  const knex = {};
  const backend = {};
  container.register('TeqFw_Cli_Config$', { applicationRoot: '/mindstream' });
  container.register('Mindstream_Back_Storage_DemDatabase$', {
    async initialize(params) { calls.push({ type: 'init', params }); },
    getBackend: () => backend,
    getClient: () => knex,
    async close() { calls.push({ type: 'close' }); },
  });
  const database = await container.get('Mindstream_Back_Storage_Database$');
  assert.throws(() => database.get(), /not initialized/);
  await database.init();
  await database.init();
  assert.equal(database.get(), knex);
  assert.equal(database.getBackend(), backend);
  await database.destroy();
  assert.deepEqual(calls, [
    { type: 'init', params: { hostRoot: '/mindstream', scope: 'mindstream' } },
    { type: 'close' },
  ]);
});
