import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

const buildContext = function ({
  url = '/',
  method = 'GET',
  headers,
  remoteAddress,
} = {}) {
  return {
    request: {
      url,
      method,
      headers,
      socket: { remoteAddress },
    },
    response: {
      headersSent: false,
      writableEnded: false,
      writeHead() {},
      end() {},
    },
    completed: false,
  };
};

const buildLogger = function () {
  const calls = [];
  return {
    calls,
    info(namespace, message, data) {
      calls.push({ namespace, message, data });
    },
  };
};

test('Mindstream_Back_Web_Handler returns false for non-api path', async () => {
  const container = await createTestContainer();
  const logger = buildLogger();
  container.register('Mindstream_Back_Logger$', logger);

  container.register('Mindstream_Back_Web_Api_Attention$', {
    async handle() {
      throw new Error('Attention handler should not be called.');
    },
  });
  container.register('Mindstream_Back_Web_Api_Identity$', {
    async handle() {
      throw new Error('Identity handler should not be called.');
    },
  });
  container.register('Mindstream_Back_Web_Api_FeedView$', {
    async handle() {
      throw new Error('Feed handler should not be called.');
    },
  });
  container.register('Mindstream_Back_Web_Api_Fallback$', {
    async handle() {
      throw new Error('Fallback should not be called.');
    },
  });

  const handler = await container.get('Mindstream_Back_Web_Handler$');
  const ctx = buildContext({ url: '/non-api/path' });
  const result = await handler.handle(ctx);

  assert.equal(result, undefined);
  assert.deepEqual(logger.calls, []);
});

test('Mindstream_Back_Web_Handler uses fallback for unknown endpoint', async () => {
  const container = await createTestContainer();
  const calls = [];
  const logger = buildLogger();

  container.register('Mindstream_Back_Logger$', logger);

  container.register('Mindstream_Back_Web_Api_Attention$', {});
  container.register('Mindstream_Back_Web_Api_Identity$', {});
  container.register('Mindstream_Back_Web_Api_FeedView$', {});
  container.register('Mindstream_Back_Web_Api_Fallback$', {
    async handle({ path }) {
      calls.push(path);
      return true;
    },
  });

  const handler = await container.get('Mindstream_Back_Web_Handler$');
  const ctx = buildContext({
    url: '/api/unknown?x=1',
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.2' },
  });
  await handler.handle(ctx);

  assert.deepEqual(calls, ['/unknown']);
  assert.equal(ctx.completed, true);
  assert.deepEqual(logger.calls, [{
    namespace: 'Mindstream_Back_Web_Handler',
    message: 'API request received.',
    data: { method: 'POST', path: '/unknown', clientIp: '203.0.113.10' },
  }]);
});

test('Mindstream_Back_Web_Handler dispatches to endpoint handler', async () => {
  const container = await createTestContainer();
  const calls = [];
  const logger = buildLogger();

  container.register('Mindstream_Back_Logger$', logger);

  const attentionHandler = {
    async handle({ path }) {
      calls.push(path);
      return true;
    },
  };

  container.register('Mindstream_Back_Web_Api_Attention$', attentionHandler);
  container.register('Mindstream_Back_Web_Api_Identity$', {});
  container.register('Mindstream_Back_Web_Api_FeedView$', {});
  container.register('Mindstream_Back_Web_Api_Fallback$', {
    async handle() {
      throw new Error('Fallback should not be used.');
    },
  });

  const handler = await container.get('Mindstream_Back_Web_Handler$');
  const ctx = buildContext({ url: '/api/attention', remoteAddress: '2001:db8::1' });
  await handler.handle(ctx);

  assert.deepEqual(calls, ['/attention']);
  assert.equal(ctx.completed, true);
  assert.deepEqual(logger.calls[0]?.data, {
    method: 'GET', path: '/attention', clientIp: '2001:db8::1',
  });
});
