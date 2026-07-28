import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../di-node.mjs';

test('Mindstream_Back_App returns the root dispatcher exit code', async () => {
  const container = await createTestContainer();
  const calls = [];
  container.register('Mindstream_Back_App_Configuration$', {
    async init() {},
  });
  container.register('Mindstream_Back_App_Cli_Dispatcher$', {
    async dispatch(params) {
      calls.push(params);
      return 7;
    },
  });
  container.register('Mindstream_Back_Storage_Knex$', {});
  const app = await container.get('Mindstream_Back_App$');

  assert.ok(app);
  assert.equal(typeof app.run, 'function');
  assert.equal(typeof app.stop, 'function');
  assert.equal(await app.run({ cliArgs: ['db:schema:create'] }), 7);
  assert.deepEqual(calls, [{ cliArgs: ['db:schema:create'] }]);
});
