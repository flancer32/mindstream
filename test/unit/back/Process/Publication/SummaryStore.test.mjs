import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

const buildLogger = function () {
  const calls = { debug: [] };
  return {
    calls,
    debug(...args) {
      calls.debug.push(args);
    },
    info() {},
    warn() {},
    error() {},
    exception() {},
  };
};

const createBackendStub = function ({ existingRow } = {}) {
  const state = { row: existingRow ?? null };
  const creates = [];
  const repository = {
    async read() { return state.row ? { record: state.row } : undefined; },
    async create({ record }) { creates.push(record); state.row = record; return { record }; },
  };
  return {
    state, creates,
    async get({ path }) { assert.equal(path, '/mindstream/summary'); return repository; },
  };
};

test('Mindstream_Back_Process_Publication_SummaryStore saves new summaries', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  const backend = createBackendStub();

  container.register('Mindstream_Back_Storage_Database$', { getBackend: () => backend });
  container.register('Mindstream_Back_Logger$', logger);

  const store = await container.get('Mindstream_Back_Process_Publication_SummaryStore$');
  const row = await store.saveSummary({
    publicationId: 10,
    overview: 'Overview',
    annotation: 'Annotation',
  });

  assert.equal(backend.creates.length, 1);
  assert.equal(backend.state.row.publication_id, '10');
  assert.equal(row.overview, 'Overview');
  assert.equal(row.annotation, 'Annotation');
  assert.equal(logger.calls.debug.length, 0);
});

test('Mindstream_Back_Process_Publication_SummaryStore skips existing summaries', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  const backend = createBackendStub({
    existingRow: { publication_id: 11, overview: 'Ready', annotation: 'Ready' },
  });

  container.register('Mindstream_Back_Storage_Database$', { getBackend: () => backend });
  container.register('Mindstream_Back_Logger$', logger);

  const store = await container.get('Mindstream_Back_Process_Publication_SummaryStore$');
  const row = await store.saveSummary({
    publicationId: 11,
    overview: 'Overview',
    annotation: 'Annotation',
  });

  assert.equal(backend.creates.length, 0);
  assert.equal(row.overview, 'Ready');
  assert.equal(logger.calls.debug.length, 1);
});

test('Mindstream_Back_Process_Publication_SummaryStore rejects incomplete summaries', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  const backend = createBackendStub({
    existingRow: { publication_id: 12, overview: 'Only overview', annotation: null },
  });

  container.register('Mindstream_Back_Storage_Database$', { getBackend: () => backend });
  container.register('Mindstream_Back_Logger$', logger);

  const store = await container.get('Mindstream_Back_Process_Publication_SummaryStore$');
  await assert.rejects(
    store.saveSummary({
      publicationId: 12,
      overview: 'Overview',
      annotation: 'Annotation',
    }),
    /incomplete summaries/
  );
});
