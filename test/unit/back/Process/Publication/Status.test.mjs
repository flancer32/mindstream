import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

test('Mindstream_Back_Process_Publication_Status exposes summary statuses', async () => {
  const container = await createTestContainer();
  const status = await container.get('Mindstream_Back_Process_Publication_Status$');

  assert.equal(status.SUMMARY_FAILED, 'summary_failed');
  assert.equal(status.SUMMARY_READY, 'summary_ready');
  assert.ok(Array.isArray(status.list));
  assert.ok(status.list.includes('summary_failed'));
  assert.ok(status.list.includes('summary_ready'));
});
