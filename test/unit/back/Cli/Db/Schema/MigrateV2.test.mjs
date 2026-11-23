import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../../di-node.mjs';

test('Mindstream_Back_Cli_Db_Schema_MigrateV2 is a finite Teq command product', async () => {
  const container = await createTestContainer();
  let called = 0;
  let input;
  container.register('Mindstream_Back_Storage_LegacyMigration$', { async execute(params) { called += 1; input = params; } });
  const command = await container.get('Mindstream_Back_Cli_Db_Schema_MigrateV2$');
  assert.equal(command.id, 'db:schema:migrate-legacy-to-dem-rdb');
  assert.equal(command.lifetime, 'finite');
  assert.deepEqual(command.arguments, []);
  assert.deepEqual(command.options, [{
    name: 'source-schema', kind: 'string', required: false,
    description: 'Legacy PostgreSQL schema. Defaults to public.',
  }]);
  await command.execute({ args: {}, options: { 'source-schema': 'archive' } });
  assert.equal(called, 1);
  assert.deepEqual(input, { sourceSchema: 'archive' });
});
