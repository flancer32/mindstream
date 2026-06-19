import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const modulePath = path.resolve('web/ui/js/interest-indicator.mjs');

const loadModule = async () => {
  const url = pathToFileURL(modulePath);
  url.searchParams.set('t', `${Date.now()}-${Math.random()}`);
  return import(url.href);
};

test('resolveTopInterestRange selects entries in the top 20 percent of the visible range', async () => {
  const indicator = await loadModule();

  const result = indicator.resolveTopInterestRange([
    { pubId: 1, score: 0.69 },
    { pubId: 2, score: 0.75 },
    { pubId: 3, score: 0.794 },
    { pubId: 4, score: 0.82 },
  ]);

  assert.ok(Math.abs(result.threshold - 0.794) < 1e-12);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), [3, 4]);
});

test('resolveTopInterestRange marks all visible entries when min equals max', async () => {
  const indicator = await loadModule();

  const result = indicator.resolveTopInterestRange([
    { pubId: 11, score: 0.5 },
    { pubId: 12, score: 0.5 },
    { pubId: 13, score: 0.5 },
  ]);

  assert.equal(result.min, 0.5);
  assert.equal(result.max, 0.5);
  assert.equal(result.threshold, 0.5);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), [11, 12, 13]);
});

test('resolveTopInterestRange includes a score exactly on the threshold', async () => {
  const indicator = await loadModule();

  const result = indicator.resolveTopInterestRange([
    { pubId: 21, score: 0.1 },
    { pubId: 22, score: 0.5 },
    { pubId: 23, score: 0.9 },
    { pubId: 24, score: 0.74 },
  ]);

  assert.ok(Math.abs(result.threshold - 0.74) < 1e-12);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), [23, 24]);
});
