import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Database owns initialization and shutdown of the @teqfw/db connection', async () => {
  const container = await createTestContainer();
  const calls = [];
  const knex = {};
  container.register('TeqFw_Db_Back_Config$', { get: () => ({ client: 'pg' }) });
  container.register('TeqFw_Db_Back_RDb_Connect$', {
    async init(config) { calls.push({ type: 'init', config }); }, getKnex: () => knex,
    async disconnect() { calls.push({ type: 'disconnect' }); },
  });
  const database = await container.get('Mindstream_Back_Storage_Database$');
  assert.throws(() => database.get(), /not initialized/);
  await database.init();
  await database.init();
  assert.equal(database.get(), knex);
  await database.destroy();
  assert.deepEqual(calls, [{ type: 'init', config: { client: 'pg' } }, { type: 'disconnect' }]);
});
