import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../../di-node.mjs';

test('Mindstream_Back_Cli_Process_Generate_Summaries calls generator', async () => {
  const container = await createTestContainer();
  let called = 0;

  container.register('Mindstream_Back_Process_Generate_Summaries$', {
    async execute() {
      called += 1;
    },
  });

  const command = await container.get('Mindstream_Back_Cli_Process_Generate_Summaries$');
  await command.execute({ args: [] });

  assert.equal(called, 1);
});

test('Mindstream_Back_Cli_Process_Generate_Summaries rejects arguments', async () => {
  const container = await createTestContainer();

  container.register('Mindstream_Back_Process_Generate_Summaries$', {
    async execute() {},
  });

  const command = await container.get('Mindstream_Back_Cli_Process_Generate_Summaries$');
  await assert.rejects(command.execute({ args: ['extra'] }), /does not accept arguments/);
});
