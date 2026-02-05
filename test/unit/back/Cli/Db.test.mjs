import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Mindstream_Back_Cli_Db dispatches to schema:create command', async () => {
  const container = await createTestContainer();
  const calls = [];

  container.register('Mindstream_Back_Cli_Db_Schema_Create$', {
    async execute(payload) {
      calls.push(payload);
    },
  });

  const dispatcher = await container.get('Mindstream_Back_Cli_Db$');
  await dispatcher.dispatch({ commandParts: ['schema', 'create'], args: [] });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, []);
});

test('Mindstream_Back_Cli_Db rejects unknown db command', async () => {
  const container = await createTestContainer();
  container.register('Mindstream_Back_Cli_Db_Schema_Create$', {
    async execute() {},
  });
  const dispatcher = await container.get('Mindstream_Back_Cli_Db$');

  await assert.rejects(
    dispatcher.dispatch({ commandParts: ['schema', 'drop'], args: [] }),
    /Unknown db command/
  );
});
