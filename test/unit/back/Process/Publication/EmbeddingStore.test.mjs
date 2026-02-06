import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

const buildLogger = function () {
  return {
    info() {},
    debug() {},
    warn() {},
    error() {},
    exception() {},
  };
};

const createKnexStub = function ({ existing } = {}) {
  const inserts = [];
  const selects = [];

  const knex = function (table) {
    if (table !== 'publication_embeddings') {
      throw new Error(`Unexpected table "${table}".`);
    }
    return {
      where(criteria) {
        return {
          async first() {
            selects.push(criteria);
            return existing ?? null;
          },
        };
      },
      async insert(payload) {
        inserts.push(payload);
      },
    };
  };

  return { knex, inserts, selects };
};

test('Mindstream_Back_Process_Publication_EmbeddingStore saves embeddings', async () => {
  const container = await createTestContainer();
  const { knex, inserts } = createKnexStub();

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', buildLogger());

  const store = await container.get('Mindstream_Back_Process_Publication_EmbeddingStore$');
  await store.saveEmbeddings({
    publicationId: 7,
    overviewEmbedding: [0.1, 0.2],
    annotationEmbedding: [0.3, 0.4],
  });

  assert.equal(inserts.length, 1);
  assert.equal(inserts[0].publication_id, 7);
  assert.deepEqual(inserts[0].overview_embedding, [0.1, 0.2]);
  assert.deepEqual(inserts[0].annotation_embedding, [0.3, 0.4]);
  assert.ok(inserts[0].created_at);
});

test('Mindstream_Back_Process_Publication_EmbeddingStore detects existing embeddings', async () => {
  const container = await createTestContainer();
  const { knex, inserts } = createKnexStub({
    existing: { overview_embedding: [1], annotation_embedding: [2] },
  });

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', buildLogger());

  const store = await container.get('Mindstream_Back_Process_Publication_EmbeddingStore$');
  const row = await store.saveEmbeddings({
    publicationId: 8,
    overviewEmbedding: [0.1],
    annotationEmbedding: [0.2],
  });

  assert.equal(inserts.length, 0);
  assert.deepEqual(row, { overview_embedding: [1], annotation_embedding: [2] });
});

test('Mindstream_Back_Process_Publication_EmbeddingStore rejects incomplete row', async () => {
  const container = await createTestContainer();
  const { knex } = createKnexStub({
    existing: { overview_embedding: [1], annotation_embedding: null },
  });

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', buildLogger());

  const store = await container.get('Mindstream_Back_Process_Publication_EmbeddingStore$');

  await assert.rejects(
    () =>
      store.saveEmbeddings({
        publicationId: 9,
        overviewEmbedding: [0.1],
        annotationEmbedding: [0.2],
      }),
    /incomplete embeddings/u,
  );
});
