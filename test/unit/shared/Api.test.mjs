import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../di-node.mjs';

test('Mindstream_Shared_Api_Feed creates one immutable transport response', async () => {
  const container = await createTestContainer();
  const feed = await container.get('Mindstream_Shared_Api_Feed$');

  const response = feed.createResponse({
    sources: [{ code: 'habr', name: 'Habr', url: 'https://habr.com/' }],
    items: [{
      id: 7,
      sourceCode: 'habr',
      title: 'A publication',
      url: 'https://habr.com/post/7',
      publishedAt: '2026-07-27T00:00:00.000Z',
      annotation: 'Short annotation',
      overview: 'Long overview',
      embeddings: { annotation: '[1, 2]', overview: [3, 4] },
    }],
    cursor: { id: 7, publishedAt: '2026-07-27T00:00:00.000Z' },
  });

  assert.equal(response.items[0].embeddings.annotation[1], 2);
  assert.equal(response.cursor.id, 7);
  assert.throws(() => feed.createResponse({ sources: [], items: [{ id: 'invalid' }] }));
});

test('Mindstream_Shared_Api_Attention uses the same signal form for browser and backend', async () => {
  const container = await createTestContainer();
  const attention = await container.get('Mindstream_Shared_Api_Attention$');

  const signal = attention.createClientSignal({
    identity: '1b7e2f0d-3c80-4c25-8d9a-9862bda6ae40',
    pubId: 42,
    type: 'source_click_after_overview',
  });

  assert.deepEqual(signal, {
    identity: '1b7e2f0d-3c80-4c25-8d9a-9862bda6ae40',
    publication_id: 42,
    attention_type: 'link_click_after_overview',
  });
  assert.throws(() => attention.createSignal({ ...signal, attention_type: 'unknown' }));
});
