import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const modulePath = path.resolve('web/ui/js/interest-filter.mjs');

const loadPolicy = async () => {
  const url = pathToFileURL(modulePath);
  url.searchParams.set('t', `${Date.now()}-${Math.random()}`);
  const { default: InterestFilter, defaults } = await import(url.href);
  return { policy: new InterestFilter(), defaults };
};

test('filter defaults to enabled without owning a threshold', async () => {
  const { policy, defaults } = await loadPolicy();

  assert.deepEqual(defaults, { enabled: true });
  assert.deepEqual(policy.normalizeSettings(), defaults);
});

test('disabled filter and absent profile keep every publication visible', async () => {
  const { policy } = await loadPolicy();

  assert.equal(policy.shouldShowPublication({ score: 0, enabled: false, thresholdPercent: 100, hasInterestProfile: true }), true);
  assert.equal(policy.shouldShowPublication({ score: 0, enabled: true, thresholdPercent: 100, hasInterestProfile: false }), true);
});

test('filter uses an inclusive absolute threshold', async () => {
  const { policy } = await loadPolicy();
  const options = { enabled: true, thresholdPercent: 65, hasInterestProfile: true };

  assert.equal(policy.shouldShowPublication({ ...options, score: 0.64 }), false);
  assert.equal(policy.shouldShowPublication({ ...options, score: 0.65 }), true);
  assert.equal(policy.shouldShowPublication({ ...options, score: 0.66 }), true);
  assert.equal(policy.shouldShowPublication({ ...options, score: 0 }), false);
  assert.equal(policy.shouldShowPublication({ ...options, score: 1, thresholdPercent: 100 }), true);
});

test('filter settings normalize only the independent enabled flag', async () => {
  const { policy } = await loadPolicy();

  assert.deepEqual(policy.normalizeSettings({ enabled: 'yes', thresholdPercent: 'bad' }), {
    enabled: true,
  });
  assert.deepEqual(policy.normalizeSettings({ enabled: false, thresholdPercent: -3 }), {
    enabled: false,
  });
  assert.deepEqual(policy.normalizeSettings({ enabled: true, thresholdPercent: 180 }), {
    enabled: true,
  });
});
