import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const modulePath = path.resolve('web/ui/js/attention.mjs');

const createStorage = () => {
  const data = new Map();
  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    _dump() {
      return new Map(data);
    },
  };
};

const loadModule = async () => {
  const url = pathToFileURL(modulePath);
  url.searchParams.set('t', `${Date.now()}-${Math.random()}`);
  return import(url.href);
};

test('init restores stored vector and history', async () => {
  const storage = createStorage();
  globalThis.localStorage = storage;
  const attention = await loadModule();
  const { STORAGE_VECTOR_KEY, STORAGE_HISTORY_KEY } = attention._testing._keys;

  const storedVector = [1, 0, 0];
  storage.setItem(STORAGE_VECTOR_KEY, JSON.stringify({ dim: 3, vector: storedVector }));
  storage.setItem(
    STORAGE_HISTORY_KEY,
    JSON.stringify([{ type: 'overview_open', pubId: 12 }])
  );

  attention.init({ dim: 3 });

  await attention.recordAttention({ type: 'overview_open', pubId: 12 }, [1, 0, 0], {});

  const storedHistory = JSON.parse(storage.getItem(STORAGE_HISTORY_KEY));
  assert.equal(storedHistory.length, 1);
});

test('init resets when storage is corrupted', async () => {
  const storage = createStorage();
  globalThis.localStorage = storage;
  const attention = await loadModule();
  const { STORAGE_VECTOR_KEY, STORAGE_HISTORY_KEY } = attention._testing._keys;

  storage.setItem(STORAGE_VECTOR_KEY, '{bad json');
  storage.setItem(STORAGE_HISTORY_KEY, 'not-array');

  attention.init({ dim: 2 });

  const rawVector = storage.getItem(STORAGE_VECTOR_KEY);
  assert.ok(rawVector);
  const parsed = JSON.parse(rawVector);
  assert.equal(parsed.dim, 2);
  assert.deepEqual(parsed.vector, [0, 0]);
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_HISTORY_KEY)), []);
});

test('recordAttention updates vector, stores state, and recalculates scores', async () => {
  const storage = createStorage();
  globalThis.localStorage = storage;
  const attention = await loadModule();
  const { STORAGE_VECTOR_KEY, STORAGE_HISTORY_KEY } = attention._testing._keys;

  attention.init({ dim: 3 });

  const visible = [{ pubId: 7, embedding: [1, 0, 0] }];
  await attention.recordAttention(
    { type: 'overview_open', pubId: 7 },
    [1, 0, 0],
    { visiblePublications: visible }
  );

  const storedVector = JSON.parse(storage.getItem(STORAGE_VECTOR_KEY));
  assert.equal(storedVector.dim, 3);
  const magnitude = Math.hypot(...storedVector.vector);
  assert.ok(Math.abs(magnitude - 1) < 1e-6);
  assert.equal(storedVector.vector[0] > 0, true);

  const storedHistory = JSON.parse(storage.getItem(STORAGE_HISTORY_KEY));
  assert.equal(storedHistory.length, 1);

  const score = attention.getScore(7);
  assert.ok(score !== null);
});

test('deduplication ignores repeated overview and source clicks', async () => {
  const storage = createStorage();
  globalThis.localStorage = storage;
  const attention = await loadModule();
  const { STORAGE_HISTORY_KEY } = attention._testing._keys;

  attention.init({ dim: 2 });
  await attention.recordAttention({ type: 'overview_open', pubId: 1 }, [1, 0], {});
  await attention.recordAttention({ type: 'overview_open', pubId: 1 }, [1, 0], {});
  await attention.recordAttention({ type: 'source_click', pubId: 1 }, [1, 0], {});
  await attention.recordAttention({ type: 'source_click', pubId: 1 }, [1, 0], {});
  await attention.recordAttention({ type: 'overview_open', pubId: 1 }, [1, 0], {});

  const storedHistory = JSON.parse(storage.getItem(STORAGE_HISTORY_KEY));
  assert.equal(storedHistory.length, 2);
  assert.equal(storedHistory[0].type, 'overview_open');
  assert.equal(storedHistory[1].type, 'source_click_after_overview');
});

test('scorePublication returns [0..1] range', async () => {
  const storage = createStorage();
  globalThis.localStorage = storage;
  const attention = await loadModule();

  attention.init({ dim: 2 });
  const score = attention.scorePublication([1, 0]);
  assert.ok(score >= 0 && score <= 1);
});

test('rankPublications sorts and filters with minScore', async () => {
  const storage = createStorage();
  globalThis.localStorage = storage;
  const attention = await loadModule();

  attention.init({ dim: 2 });
  await attention.recordAttention({ type: 'overview_open', pubId: 1 }, [1, 0], {});

  const list = [
    { pubId: 1, embedding: [1, 0] },
    { pubId: 2, embedding: [0, 1] },
  ];

  const ranked = attention.rankPublications(list, { minScore: 0.6 });
  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].pubId, 1);
});

test('reset clears vector, cache, history, and storage', async () => {
  const storage = createStorage();
  globalThis.localStorage = storage;
  const attention = await loadModule();
  const { STORAGE_VECTOR_KEY, STORAGE_HISTORY_KEY } = attention._testing._keys;

  attention.init({ dim: 2 });
  await attention.recordAttention({ type: 'overview_open', pubId: 1 }, [1, 0], {});
  attention.reset();

  const storedVector = JSON.parse(storage.getItem(STORAGE_VECTOR_KEY));
  assert.deepEqual(storedVector.vector, [0, 0]);
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_HISTORY_KEY)), []);
  assert.equal(attention.getScores().size, 0);
});
