import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('Mindstream_Back_Cli_Runtime_Web rejects arguments', async () => {
  const container = await createTestContainer();
  container.register('Mindstream_Back_Runtime_Web_Server$', {
    async start() {},
    async wait() {},
  });
  const command = await container.get('Mindstream_Back_Cli_Runtime_Web$');

  await assert.rejects(command.execute({ args: ['extra'] }), /does not accept arguments/);
});

test('Mindstream_Back_Cli_Runtime_Web waits after start', async () => {
  const container = await createTestContainer();
  const calls = [];

  container.register('Mindstream_Back_Runtime_Web_Server$', {
    async start() {
      calls.push('start');
    },
    async wait() {
      calls.push('wait');
    },
  });

  const command = await container.get('Mindstream_Back_Cli_Runtime_Web$');
  await command.execute({ args: [] });

  assert.deepEqual(calls, ['start', 'wait']);
});
