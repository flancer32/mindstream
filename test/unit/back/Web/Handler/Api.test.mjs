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

test('Mindstream_Back_Web_Handler_Api returns false for non-api path', async () => {
  const container = await createTestContainer();

  container.register('Mindstream_Back_Web_Api_Dispatcher$', {
    resolve() {
      throw new Error('Dispatcher should not be called.');
    },
  });
  container.register('Mindstream_Back_Web_Api_Handler_Fallback$', {
    async handle() {
      throw new Error('Fallback should not be called.');
    },
  });

  const handler = await container.get('Mindstream_Back_Web_Handler_Api$');
  const result = await handler.handle({ url: '/non-api/path' }, buildResponse());

  assert.equal(result, false);
});

test('Mindstream_Back_Web_Handler_Api uses fallback for unknown endpoint', async () => {
  const container = await createTestContainer();
  const calls = [];

  container.register('Mindstream_Back_Web_Api_Dispatcher$', {
    resolve() {
      return undefined;
    },
  });
  container.register('Mindstream_Back_Web_Api_Handler_Fallback$', {
    async handle({ path }) {
      calls.push(path);
      return true;
    },
  });

  const handler = await container.get('Mindstream_Back_Web_Handler_Api$');
  const result = await handler.handle({ url: '/api/unknown?x=1' }, buildResponse());

  assert.equal(result, true);
  assert.deepEqual(calls, ['/unknown']);
});

test('Mindstream_Back_Web_Handler_Api dispatches to endpoint handler', async () => {
  const container = await createTestContainer();
  const calls = [];

  const endpoint = {
    async handle({ path }) {
      calls.push(path);
      return true;
    },
  };

  container.register('Mindstream_Back_Web_Api_Dispatcher$', {
    resolve(path) {
      if (path === '/known') return endpoint;
      return undefined;
    },
  });
  container.register('Mindstream_Back_Web_Api_Handler_Fallback$', {
    async handle() {
      throw new Error('Fallback should not be used.');
    },
  });

  const handler = await container.get('Mindstream_Back_Web_Handler_Api$');
  const result = await handler.handle({ url: '/api/known' }, buildResponse());

  assert.equal(result, true);
  assert.deepEqual(calls, ['/known']);
});
