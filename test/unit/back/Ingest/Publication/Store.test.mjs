import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('discovery skips expired items and allocates IDs only to retained items', async () => {
  const container = await createTestContainer();
  const inserted = [];
  const allocated = [];
  const source = {id: 1, code: 'habr', name: 'Habr', url: 'https://habr.com/', is_active: true};
  const items = [
    {source_id: 1, source_item_hash: 'old', source_url: 'https://habr.com/old', rss_published_at: '2026-08-15T00:00:00.000Z'},
    {source_id: 1, source_item_hash: 'boundary', source_url: 'https://habr.com/boundary', rss_published_at: '2026-08-16T00:00:00.000Z'},
    {source_id: 1, source_item_hash: 'current', source_url: 'https://habr.com/current', rss_published_at: '2026-08-16T00:00:00.001Z'},
    {source_id: 1, source_item_hash: 'undated', source_url: 'https://habr.com/undated', rss_published_at: null},
  ];
  const database = {get: () => ({transaction: async (callback) => callback(Object.assign((table) => ({
    insert: (data) => {
      inserted.push(...(Array.isArray(data) ? data.map((item) => ({table, data: item})) : [{table, data}]));
      return {onConflict: () => ({ignore: () => ({returning: async () => [{id: data.id}]})})};
    },
  }), {raw: async () => ({rows: []})}))})};
  container.register('Mindstream_Back_Storage_Database$', database);
  container.register('Mindstream_Back_Logger$', {info() {}});
  container.register('Mindstream_Back_Ingest_Publication_IdAllocator$', {
    allocate: async (_trx, count) => {
      allocated.push(count);
      return Array.from({length: count}, (_item, index) => String(index + 10));
    },
  });

  const store = await container.get('Mindstream_Back_Ingest_Publication_Store$');
  await store.saveDiscovered({source, items, now: new Date('2026-11-24T00:00:00.000Z')});

  const publications = inserted.filter(({table}) => table === 'mindstream_publication');
  assert.equal(publications.length, 2);
  assert.deepEqual(publications.map(({data}) => data.source_item_hash), ['current', 'undated']);
  assert.deepEqual(publications.map(({data}) => data.id), ['10', '11']);
  assert.equal(publications[1].data.rss_published_at, null);
  assert.deepEqual(allocated, [2]);
});

test('discovery uses discovery time for undated items and persists them as retained', async () => {
  const container = await createTestContainer();
  const inserts = [];
  container.register('Mindstream_Back_Storage_Database$', {get: () => ({transaction: async (callback) => callback(Object.assign((table) => ({
    insert: (data) => {
      inserts.push(...(Array.isArray(data) ? data.map((item) => ({table, data: item})) : [{table, data}]));
      return {onConflict: () => ({ignore: async () => undefined})};
    },
  }), {raw: async () => ({rows: []})}))})});
  container.register('Mindstream_Back_Logger$', {info() {}});
  container.register('Mindstream_Back_Ingest_Publication_IdAllocator$', {allocate: async () => ['5']});
  const store = await container.get('Mindstream_Back_Ingest_Publication_Store$');
  await store.saveDiscovered({source: {id: 1, code: 'habr', name: 'Habr', url: 'https://habr.com/'}, items: [
    {source_id: 1, source_item_hash: 'undated', source_url: 'https://habr.com/undated'},
  ], now: new Date('2026-11-24T00:00:00.000Z')});
  const publication = inserts.find(({table}) => table === 'mindstream_publication').data;
  assert.equal(publication.rss_published_at, null);
  assert.equal(publication.discovered_at, '2026-11-24T00:00:00.000000Z');
});
