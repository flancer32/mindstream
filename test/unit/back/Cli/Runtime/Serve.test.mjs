import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('Mindstream_Back_Cli_Runtime_Serve rejects arguments', async () => {
  const container = await createTestContainer();
  const command = await container.get('Mindstream_Back_Cli_Runtime_Serve$');

  await assert.rejects(command.execute({ args: ['extra'] }), /does not accept arguments/);
});

test('Mindstream_Back_Cli_Runtime_Serve is not implemented', async () => {
  const container = await createTestContainer();
  const command = await container.get('Mindstream_Back_Cli_Runtime_Serve$');

  await assert.rejects(command.execute({ args: [] }), /not implemented/);
});
