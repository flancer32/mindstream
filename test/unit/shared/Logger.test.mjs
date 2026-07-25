import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../di-node.mjs';

test('Mindstream_Shared_Logger delegates structured records to @teqfw/log', async () => {
  const calls = [];
  const provider = {
    forSource(source) {
      return {
        debug: (message, data) => calls.push({ level: 'debug', source, message, data }),
        info: (message, data) => calls.push({ level: 'info', source, message, data }),
        warn: (message, data) => calls.push({ level: 'warn', source, message, data }),
        error: (message, data) => calls.push({ level: 'error', source, message, data }),
      };
    },
  };
  const container = await createTestContainer();
  container.register('TeqFw_Log_Provider$', provider);
  const logger = await container.get('Mindstream_Shared_Logger$');

  logger.info('Mindstream_Back_Test', 'Completed');
  const error = new Error('Failed');
  logger.exception('Mindstream_Back_Test', error);

  assert.deepEqual(calls[0], { level: 'info', source: 'Mindstream_Back_Test', message: 'Completed', data: undefined });
  assert.equal(calls[1].level, 'error');
  assert.equal(calls[1].source, 'Mindstream_Back_Test');
  assert.equal(calls[1].data.err, error);
});
