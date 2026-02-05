import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('Mindstream_Back_Ingest_Discover_Habr stores discovered items', async () => {
  const container = await createTestContainer();
  const calls = [];

  container.register('Mindstream_Back_Ingest_Source_Habr$', {
    getSourceDescriptor() {
      return { id: 1, code: 'habr', url: 'https://habr.com/ru/rss/articles/', name: 'Habr', description: 'Habr', is_active: true };
    },
    async discover() {
      return [
        {
          source_id: 1,
          source_item_hash: 'hash-1',
          source_url: 'https://habr.com/ru/articles/1/',
          rss_title: 'Title 1',
          rss_guid: 'guid-1',
          rss_published_at: '2024-01-01T00:00:00.000Z',
        },
      ];
    },
  });

  container.register('Mindstream_Back_Ingest_Publication_Store$', {
    async saveDiscovered(payload) {
      calls.push(payload);
    },
  });

  const discoverer = await container.get('Mindstream_Back_Ingest_Discover_Habr$');
  await discoverer.execute();

  assert.equal(calls.length, 1);
  assert.equal(calls[0].items.length, 1);
  assert.equal(calls[0].items[0].source_item_hash, 'hash-1');
});
