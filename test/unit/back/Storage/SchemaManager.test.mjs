import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Mindstream_Back_Storage_SchemaManager resolves with knex stub', async () => {
  const container = await createTestContainer();
  const knexStub = { schema: {} };

  container.register('knex$', knexStub);

  const manager = await container.get('Mindstream_Back_Storage_SchemaManager$');
  assert.ok(manager);
  assert.equal(typeof manager.applySchema, 'function');
  assert.equal(typeof manager.recreateWithPreserve, 'function');
  assert.equal(typeof manager.createSchema, 'function');
});
