import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('Mindstream_Back_Web_Api_Dispatcher returns undefined for unknown path', async () => {
  const container = await createTestContainer();

  container.register('Mindstream_Back_Web_Api_FeedView$', {});

  const dispatcher = await container.get('Mindstream_Back_Web_Api_Dispatcher$');
  const handler = dispatcher.resolve('/unknown');

  assert.equal(handler, undefined);
});

test('Mindstream_Back_Web_Api_Dispatcher returns feed handler for /feed', async () => {
  const container = await createTestContainer();
  const handler = { handle() {} };

  container.register('Mindstream_Back_Web_Api_FeedView$', handler);

  const dispatcher = await container.get('Mindstream_Back_Web_Api_Dispatcher$');
  const resolved = dispatcher.resolve('/feed');

  assert.equal(resolved, handler);
});
