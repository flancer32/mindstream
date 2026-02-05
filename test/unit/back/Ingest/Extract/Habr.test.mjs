import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

const buildStatusCatalog = function () {
  return {
    EXTRACT_PENDING: 'extract_pending',
    EXTRACTED: 'extracted',
    EXTRACT_FAILED: 'extract_failed',
    EXTRACT_BROKEN: 'extract_broken',
  };
};

const buildLogger = function () {
  return {
    info() {},
    debug() {},
    warn() {},
    error() {},
    exception() {},
  };
};

test('Mindstream_Back_Ingest_Extract_Habr stores html and markdown', async () => {
  const container = await createTestContainer();
  const calls = { status: [], html: [], markdown: [], fetch: 0 };

  container.register('Mindstream_Back_Ingest_Publication_Status$', buildStatusCatalog());
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('node:timers/promises', { setTimeout: async () => {} });
  container.register('Mindstream_Back_Ingest_Source_Habr$', { getSourceId() { return 1; } });

  let listCalls = 0;
  container.register('Mindstream_Back_Ingest_Publication_Store$', {
    async listForExtraction() {
      listCalls += 1;
      if (listCalls > 1) return [];
      return [{ id: 101, source_url: 'https://habr.com/ru/articles/101/' }];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Ingest_Publication_ExtractionStore$', {
    async findByPublicationId() {
      return null;
    },
    async saveHtml(payload) {
      calls.html.push(payload);
    },
    async saveMarkdown(payload) {
      calls.markdown.push(payload);
    },
  });

  container.register('Mindstream_Back_Ingest_Extract_Habr_Fetcher$', {
    async fetchHtml() {
      calls.fetch += 1;
      return '<div class="tm-article-body"><p>Hello</p></div>';
    },
  });

  container.register('Mindstream_Back_Ingest_Extract_Habr_Parser$', {
    extractMarkdown() {
      return 'Hello';
    },
  });

  const extractor = await container.get('Mindstream_Back_Ingest_Extract_Habr$');
  await extractor.execute();

  assert.equal(calls.fetch, 1);
  assert.equal(calls.html.length, 1);
  assert.equal(calls.markdown.length, 1);
  assert.equal(calls.status.length, 1);
  assert.equal(calls.status[0].status, 'extracted');
});

test('Mindstream_Back_Ingest_Extract_Habr skips already extracted items', async () => {
  const container = await createTestContainer();
  const calls = { status: [], fetch: 0 };

  container.register('Mindstream_Back_Ingest_Publication_Status$', buildStatusCatalog());
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('node:timers/promises', { setTimeout: async () => {} });
  container.register('Mindstream_Back_Ingest_Source_Habr$', { getSourceId() { return 1; } });

  let listCalls = 0;
  container.register('Mindstream_Back_Ingest_Publication_Store$', {
    async listForExtraction() {
      listCalls += 1;
      if (listCalls > 1) return [];
      return [{ id: 202, source_url: 'https://habr.com/ru/articles/202/' }];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Ingest_Publication_ExtractionStore$', {
    async findByPublicationId() {
      return { publication_id: 202, md_text: 'Ready', html: '<div></div>' };
    },
  });

  container.register('Mindstream_Back_Ingest_Extract_Habr_Fetcher$', {
    async fetchHtml() {
      calls.fetch += 1;
      return '';
    },
  });

  container.register('Mindstream_Back_Ingest_Extract_Habr_Parser$', {
    extractMarkdown() {
      return 'Ignored';
    },
  });

  const extractor = await container.get('Mindstream_Back_Ingest_Extract_Habr$');
  await extractor.execute();

  assert.equal(calls.fetch, 0);
  assert.equal(calls.status.length, 1);
  assert.equal(calls.status[0].status, 'extracted');
});

test('Mindstream_Back_Ingest_Extract_Habr marks fetch errors as temporary', async () => {
  const container = await createTestContainer();
  const calls = { status: [] };

  container.register('Mindstream_Back_Ingest_Publication_Status$', buildStatusCatalog());
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('node:timers/promises', { setTimeout: async () => {} });
  container.register('Mindstream_Back_Ingest_Source_Habr$', { getSourceId() { return 1; } });

  let listCalls = 0;
  container.register('Mindstream_Back_Ingest_Publication_Store$', {
    async listForExtraction() {
      listCalls += 1;
      if (listCalls > 1) return [];
      return [{ id: 303, source_url: 'https://habr.com/ru/articles/303/' }];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Ingest_Publication_ExtractionStore$', {
    async findByPublicationId() {
      return null;
    },
    async saveHtml() {},
  });

  container.register('Mindstream_Back_Ingest_Extract_Habr_Fetcher$', {
    async fetchHtml() {
      const err = new Error('Fetch failed');
      err.isFetchError = true;
      throw err;
    },
  });

  container.register('Mindstream_Back_Ingest_Extract_Habr_Parser$', {
    extractMarkdown() {
      return 'Ignored';
    },
  });

  const extractor = await container.get('Mindstream_Back_Ingest_Extract_Habr$');
  await extractor.execute();

  assert.equal(calls.status.length, 1);
  assert.equal(calls.status[0].status, 'extract_failed');
});

test('Mindstream_Back_Ingest_Extract_Habr marks extraction errors as broken', async () => {
  const container = await createTestContainer();
  const calls = { status: [], html: [] };

  container.register('Mindstream_Back_Ingest_Publication_Status$', buildStatusCatalog());
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('node:timers/promises', { setTimeout: async () => {} });
  container.register('Mindstream_Back_Ingest_Source_Habr$', { getSourceId() { return 1; } });

  let listCalls = 0;
  container.register('Mindstream_Back_Ingest_Publication_Store$', {
    async listForExtraction() {
      listCalls += 1;
      if (listCalls > 1) return [];
      return [{ id: 404, source_url: 'https://habr.com/ru/articles/404/' }];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Ingest_Publication_ExtractionStore$', {
    async findByPublicationId() {
      return null;
    },
    async saveHtml(payload) {
      calls.html.push(payload);
    },
  });

  container.register('Mindstream_Back_Ingest_Extract_Habr_Fetcher$', {
    async fetchHtml() {
      return '<div class="tm-article-body"><p>Broken</p></div>';
    },
  });

  container.register('Mindstream_Back_Ingest_Extract_Habr_Parser$', {
    extractMarkdown() {
      const err = new Error('Extraction failed');
      err.isExtractionError = true;
      throw err;
    },
  });

  const extractor = await container.get('Mindstream_Back_Ingest_Extract_Habr$');
  await extractor.execute();

  assert.equal(calls.html.length, 1);
  assert.equal(calls.status.length, 1);
  assert.equal(calls.status[0].status, 'extract_broken');
});
