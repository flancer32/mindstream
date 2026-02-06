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
    EMBEDDING_PENDING: 'embedding_pending',
  };
};

const createQueryBuilder = function ({ rows } = {}) {
  const calls = {
    join: [],
    leftJoin: [],
    select: [],
    whereNotNull: [],
    whereNull: [],
    whereNot: [],
    whereIn: [],
    orderBy: [],
    limit: [],
  };

  const builder = {
    join(...args) {
      calls.join.push(args);
      return builder;
    },
    leftJoin(...args) {
      calls.leftJoin.push(args);
      return builder;
    },
    select(...args) {
      calls.select.push(args);
      return builder;
    },
    whereNotNull(...args) {
      calls.whereNotNull.push(args);
      return builder;
    },
    whereNull(...args) {
      calls.whereNull.push(args);
      return builder;
    },
    whereNot(...args) {
      calls.whereNot.push(args);
      return builder;
    },
    whereIn(...args) {
      calls.whereIn.push(args);
      return builder;
    },
    orderBy(...args) {
      calls.orderBy.push(args);
      return builder;
    },
    limit(...args) {
      calls.limit.push(args);
      return builder;
    },
    then(resolve, reject) {
      return Promise.resolve(rows ?? []).then(resolve, reject);
    },
  };

  return { builder, calls };
};

const createKnexStub = function ({ rows } = {}) {
  const { builder, calls } = createQueryBuilder({ rows });
  const updates = [];

  const knex = function (table) {
    if (table === 'publications as p') return builder;
    if (table === 'publications') {
      return {
        where(criteria) {
          return {
            async update(payload) {
              updates.push({ criteria, payload });
            },
          };
        },
      };
    }
    throw new Error(`Unexpected table "${table}".`);
  };

  return { knex, calls, updates };
};

test('Mindstream_Back_Process_Publication_Store selects publications without summaries', async () => {
  const container = await createTestContainer();
  const { knex, calls } = createKnexStub({
    rows: [{ id: 1, md_text: 'Text', status: 'extracted' }],
  });

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  const store = await container.get('Mindstream_Back_Process_Publication_Store$');
  const rows = await store.listForSummaries();

  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, 1);
  assert.equal(calls.join.length, 1);
  assert.equal(calls.leftJoin.length, 1);
  assert.equal(calls.whereNotNull.length, 1);
  assert.equal(calls.whereNull.length, 1);
  assert.equal(calls.whereNot.length, 1);
  assert.deepEqual(calls.whereNot[0], ['p.status', 'summary_failed']);
});

test('Mindstream_Back_Process_Publication_Store selects publications for embeddings', async () => {
  const container = await createTestContainer();
  const { knex, calls } = createKnexStub({
    rows: [{ id: 2, overview: 'Overview', annotation: 'Annotation', status: 'summary_ready' }],
  });

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  const store = await container.get('Mindstream_Back_Process_Publication_Store$');
  const rows = await store.listForEmbeddings();

  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, 2);
  assert.equal(calls.join.length, 1);
  assert.equal(calls.leftJoin.length, 1);
  assert.equal(calls.whereNotNull.length, 2);
  assert.equal(calls.whereNull.length, 1);
  assert.equal(calls.whereIn.length, 1);
  assert.deepEqual(calls.whereIn[0], ['p.status', ['summary_ready', 'embedding_pending']]);
});

test('Mindstream_Back_Process_Publication_Store updates status', async () => {
  const container = await createTestContainer();
  const { knex, updates } = createKnexStub();

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Mindstream_Back_Process_Publication_Status$', buildStatusCatalog());

  const store = await container.get('Mindstream_Back_Process_Publication_Store$');
  await store.updateStatus({ id: 5, status: 'summary_failed' });

  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0].criteria, { id: 5 });
  assert.deepEqual(updates[0].payload, { status: 'summary_failed' });
});
