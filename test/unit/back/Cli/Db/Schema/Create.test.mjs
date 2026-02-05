import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../../di-node.mjs';

test('Mindstream_Back_Cli_Db_Schema_Create calls schema manager', async () => {
  const container = await createTestContainer();
  let called = 0;

  container.register('Mindstream_Back_Storage_SchemaManager$', {
    async createSchema() {
      called += 1;
    },
  });

  const command = await container.get('Mindstream_Back_Cli_Db_Schema_Create$');
  await command.execute({ args: [] });

  assert.equal(called, 1);
});

test('Mindstream_Back_Cli_Db_Schema_Create rejects arguments', async () => {
  const container = await createTestContainer();

  container.register('Mindstream_Back_Storage_SchemaManager$', {
    async createSchema() {},
  });

  const command = await container.get('Mindstream_Back_Cli_Db_Schema_Create$');
  await assert.rejects(command.execute({ args: ['extra'] }), /does not accept arguments/);
});
