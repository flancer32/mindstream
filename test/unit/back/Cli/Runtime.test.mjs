import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Mindstream_Back_Cli_Runtime dispatches to runtime:serve command', async () => {
  const container = await createTestContainer();
  const calls = [];

  container.register('Mindstream_Back_Cli_Runtime_Serve$', {
    async execute(payload) {
      calls.push(payload);
    },
  });

  const dispatcher = await container.get('Mindstream_Back_Cli_Runtime$');
  await dispatcher.dispatch({ commandParts: ['serve'], args: [] });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, []);
});

test('Mindstream_Back_Cli_Runtime rejects unknown runtime command', async () => {
  const container = await createTestContainer();
  container.register('Mindstream_Back_Cli_Runtime_Serve$', {
    async execute() {},
  });

  const dispatcher = await container.get('Mindstream_Back_Cli_Runtime$');

  await assert.rejects(
    dispatcher.dispatch({ commandParts: ['stop'], args: [] }),
    /Unknown runtime command/
  );
});
