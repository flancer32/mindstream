import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('Mindstream_Back_Runtime_Web_HandlerList returns frozen empty list', async () => {
  const container = await createTestContainer();
  const list = await container.get('Mindstream_Back_Runtime_Web_HandlerList$');

  const handlers = list.get();

  assert.ok(Array.isArray(handlers));
  assert.equal(handlers.length, 0);
  assert.ok(Object.isFrozen(handlers));
});
