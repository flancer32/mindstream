import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

test('Mindstream_Back_Cli_Process routes generate:summaries', async () => {
  const container = await createTestContainer();
  const calls = [];

  container.register('Mindstream_Back_Cli_Process_Generate_Summaries$', {
    async execute(payload) {
      calls.push(payload);
    },
  });

  const dispatcher = await container.get('Mindstream_Back_Cli_Process$');
  await dispatcher.dispatch({ commandParts: ['generate', 'summaries'], args: [] });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].args, []);
});

test('Mindstream_Back_Cli_Process rejects unknown commands', async () => {
  const container = await createTestContainer();

  container.register('Mindstream_Back_Cli_Process_Generate_Summaries$', {
    async execute() {},
  });

  const dispatcher = await container.get('Mindstream_Back_Cli_Process$');
  await assert.rejects(
    dispatcher.dispatch({ commandParts: ['unknown', 'thing'], args: [] }),
    /Unknown process command/
  );
});
