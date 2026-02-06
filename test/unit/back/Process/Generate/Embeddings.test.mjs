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

const buildStatusCatalog = function () {
  return {
    EMBEDDING_PENDING: 'embedding_pending',
    EMBEDDING_DONE: 'embedding_done',
    EMBEDDING_FAILED: 'embedding_failed',
  };
};

test('Mindstream_Back_Process_Generate_Embeddings generates embeddings for pending publications', async () => {
  const container = await createTestContainer();
  const calls = { list: 0, embed: 0, saved: [], status: [] };

  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  container.register('Mindstream_Back_Process_Publication_Store$', {
    async listForEmbeddings({ limit } = {}) {
      assert.equal(limit, 3);
      calls.list += 1;
      return [{ id: 41, overview: 'Overview', annotation: 'Annotation', status: 'summary_ready' }];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Process_Publication_EmbeddingStore$', {
    async findByPublicationId() {
      return null;
    },
    async saveEmbeddings(payload) {
      calls.saved.push(payload);
    },
  });

  container.register('Mindstream_Back_Integration_OpenAi$', {
    async embed() {
      calls.embed += 1;
      return { data: [{ embedding: [0.1, 0.2] }, { embedding: [0.3, 0.4] }] };
    },
  });

  const generator = await container.get('Mindstream_Back_Process_Generate_Embeddings$');
  await generator.execute();

  assert.equal(calls.embed, 1);
  assert.equal(calls.saved.length, 1);
  assert.equal(calls.saved[0].publicationId, 41);
  assert.equal(calls.status.length, 2);
  assert.equal(calls.status[0].status, 'embedding_pending');
  assert.equal(calls.status[1].status, 'embedding_done');
});

test('Mindstream_Back_Process_Generate_Embeddings skips publications with stored embeddings', async () => {
  const container = await createTestContainer();
  const calls = { embed: 0, saved: [], status: [] };

  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  container.register('Mindstream_Back_Process_Publication_Store$', {
    async listForEmbeddings() {
      return [{ id: 42, overview: 'Overview', annotation: 'Annotation', status: 'summary_ready' }];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Process_Publication_EmbeddingStore$', {
    async findByPublicationId() {
      return { overview_embedding: [1], annotation_embedding: [2] };
    },
    async saveEmbeddings(payload) {
      calls.saved.push(payload);
    },
  });

  container.register('Mindstream_Back_Integration_OpenAi$', {
    async embed() {
      calls.embed += 1;
      return { data: [{ embedding: [0.1] }, { embedding: [0.2] }] };
    },
  });

  const generator = await container.get('Mindstream_Back_Process_Generate_Embeddings$');
  await generator.execute();

  assert.equal(calls.embed, 0);
  assert.equal(calls.saved.length, 0);
  assert.equal(calls.status.length, 0);
});

test('Mindstream_Back_Process_Generate_Embeddings marks failures and continues', async () => {
  const container = await createTestContainer();
  const calls = { embed: 0, saved: [], status: [] };

  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  container.register('Mindstream_Back_Process_Publication_Store$', {
    async listForEmbeddings() {
      return [
        { id: 51, overview: 'Bad', annotation: 'Bad', status: 'summary_ready' },
        { id: 52, overview: 'Good', annotation: 'Good', status: 'summary_ready' },
      ];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Process_Publication_EmbeddingStore$', {
    async findByPublicationId() {
      return null;
    },
    async saveEmbeddings(payload) {
      calls.saved.push(payload);
    },
  });

  container.register('Mindstream_Back_Integration_OpenAi$', {
    async embed() {
      calls.embed += 1;
      if (calls.embed === 1) {
        throw new Error('Embedding failed');
      }
      return { data: [{ embedding: [0.1] }, { embedding: [0.2] }] };
    },
  });

  const generator = await container.get('Mindstream_Back_Process_Generate_Embeddings$');
  await generator.execute();

  assert.equal(calls.saved.length, 1);
  assert.equal(calls.saved[0].publicationId, 52);
  assert.equal(calls.status[0].id, 51);
  assert.equal(calls.status[0].status, 'embedding_pending');
  assert.equal(calls.status[1].id, 51);
  assert.equal(calls.status[1].status, 'embedding_failed');
  assert.equal(calls.status[2].id, 52);
  assert.equal(calls.status[2].status, 'embedding_pending');
  assert.equal(calls.status[3].id, 52);
  assert.equal(calls.status[3].status, 'embedding_done');
});

test('Mindstream_Back_Process_Generate_Embeddings enforces atomic embedding save', async () => {
  const container = await createTestContainer();
  const calls = { saved: [], status: [] };

  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  container.register('Mindstream_Back_Process_Publication_Store$', {
    async listForEmbeddings() {
      return [{ id: 61, overview: 'Overview', annotation: 'Annotation', status: 'summary_ready' }];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Process_Publication_EmbeddingStore$', {
    async findByPublicationId() {
      return null;
    },
    async saveEmbeddings(payload) {
      calls.saved.push(payload);
    },
  });

  container.register('Mindstream_Back_Integration_OpenAi$', {
    async embed() {
      return { data: [{ embedding: [0.1, 0.2] }] };
    },
  });

  const generator = await container.get('Mindstream_Back_Process_Generate_Embeddings$');
  await generator.execute();

  assert.equal(calls.saved.length, 0);
  assert.equal(calls.status[0].status, 'embedding_pending');
  assert.equal(calls.status[calls.status.length - 1].status, 'embedding_failed');
});
