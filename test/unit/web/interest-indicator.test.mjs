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

test('resolveTopInterestRange excludes top 10% from threshold calculation', async () => {
  const indicator = await loadModule();

  const result = indicator.resolveTopInterestRange([
    { pubId: 1, score: 0.69 },
    { pubId: 2, score: 0.75 },
    { pubId: 3, score: 0.794 },
    { pubId: 4, score: 0.82 },
  ]);

  // cutoff = 0.69 + (0.82 - 0.69) * 0.9 = 0.807
  // remaining: [0.69, 0.75, 0.794]
  // markThreshold = 0.69 + (0.794 - 0.69) * 0.8 = 0.7732
  assert.ok(Math.abs(result.threshold - 0.7732) < 1e-12);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), [3, 4]);
});

test('resolveTopInterestRange marks all entries when min equals max', async () => {
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

test('resolveTopInterestRange excludes top 10% outlier and lowers threshold', async () => {
  const indicator = await loadModule();

  const result = indicator.resolveTopInterestRange([
    { pubId: 21, score: 0.1 },
    { pubId: 22, score: 0.5 },
    { pubId: 23, score: 0.9 },
    { pubId: 24, score: 0.74 },
  ]);

  // cutoff = 0.1 + (0.9 - 0.1) * 0.9 = 0.82
  // remaining: [0.1, 0.5, 0.74]  (0.9 excluded)
  // markThreshold = 0.1 + (0.74 - 0.1) * 0.8 = 0.612
  assert.ok(Math.abs(result.threshold - 0.612) < 1e-12);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), [23, 24]);
});

test('resolveTopInterestRange prevents single click outlier from skewing the threshold', async () => {
  const indicator = await loadModule();

  // After a click, one item jumps to 0.99 while others stay low
  const result = indicator.resolveTopInterestRange([
    { pubId: 31, score: 0.1 },
    { pubId: 32, score: 0.2 },
    { pubId: 33, score: 0.3 },
    { pubId: 34, score: 0.4 },
    { pubId: 35, score: 0.5 },
    { pubId: 36, score: 0.99 },
  ]);

  // cutoff = 0.1 + (0.99 - 0.1) * 0.9 = 0.901
  // remaining: [0.1, 0.2, 0.3, 0.4, 0.5]  (0.99 excluded)
  // markThreshold = 0.1 + (0.5 - 0.1) * 0.8 = 0.42
  assert.ok(Math.abs(result.threshold - 0.42) < 1e-12);
  // Both the outlier (0.99) and items above 0.42 (0.5) get marked
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), [35, 36]);
});
