import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../di-node.mjs';

test('Mindstream_Back_App resolves via DI container', async () => {
  const container = await createTestContainer();
  container.register('Mindstream_Back_App_Cli_Dispatcher$', {
    async dispatch() {
      return 0;
    },
  });
  const app = await container.get('Mindstream_Back_App$');

  assert.ok(app);
  assert.equal(typeof app.run, 'function');
  assert.equal(typeof app.stop, 'function');
});
