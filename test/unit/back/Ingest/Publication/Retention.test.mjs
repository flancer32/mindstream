import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('retention expires at the 100-day boundary and falls back to discovery time', async () => {
  const container = await createTestContainer();
  const retention = await container.get('Mindstream_Back_Ingest_Publication_Retention$');
  const now = new Date('2026-11-24T00:00:00.000Z');

  assert.equal(retention.getCutoff({now}), '2026-08-16T00:00:00.000000Z');
  assert.equal(retention.isExpired({publishedAt: '2026-08-15T23:59:59.999Z', now}), true);
  assert.equal(retention.isExpired({publishedAt: '2026-08-16T00:00:00.000Z', now}), true);
  assert.equal(retention.isExpired({publishedAt: '2026-08-16T00:00:00.001Z', now}), false);
  assert.equal(retention.isExpired({discoveredAt: '2026-08-15T00:00:00.000Z', now}), true);
  assert.equal(retention.isExpired({discoveredAt: '2026-08-16T00:00:00.001Z', now}), false);
});
