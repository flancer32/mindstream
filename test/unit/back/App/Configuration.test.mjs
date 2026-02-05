import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

function createProcessMock(env = {}) {
  return { env: { ...env } };
}

test('Mindstream_Back_App_Configuration builds default structure from process.env', async () => {
  const container = await createTestContainer();
  const processMock = createProcessMock();

  container.register('node:process', processMock);

  const config = await container.get('Mindstream_Back_App_Configuration$');
  await config.init('/project');

  const value = config.get();

  assert.ok(Object.prototype.hasOwnProperty.call(value, 'server'));
  assert.ok(Object.prototype.hasOwnProperty.call(value, 'db'));
  assert.ok(Object.prototype.hasOwnProperty.call(value, 'llm'));
  assert.equal(value.server.port, 3000);
  assert.equal(value.db.client, '');
  assert.equal(value.db.host, '');
  assert.equal(value.db.port, 0);
  assert.equal(value.db.database, '');
  assert.equal(value.db.user, '');
  assert.equal(value.db.password, '');
  assert.equal(value.llm.apiKey, '');
  assert.equal(value.llm.baseUrl, 'https://api.openai.com/v1');
  assert.equal(value.llm.model, '');
});

test('Mindstream_Back_App_Configuration reads values from process.env', async () => {
  const container = await createTestContainer();
  const processMock = createProcessMock({
    SERVER_PORT: '8081',
    DB_CLIENT: 'pg',
    DB_HOST: 'db.local',
    DB_PORT: '5432',
    DB_DATABASE: 'mindstream',
    DB_USER: 'app',
    DB_PASSWORD: 'secret',
    LLM_API_KEY: 'env-key',
    LLM_BASE_URL: 'https://example.test/v1',
    LLM_MODEL: 'model-x',
  });

  container.register('node:process', processMock);

  const config = await container.get('Mindstream_Back_App_Configuration$');
  await config.init('/project');

  const value = config.get();

  assert.equal(value.server.port, 8081);
  assert.equal(value.db.client, 'pg');
  assert.equal(value.db.host, 'db.local');
  assert.equal(value.db.port, 5432);
  assert.equal(value.db.database, 'mindstream');
  assert.equal(value.db.user, 'app');
  assert.equal(value.db.password, 'secret');
  assert.equal(value.llm.apiKey, 'env-key');
  assert.equal(value.llm.baseUrl, 'https://example.test/v1');
  assert.equal(value.llm.model, 'model-x');
});

test('Mindstream_Back_App_Configuration returns a frozen configuration object', async () => {
  const container = await createTestContainer();
  const processMock = createProcessMock({ SERVER_PORT: '5050' });

  container.register('node:process', processMock);

  const config = await container.get('Mindstream_Back_App_Configuration$');
  await config.init('/project');

  const value = config.get();

  assert.equal(value.server.port, 5050);
  assert.equal(typeof value.server.port, 'number');
  assert.ok(Object.isFrozen(value));
  assert.ok(Object.isFrozen(value.server));
  assert.ok(Object.isFrozen(value.db));
  assert.ok(Object.isFrozen(value.llm));
});
