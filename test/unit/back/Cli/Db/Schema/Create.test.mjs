import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../../di-node.mjs';

test('Mindstream_Back_Cli_Db_Schema_Create is a finite Teq command product', async () => {
  const container = await createTestContainer();
  let called = 0;

  container.register('Mindstream_Back_Storage_SchemaManager$', {
    async createSchema() {
      called += 1;
    },
  });

  const command = await container.get('Mindstream_Back_Cli_Db_Schema_Create$');
  assert.equal(command.id, 'db:schema:create');
  assert.equal(command.lifetime, 'finite');
  assert.deepEqual(command.arguments, []);
  assert.deepEqual(command.options, []);
  await command.execute({ args: {}, options: {} });

  assert.equal(called, 1);
});
