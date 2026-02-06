import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

const buildLogger = function () {
  const calls = [];
  return {
    calls,
    info(namespace, message) {
      calls.push({ namespace, message });
    },
    debug() {},
    warn() {},
    error() {},
    exception() {},
  };
};

test('Mindstream_Back_Runtime_Web_HandlerRegistry registers handlers', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  const calls = [];
  const handlers = [{ name: 'first' }, { name: 'second' }];

  container.register('Mindstream_Shared_Logger$', logger);
  container.register('Fl32_Web_Back_Dispatcher$', {
    addHandler(handler) {
      calls.push(handler);
    },
  });
  container.register('Mindstream_Back_Runtime_Web_HandlerList$', {
    get() {
      return handlers;
    },
  });

  const registry = await container.get('Mindstream_Back_Runtime_Web_HandlerRegistry$');
  await registry.register();

  assert.deepEqual(calls, handlers);
  assert.equal(logger.calls.length, 1);
  assert.match(logger.calls[0].message, /Registered 2 HTTP handler/);
});

test('Mindstream_Back_Runtime_Web_HandlerRegistry rejects non-array handler list', async () => {
  const container = await createTestContainer();

  container.register('Fl32_Web_Back_Dispatcher$', {
    addHandler() {},
  });
  container.register('Mindstream_Back_Runtime_Web_HandlerList$', {
    get() {
      return 'invalid';
    },
  });

  const registry = await container.get('Mindstream_Back_Runtime_Web_HandlerRegistry$');

  await assert.rejects(() => registry.register(), /handler list must be an array/);
});
