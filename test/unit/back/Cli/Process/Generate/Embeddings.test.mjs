import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../../di-node.mjs';

test('Mindstream_Back_Cli_Process_Generate_Embeddings is a finite Teq command product', async () => {
  const container = await createTestContainer();
  let called = 0;

  container.register('Mindstream_Back_Process_Generate_Embeddings$', {
    async execute() {
      called += 1;
    },
  });

  const command = await container.get('Mindstream_Back_Cli_Process_Generate_Embeddings$');
  assert.equal(command.id, 'process:generate:embeddings');
  assert.equal(command.lifetime, 'finite');
  await command.execute({ args: {}, options: {} });

  assert.equal(called, 1);
});
