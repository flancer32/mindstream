import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('remaining Mindstream CLI products expose their Teq command identifiers', async () => {
  const container = await createTestContainer();
  container.register('Mindstream_Back_Storage_SchemaManager$', { async renewSchema() {} });
  container.register('Mindstream_Back_Ingest_Discover_Habr$', { async execute() {} });
  container.register('Mindstream_Back_Ingest_Extract_Habr$', { async execute() {} });

  const commands = await Promise.all([
    container.get('Mindstream_Back_Cli_Db_Schema_Renew$'),
    container.get('Mindstream_Back_Cli_Ingest_Discover_Habr$'),
    container.get('Mindstream_Back_Cli_Ingest_Extract_Habr$'),
  ]);
  assert.deepEqual(commands.map((command) => command.id), [
    'db:schema:renew',
    'ingest:discover:habr',
    'ingest:extract:habr',
  ]);
  for (const command of commands) {
    assert.equal(command.lifetime, 'finite');
    assert.deepEqual(command.arguments, []);
    assert.deepEqual(command.options, []);
    await command.execute({ args: {}, options: {} });
  }
});
