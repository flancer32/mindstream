import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../di-back.mjs';

function createProcessMock(env = {}) {
  return { env: { ...env } };
}

function createPathMock() {
  return {
    join: (...parts) => parts.join('/'),
  };
}

function createFsMock({ content, error } = {}) {
  return {
    readFile: async () => {
      if (error) throw error;
      return content ?? '';
    },
  };
}

test('Mindstream_Back_App_Configuration uses defaults without env or .env', async () => {
  const container = await createTestContainer();
  const processMock = createProcessMock();
  const pathMock = createPathMock();
  const fsError = Object.assign(new Error('missing .env'), { code: 'ENOENT' });
  const fsMock = createFsMock({ error: fsError });

  container.register('node:process', processMock);
  container.register('node:path', pathMock);
  container.register('node:fs/promises', fsMock);

  const config = await container.get('Mindstream_Back_App_Configuration$');
  await config.init('/project');

  assert.equal(config.getApiPort(), 3000);
  assert.equal(config.getOpenaiApiKey(), '');
  assert.equal(config.getOpenaiBaseUrl(), 'https://api.openai.com/v1');
  assert.equal(config.getOpenaiModel(), '');
});

test('Mindstream_Back_App_Configuration keeps process.env priority over .env', async () => {
  const container = await createTestContainer();
  const processMock = createProcessMock({
    API_PORT: '8081',
    OPENAI_API_KEY: 'env-key',
  });
  const pathMock = createPathMock();
  const fsMock = createFsMock({
    content: [
      'API_PORT=3001',
      'OPENAI_API_KEY=file-key',
      'OPENAI_MODEL=file-model',
    ].join('\n'),
  });

  container.register('node:process', processMock);
  container.register('node:path', pathMock);
  container.register('node:fs/promises', fsMock);

  const config = await container.get('Mindstream_Back_App_Configuration$');
  await config.init('/project');

  assert.equal(config.getApiPort(), 8081);
  assert.equal(config.getOpenaiApiKey(), 'env-key');
  assert.equal(config.getOpenaiModel(), 'file-model');
  assert.equal(processMock.env.API_PORT, '8081');
});

test('Mindstream_Back_App_Configuration coerces API_PORT to number', async () => {
  const container = await createTestContainer();
  const processMock = createProcessMock({ API_PORT: '5050' });
  const pathMock = createPathMock();
  const fsError = Object.assign(new Error('missing .env'), { code: 'ENOENT' });
  const fsMock = createFsMock({ error: fsError });

  container.register('node:process', processMock);
  container.register('node:path', pathMock);
  container.register('node:fs/promises', fsMock);

  const config = await container.get('Mindstream_Back_App_Configuration$');
  await config.init('/project');

  assert.equal(config.getApiPort(), 5050);
  assert.equal(typeof config.getApiPort(), 'number');
});
