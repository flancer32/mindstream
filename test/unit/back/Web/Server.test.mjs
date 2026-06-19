import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

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

test('Mindstream_Back_Web_Server registers api handler and starts once', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  const calls = [];

  container.register('Mindstream_Shared_Logger$', logger);
  container.register('Mindstream_Back_App_Configuration$', {
    get() {
      return { server: { port: 3001, type: 'http2' } };
    },
  });
  container.register('Fl32_Web_Back_PipelineEngine$', {
    addHandler(handler) {
      calls.push({ type: 'add', handler });
    },
  });
  container.register('Fl32_Web_Back_Server$', {
    async start(cfg) {
      calls.push({ type: 'start', cfg });
    },
  });
  container.register('Fl32_Web_Back_Config_Runtime__Factory$', {
    configure(payload) {
      calls.push({ type: 'configure', payload });
    },
    freeze() {
      return { port: 3001, type: 'http2' };
    },
  });
  const apiHandler = { name: 'api-handler' };
  container.register('Mindstream_Back_Web_Handler$', apiHandler);

  const server = await container.get('Mindstream_Back_Web_Server$');
  await server.start();

  assert.deepEqual(calls, [
    { type: 'add', handler: apiHandler },
    { type: 'configure', payload: { port: 3001, type: 'http2' } },
    { type: 'start', cfg: { port: 3001, type: 'http2' } },
  ]);
  assert.equal(logger.calls.length, 1);

  await assert.rejects(() => server.start(), /already started/);
});


test('Mindstream_Back_Web_Server exposes wait promise', async () => {
  const container = await createTestContainer();

  container.register('Mindstream_Back_App_Configuration$', {
    get() {
      return { server: { port: 3001 } };
    },
  });
  container.register('Fl32_Web_Back_PipelineEngine$', {
    addHandler() {},
  });
  container.register('Fl32_Web_Back_Server$', {
    async start() {},
  });
  container.register('Fl32_Web_Back_Config_Runtime__Factory$', {
    configure() {},
    freeze() {
      return { port: 3001 };
    },
  });
  container.register('Mindstream_Back_Web_Handler$', {});

  const server = await container.get('Mindstream_Back_Web_Server$');
  const waitPromise = server.wait();

  assert.ok(waitPromise instanceof Promise);
});
