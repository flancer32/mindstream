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

const createBackendStub = function ({ existing } = {}) {
  const creates = [];
  const repository = {
    async read() { return existing ? { record: existing } : undefined; },
    async create({ record }) { creates.push(record); return { record }; },
  };
  return {
    creates,
    async get({ path }) {
      assert.equal(path, '/mindstream/embedding');
      return repository;
    },
  };
};

test('Mindstream_Back_Process_Publication_EmbeddingStore saves embeddings', async () => {
  const container = await createTestContainer();
  const backend = createBackendStub();

  container.register('Mindstream_Back_Storage_Database$', { getBackend: () => backend });
  container.register('Mindstream_Back_Logger$', buildLogger());

  const store = await container.get('Mindstream_Back_Process_Publication_EmbeddingStore$');
  await store.saveEmbeddings({
    publicationId: 7,
    overviewEmbedding: Array(1536).fill(0.1),
    annotationEmbedding: Array(1536).fill(0.3),
  });

  assert.equal(backend.creates.length, 1);
  assert.equal(backend.creates[0].publication_id, '7');
  assert.equal(backend.creates[0].overview_embedding.length, 1536);
  assert.equal(backend.creates[0].annotation_embedding[0], 0.3);
});

test('Mindstream_Back_Process_Publication_EmbeddingStore detects existing embeddings', async () => {
  const container = await createTestContainer();
  const backend = createBackendStub({
    existing: { overview_embedding: [1], annotation_embedding: [2] },
  });

  container.register('Mindstream_Back_Storage_Database$', { getBackend: () => backend });
  container.register('Mindstream_Back_Logger$', buildLogger());

  const store = await container.get('Mindstream_Back_Process_Publication_EmbeddingStore$');
  const row = await store.saveEmbeddings({
    publicationId: 8,
    overviewEmbedding: Array(1536).fill(0.1),
    annotationEmbedding: Array(1536).fill(0.2),
  });

  assert.equal(backend.creates.length, 0);
  assert.deepEqual(row, { overview_embedding: [1], annotation_embedding: [2] });
});

test('Mindstream_Back_Process_Publication_EmbeddingStore rejects incomplete row', async () => {
  const container = await createTestContainer();
  const backend = createBackendStub({
    existing: { overview_embedding: [1], annotation_embedding: null },
  });

  container.register('Mindstream_Back_Storage_Database$', { getBackend: () => backend });
  container.register('Mindstream_Back_Logger$', buildLogger());

  const store = await container.get('Mindstream_Back_Process_Publication_EmbeddingStore$');

  await assert.rejects(
    () =>
      store.saveEmbeddings({
        publicationId: 9,
        overviewEmbedding: Array(1536).fill(0.1),
        annotationEmbedding: Array(1536).fill(0.2),
      }),
    /incomplete embeddings/u,
  );
});
