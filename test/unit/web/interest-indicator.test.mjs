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

test('resolveTopInterestRangeManual marks items above absolute score threshold', async () => {
  const indicator = await loadModule();

  // 80% means absolute threshold 0.8
  const result = indicator.resolveTopInterestRangeManual([
    { pubId: 41, score: 0.1 },
    { pubId: 42, score: 0.5 },
    { pubId: 43, score: 0.8 },
    { pubId: 44, score: 0.9 },
  ], 80);

  assert.ok(Math.abs(result.threshold - 0.8) < 1e-12);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), [43, 44]);
});

test('resolveTopInterestRangeManual with threshold=0 marks all entries', async () => {
  const indicator = await loadModule();

  const result = indicator.resolveTopInterestRangeManual([
    { pubId: 51, score: 0.1 },
    { pubId: 52, score: 0.5 },
    { pubId: 53, score: 0.9 },
  ], 0);

  assert.equal(result.threshold, 0);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), [51, 52, 53]);
});

test('resolveTopInterestRangeManual with threshold=100 marks no entries below 100%', async () => {
  const indicator = await loadModule();

  const result = indicator.resolveTopInterestRangeManual([
    { pubId: 61, score: 0.1 },
    { pubId: 62, score: 0.5 },
    { pubId: 63, score: 0.9 },
  ], 100);

  assert.equal(result.threshold, 1);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), []);
});

test('resolveTopInterestRangeManual keeps absolute threshold for degenerate range', async () => {
  const indicator = await loadModule();

  const result = indicator.resolveTopInterestRangeManual([
    { pubId: 71, score: 0.5 },
    { pubId: 72, score: 0.5 },
  ], 60);

  assert.equal(result.threshold, 0.6);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), []);
});

test('resolveTopInterestRangeManual clamps threshold to 0..100', async () => {
  const indicator = await loadModule();

  const over = indicator.resolveTopInterestRangeManual([
    { pubId: 81, score: 0.2 },
    { pubId: 82, score: 0.8 },
  ], 150);

  assert.equal(over.threshold, 1);
  assert.deepEqual(Array.from(over.topIds), []);

  const under = indicator.resolveTopInterestRangeManual([
    { pubId: 83, score: 0.2 },
    { pubId: 84, score: 0.8 },
  ], -10);

  assert.equal(under.threshold, 0);
  assert.deepEqual(Array.from(under.topIds).sort((a, b) => a - b), [83, 84]);
});

test('resolveTopInterestRangeManual correlates directly with visible indicator numbers', async () => {
  const indicator = await loadModule();

  const result = indicator.resolveTopInterestRangeManual([
    { pubId: 91, score: 0.71 },
    { pubId: 92, score: 0.73 },
  ], 72);

  assert.equal(result.threshold, 0.72);
  assert.deepEqual(Array.from(result.topIds).sort((a, b) => a - b), [92]);
});
