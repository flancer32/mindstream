import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../../di-node.mjs';

const buildResponse = function () {
  return {
    headersSent: false,
    writableEnded: false,
    writeHead() {},
    end() {},
  };
};

test('Mindstream_Back_Web_Handler returns false for non-api path', async () => {
  const container = await createTestContainer();

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
  const result = await handler.handle({ url: '/non-api/path' }, buildResponse());

  assert.equal(result, false);
});

test('Mindstream_Back_Web_Handler uses fallback for unknown endpoint', async () => {
  const container = await createTestContainer();
  const calls = [];

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
  const result = await handler.handle({ url: '/api/unknown?x=1' }, buildResponse());

  assert.equal(result, true);
  assert.deepEqual(calls, ['/unknown']);
});

test('Mindstream_Back_Web_Handler dispatches to endpoint handler', async () => {
  const container = await createTestContainer();
  const calls = [];

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
  const result = await handler.handle({ url: '/api/attention' }, buildResponse());

  assert.equal(result, true);
  assert.deepEqual(calls, ['/attention']);
});
