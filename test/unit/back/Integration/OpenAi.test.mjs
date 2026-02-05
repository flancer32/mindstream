import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

const createResponse = function ({ ok = true, status = 200, payload = null } = {}) {
  return {
    ok,
    status,
    async text() {
      if (payload === null) return '';
      return JSON.stringify(payload);
    },
  };
};

const setup = async function ({ response, fetchError, configOverride } = {}) {
  const container = await createTestContainer();
  const calls = [];
  const exceptions = [];

  const fetchStub = {
    async fetch(url, options) {
      calls.push({ url, options });
      if (fetchError) {
        throw fetchError;
      }
      return response ?? createResponse({ payload: { id: 'ok' } });
    },
  };

  const loggerStub = {
    exception(namespace, error) {
      exceptions.push({ namespace, error });
    },
  };

  const configService = {
    get() {
      return (
        configOverride ?? {
          llm: {
            apiKey: 'key-123',
            baseUrl: 'https://api.test/v1/',
            model: 'model-x',
          },
        }
      );
    },
  };

  container.register('Mindstream_Back_Platform_Fetch$', fetchStub);
  container.register('Mindstream_Shared_Logger$', loggerStub);
  container.register('Mindstream_Back_App_Configuration$', configService);

  const client = await container.get('Mindstream_Back_Integration_OpenAi$');

  return { client, calls, exceptions };
};

test('Mindstream_Back_Integration_OpenAi summarizes via responses endpoint', async () => {
  const { client, calls } = await setup({
    response: createResponse({ payload: { id: 'summary' } }),
  });

  const result = await client.summarize('hello');
  assert.deepEqual(result, { id: 'summary' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.test/v1/responses');

  const payload = JSON.parse(calls[0].options.body);
  assert.equal(payload.model, 'model-x');
  assert.equal(payload.input, 'hello');
});

test('Mindstream_Back_Integration_OpenAi requests embeddings', async () => {
  const { client, calls } = await setup({
    response: createResponse({ payload: { data: [{ embedding: [0.1] }] } }),
  });

  const result = await client.embed(['a', 'b']);
  assert.deepEqual(result, { data: [{ embedding: [0.1] }] });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.test/v1/embeddings');

  const payload = JSON.parse(calls[0].options.body);
  assert.equal(payload.model, 'model-x');
  assert.deepEqual(payload.input, ['a', 'b']);
});

test('Mindstream_Back_Integration_OpenAi logs and rethrows errors', async () => {
  const errorResponse = createResponse({
    ok: false,
    status: 401,
    payload: { error: { message: 'Unauthorized' } },
  });
  const { client, exceptions } = await setup({ response: errorResponse });

  await assert.rejects(() => client.summarize('fail'), /OpenAI request failed/);
  assert.equal(exceptions.length, 1);
  assert.equal(exceptions[0].namespace, 'Mindstream_Back_Integration_OpenAi');
  assert.ok(exceptions[0].error instanceof Error);
});
