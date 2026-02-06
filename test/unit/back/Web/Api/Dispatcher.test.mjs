import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('Mindstream_Back_Web_Api_Dispatcher returns undefined for unknown path', async () => {
  const container = await createTestContainer();
  const dispatcher = await container.get('Mindstream_Back_Web_Api_Dispatcher$');

  const handler = dispatcher.resolve('/unknown');

  assert.equal(handler, undefined);
});
