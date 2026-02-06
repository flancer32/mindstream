import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Mindstream_Back_Cli_Runtime dispatches to runtime:web command', async () => {
  const container = await createTestContainer();
  const calls = [];

  container.register('Mindstream_Back_Cli_Runtime_Web$', {
    async execute(payload) {
      calls.push(payload);
    },
  });

  const dispatcher = await container.get('Mindstream_Back_Cli_Runtime$');
  await dispatcher.dispatch({ commandParts: ['web'], args: [] });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, []);
});

test('Mindstream_Back_Cli_Runtime rejects unknown runtime command', async () => {
  const container = await createTestContainer();
  container.register('Mindstream_Back_Cli_Runtime_Web$', {
    async execute() {},
  });

  const dispatcher = await container.get('Mindstream_Back_Cli_Runtime$');

  await assert.rejects(
    dispatcher.dispatch({ commandParts: ['stop'], args: [] }),
    /Unknown runtime command/
  );
});
