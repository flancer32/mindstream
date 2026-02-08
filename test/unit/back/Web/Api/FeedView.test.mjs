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

const createWhereCollector = function () {
  const calls = [];
  const builder = {
    where(...args) {
      if (typeof args[0] === 'function') {
        const nested = createWhereCollector();
        args[0].call(nested.builder);
        calls.push({ type: 'whereNested', calls: nested.calls });
      } else {
        calls.push({ type: 'where', args });
      }
      return builder;
    },
    andWhere(...args) {
      calls.push({ type: 'andWhere', args });
      return builder;
    },
    orWhere(...args) {
      if (typeof args[0] === 'function') {
        const nested = createWhereCollector();
        args[0].call(nested.builder);
        calls.push({ type: 'orWhereNested', calls: nested.calls });
      } else {
        calls.push({ type: 'orWhere', args });
      }
      return builder;
    },
  };

  return { builder, calls };
};

const createQueryBuilder = function ({ rows } = {}) {
  const calls = {
    join: [],
    select: [],
    whereNotNull: [],
    where: [],
    whereNested: [],
    orderBy: [],
    limit: [],
  };

  const builder = {
    join(...args) {
      calls.join.push(args);
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
    where(...args) {
      if (typeof args[0] === 'function') {
        const nested = createWhereCollector();
        args[0].call(nested.builder);
        calls.whereNested.push(nested.calls);
      } else {
        calls.where.push(args);
      }
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
  const knex = function (table) {
    if (table === 'publications as p') return builder;
    throw new Error(`Unexpected table "${table}".`);
  };
  return { knex, calls };
};

const buildRow = function ({
  id = 1,
  sourceCode = 'habr',
  sourceName = 'Habr',
  sourceUrl = 'https://habr.com',
  title = 'Title',
  publicationUrl = 'https://habr.com/1',
  publishedAt = '2025-01-01T00:00:00.000Z',
  annotation = 'Annotation',
  overview = 'Overview',
  annotationEmbedding = [0.1, 0.2],
  overviewEmbedding = '[0.3, 0.4]'
} = {}) {
  return {
    id,
    source_code: sourceCode,
    source_name: sourceName,
    source_url: sourceUrl,
    title,
    publication_url: publicationUrl,
    published_at: publishedAt,
    annotation,
    overview,
    annotation_embedding: annotationEmbedding,
    overview_embedding: overviewEmbedding,
  };
};

const getApi = async function ({ rows } = {}) {
  const container = await createTestContainer();
  const { knex, calls } = createKnexStub({ rows });

  container.register('Mindstream_Back_Storage_Knex$', { get: () => knex });
  container.register('Mindstream_Shared_Logger$', buildLogger());
  container.register('Fl32_Web_Back_Helper_Respond$', { code200_Ok() {} });

  const api = await container.get('Mindstream_Back_Web_Api_FeedView$');
  return { api, calls };
};

test('Mindstream_Back_Web_Api_FeedView returns FeedView DTO structure', async () => {
  const rows = [
    buildRow({ id: 10, overviewEmbedding: '[0.5, 1.5]' }),
    buildRow({ id: 9, title: null, publicationUrl: 'https://habr.com/2' }),
  ];
  const { api } = await getApi({ rows });

  const result = await api.getFeedView();

  assert.ok(Array.isArray(result.sources));
  assert.ok(Array.isArray(result.items));
  assert.equal(result.items.length, 2);
  assert.equal(result.sources.length, 1);
  assert.ok(result.cursor);
  assert.equal(result.cursor.id, 9);

  const item = result.items[0];
  assert.deepEqual(
    Object.keys(item).sort(),
    ['annotation', 'embeddings', 'id', 'overview', 'publishedAt', 'sourceCode', 'title', 'url'].sort()
  );
  assert.ok(Array.isArray(item.embeddings.annotation));
  assert.ok(Array.isArray(item.embeddings.overview));
  assert.ok(item.embeddings.annotation.every(Number.isFinite));
  assert.ok(item.embeddings.overview.every(Number.isFinite));
});

test('Mindstream_Back_Web_Api_FeedView enforces feed filters in query', async () => {
  const { api, calls } = await getApi({ rows: [buildRow()] });

  await api.getFeedView();

  const joins = calls.join.map((args) => args[0]);
  assert.ok(joins.includes('publication_summaries as s'));
  assert.ok(joins.includes('publication_embeddings as e'));
  assert.ok(joins.includes('publication_sources as src'));

  const notNullColumns = calls.whereNotNull.map((args) => args[0]).sort();
  assert.deepEqual(notNullColumns, [
    'e.annotation_embedding',
    'e.overview_embedding',
    'p.rss_published_at',
    's.annotation',
    's.overview',
  ].sort());
});

test('Mindstream_Back_Web_Api_FeedView applies sorting and cursor filter', async () => {
  const rows = [buildRow({ id: 5 })];
  const { api, calls } = await getApi({ rows });

  await api.getFeedView({
    cursor: {
      publishedAt: '2025-01-02T00:00:00.000Z',
      id: 100,
    },
  });

  assert.deepEqual(calls.orderBy, [
    ['p.rss_published_at', 'desc'],
    ['p.id', 'desc'],
  ]);

  assert.equal(calls.whereNested.length, 1);
  const cursorGroup = calls.whereNested[0];
  assert.deepEqual(cursorGroup[0], {
    type: 'where',
    args: ['p.rss_published_at', '<', '2025-01-02T00:00:00.000Z'],
  });
  assert.deepEqual(cursorGroup[1].type, 'orWhereNested');
  assert.deepEqual(cursorGroup[1].calls[0], {
    type: 'where',
    args: ['p.rss_published_at', '=', '2025-01-02T00:00:00.000Z'],
  });
  assert.deepEqual(cursorGroup[1].calls[1], {
    type: 'andWhere',
    args: ['p.id', '<', 100],
  });
});

test('Mindstream_Back_Web_Api_FeedView omits cursor on empty results', async () => {
  const { api } = await getApi({ rows: [] });

  const result = await api.getFeedView();

  assert.deepEqual(result, { sources: [], items: [] });
});

test('Mindstream_Back_Web_Api_FeedView never returns more than 50 items', async () => {
  const rows = Array.from({ length: 60 }, (_, index) => buildRow({ id: 60 - index }));
  const { api } = await getApi({ rows });

  const result = await api.getFeedView();

  assert.equal(result.items.length, 50);
});
