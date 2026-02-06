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
    SUMMARY_FAILED: 'summary_failed',
    SUMMARY_READY: 'summary_ready',
  };
};

test('Mindstream_Back_Process_Generate_Summaries generates summaries for pending publications', async () => {
  const container = await createTestContainer();
  const calls = { list: 0, summarize: 0, saved: [], status: [] };

  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  container.register('Mindstream_Back_Process_Publication_Store$', {
    async listForSummaries({ limit } = {}) {
      assert.equal(limit, 3);
      calls.list += 1;
      return [{ id: 11, md_text: 'Hello world', status: 'extracted' }];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Process_Publication_SummaryStore$', {
    async findByPublicationId() {
      return null;
    },
    async saveSummary(payload) {
      calls.saved.push(payload);
    },
  });

  container.register('Mindstream_Back_Integration_OpenAi$', {
    async summarize() {
      calls.summarize += 1;
      return { output_text: JSON.stringify({ overview: 'Overview', annotation: 'Annotation' }) };
    },
  });

  const generator = await container.get('Mindstream_Back_Process_Generate_Summaries$');
  await generator.execute();

  assert.equal(calls.summarize, 1);
  assert.equal(calls.saved.length, 1);
  assert.equal(calls.saved[0].publicationId, 11);
  assert.equal(calls.status.length, 1);
  assert.equal(calls.status[0].id, 11);
  assert.equal(calls.status[0].status, 'summary_ready');
});

test('Mindstream_Back_Process_Generate_Summaries skips publications with summaries', async () => {
  const container = await createTestContainer();
  const calls = { summarize: 0 };

  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  let listCalls = 0;
  container.register('Mindstream_Back_Process_Publication_Store$', {
    async listForSummaries({ limit } = {}) {
      assert.equal(limit, 3);
      listCalls += 1;
      return [{ id: 22, md_text: 'Already done', status: 'summary_ready' }];
    },
    async updateStatus() {},
  });

  container.register('Mindstream_Back_Process_Publication_SummaryStore$', {
    async findByPublicationId() {
      return { overview: 'Ready', annotation: 'Ready' };
    },
    async saveSummary() {},
  });

  container.register('Mindstream_Back_Integration_OpenAi$', {
    async summarize() {
      calls.summarize += 1;
      return { output_text: JSON.stringify({ overview: 'Ignored', annotation: 'Ignored' }) };
    },
  });

  const generator = await container.get('Mindstream_Back_Process_Generate_Summaries$');
  await generator.execute();

  assert.equal(calls.summarize, 0);
});

test('Mindstream_Back_Process_Generate_Summaries marks failures and continues', async () => {
  const container = await createTestContainer();
  const calls = { status: [], saved: [], summarize: 0 };

  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  let listCalls = 0;
  container.register('Mindstream_Back_Process_Publication_Store$', {
    async listForSummaries({ limit } = {}) {
      assert.equal(limit, 3);
      listCalls += 1;
      return [
        { id: 31, md_text: 'Bad text', status: 'extracted' },
        { id: 32, md_text: 'Good text', status: 'extracted' },
      ];
    },
    async updateStatus(payload) {
      calls.status.push(payload);
    },
  });

  container.register('Mindstream_Back_Process_Publication_SummaryStore$', {
    async findByPublicationId() {
      return null;
    },
    async saveSummary(payload) {
      calls.saved.push(payload);
    },
  });

  container.register('Mindstream_Back_Integration_OpenAi$', {
    async summarize() {
      calls.summarize += 1;
      if (calls.summarize === 1) {
        throw new Error('LLM failed');
      }
      return { output_text: JSON.stringify({ overview: 'Overview', annotation: 'Annotation' }) };
    },
  });

  const generator = await container.get('Mindstream_Back_Process_Generate_Summaries$');
  await generator.execute();

  assert.equal(calls.status.length, 2);
  assert.equal(calls.status[0].id, 31);
  assert.equal(calls.status[0].status, 'summary_failed');
  assert.equal(calls.status[1].id, 32);
  assert.equal(calls.status[1].status, 'summary_ready');
  assert.equal(calls.saved.length, 1);
  assert.equal(calls.saved[0].publicationId, 32);
});
