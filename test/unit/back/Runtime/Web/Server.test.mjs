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

test('Mindstream_Back_Runtime_Web_Server starts once with config', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  const calls = [];
  const createdConfigs = [];

  container.register('Mindstream_Shared_Logger$', logger);
  container.register('Mindstream_Back_App_Configuration$', {
    get() {
      return { server: { port: 4567 } };
    },
  });
  container.register('Fl32_Web_Back_Server$', {
    async start(cfg) {
      calls.push(cfg);
    },
  });
  container.register('Fl32_Web_Back_Server_Config$', {
    create(payload) {
      createdConfigs.push(payload);
      return { ...payload };
    },
  });
  container.register('Mindstream_Back_Runtime_Web_HandlerRegistry$', {
    async register() {
      calls.push('register');
    },
  });

  const server = await container.get('Mindstream_Back_Runtime_Web_Server$');
  await server.start();

  assert.deepEqual(createdConfigs, [{ port: 4567 }]);
  assert.deepEqual(calls, ['register', { port: 4567 }]);
  assert.equal(logger.calls.length, 1);

  await assert.rejects(() => server.start(), /already started/);
});

test('Mindstream_Back_Runtime_Web_Server requires handler registry', async () => {
  const container = await createTestContainer();

  container.register('Mindstream_Back_App_Configuration$', {
    get() {
      return { server: { port: 1234 } };
    },
  });
  container.register('Fl32_Web_Back_Server$', {
    async start() {},
  });
  container.register('Fl32_Web_Back_Server_Config$', {
    create(payload) {
      return payload;
    },
  });
  container.register('Mindstream_Back_Runtime_Web_HandlerRegistry$', {});

  const server = await container.get('Mindstream_Back_Runtime_Web_Server$');

  await assert.rejects(() => server.start(), /handler registry is unavailable/);
});

test('Mindstream_Back_Runtime_Web_Server exposes wait promise', async () => {
  const container = await createTestContainer();

  container.register('Mindstream_Back_App_Configuration$', {
    get() {
      return { server: { port: 1234 } };
    },
  });
  container.register('Fl32_Web_Back_Server$', {
    async start() {},
  });
  container.register('Fl32_Web_Back_Server_Config$', {
    create(payload) {
      return payload;
    },
  });
  container.register('Mindstream_Back_Runtime_Web_HandlerRegistry$', {
    async register() {},
  });

  const server = await container.get('Mindstream_Back_Runtime_Web_Server$');

  const waitPromise = server.wait();
  assert.ok(waitPromise instanceof Promise);
});
