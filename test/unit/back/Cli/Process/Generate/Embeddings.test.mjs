import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../../di-node.mjs';

test('Mindstream_Back_Cli_Process_Generate_Embeddings rejects arguments', async () => {
  const container = await createTestContainer();

  container.register('Mindstream_Back_Process_Generate_Embeddings$', {
    async execute() {},
  });

  const command = await container.get('Mindstream_Back_Cli_Process_Generate_Embeddings$');

  await assert.rejects(
    () => command.execute({ args: ['extra'] }),
    /process:generate:embeddings does not accept arguments/u,
  );
});

test('Mindstream_Back_Cli_Process_Generate_Embeddings executes generator', async () => {
  const container = await createTestContainer();
  let called = 0;

  container.register('Mindstream_Back_Process_Generate_Embeddings$', {
    async execute() {
      called += 1;
    },
  });

  const command = await container.get('Mindstream_Back_Cli_Process_Generate_Embeddings$');
  await command.execute();

  assert.equal(called, 1);
});
