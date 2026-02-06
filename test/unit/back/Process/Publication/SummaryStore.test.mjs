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

const createKnexStub = function ({ existingRow } = {}) {
  const state = { row: existingRow ?? null };
  const inserts = [];

  const knex = function (table) {
    if (table !== 'publication_summaries') {
      throw new Error(`Unexpected table "${table}".`);
    }
    return {
      where(criteria) {
        return {
          async first() {
            return state.row;
          },
        };
      },
      async insert(payload) {
        inserts.push(payload);
        state.row = {
          publication_id: payload.publication_id,
          overview: payload.overview,
          annotation: payload.annotation,
          created_at: payload.created_at,
        };
      },
    };
  };

  return { knex, state, inserts };
};

test('Mindstream_Back_Process_Publication_SummaryStore saves new summaries', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  const { knex, inserts, state } = createKnexStub();

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', logger);

  const store = await container.get('Mindstream_Back_Process_Publication_SummaryStore$');
  const row = await store.saveSummary({
    publicationId: 10,
    overview: 'Overview',
    annotation: 'Annotation',
  });

  assert.equal(inserts.length, 1);
  assert.equal(state.row.publication_id, 10);
  assert.equal(row.overview, 'Overview');
  assert.equal(row.annotation, 'Annotation');
  assert.equal(logger.calls.debug.length, 0);
});

test('Mindstream_Back_Process_Publication_SummaryStore skips existing summaries', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  const { knex, inserts } = createKnexStub({
    existingRow: { publication_id: 11, overview: 'Ready', annotation: 'Ready' },
  });

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', logger);

  const store = await container.get('Mindstream_Back_Process_Publication_SummaryStore$');
  const row = await store.saveSummary({
    publicationId: 11,
    overview: 'Overview',
    annotation: 'Annotation',
  });

  assert.equal(inserts.length, 0);
  assert.equal(row.overview, 'Ready');
  assert.equal(logger.calls.debug.length, 1);
});

test('Mindstream_Back_Process_Publication_SummaryStore rejects incomplete summaries', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  const { knex } = createKnexStub({
    existingRow: { publication_id: 12, overview: 'Only overview', annotation: null },
  });

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', logger);

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
