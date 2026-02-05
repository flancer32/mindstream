import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';

import { createTestContainer } from '../../di-node.mjs';

function createProcessMock(env = {}) {
  return { env: { ...env } };
}

function createFsMock({ exists = false, content = '' } = {}) {
  let lastPath = null;
  return {
    existsSync(filePath) {
      lastPath = filePath;
      return exists;
    },
    readFileSync(filePath) {
      lastPath = filePath;
      if (!exists) {
        throw new Error('ENOENT');
      }
      return content;
    },
    getLastPath() {
      return lastPath;
    },
  };
}

function createLoggerMock() {
  return {
    exception() {},
  };
}

test('Mindstream_Back_App_Configuration builds structure from process.env only', async () => {
  const container = await createTestContainer();
  const processMock = createProcessMock();
  const fsMock = createFsMock({ exists: false });

  container.register('node:process', processMock);
  container.register('node:fs', fsMock);
  container.register('node:path', path);
  container.register('Mindstream_Shared_Logger$', createLoggerMock());

  const config = await container.get('Mindstream_Back_App_Configuration$');
  await config.init('/project');

  const value = config.get();

  assert.deepEqual(Object.keys(value).sort(), ['db', 'llm', 'server']);
  assert.deepEqual(Object.keys(value.server).sort(), ['port']);
  assert.deepEqual(Object.keys(value.db).sort(), ['client', 'database', 'host', 'password', 'port', 'user']);
  assert.deepEqual(Object.keys(value.llm).sort(), ['apiKey', 'baseUrl', 'model']);
  assert.equal(value.server.port, undefined);
  assert.equal(value.db.client, undefined);
  assert.equal(value.db.host, undefined);
  assert.equal(value.db.port, undefined);
  assert.equal(value.db.database, undefined);
  assert.equal(value.db.user, undefined);
  assert.equal(value.db.password, undefined);
  assert.equal(value.llm.apiKey, undefined);
  assert.equal(value.llm.baseUrl, undefined);
  assert.equal(value.llm.model, undefined);
});

test('Mindstream_Back_App_Configuration loads .env from project root and respects existing env', async () => {
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
  const envContent = [
    '# comment',
    'SERVER_PORT=9999',
    'DB_CLIENT = mysql',
    'DB_HOST= env-host',
    'DB_PORT= 3306',
    'DB_DATABASE = env-db',
    'DB_USER=env-user',
    'DB_PASSWORD=env-pass',
    'LLM_API_KEY=env-override',
    'LLM_BASE_URL= https://env.test/v1',
    'LLM_MODEL=env-model',
  ].join('\n');
  const fsMock = createFsMock({ exists: true, content: envContent });

  container.register('node:process', processMock);
  container.register('node:fs', fsMock);
  container.register('node:path', path);
  container.register('Mindstream_Shared_Logger$', createLoggerMock());

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
  assert.equal(processMock.env.SERVER_PORT, '8081');
  assert.equal(fsMock.getLastPath(), path.join('/project', '.env'));
});

test('Mindstream_Back_App_Configuration applies .env values when env is missing', async () => {
  const container = await createTestContainer();
  const processMock = createProcessMock();
  const envContent = [
    'SERVER_PORT = 7000',
    'DB_CLIENT=sqlite3',
    'DB_HOST = local',
    'DB_PORT= 7777',
    'DB_DATABASE= mindstream_local',
    'DB_USER = local-user',
    'DB_PASSWORD= local-pass',
    'LLM_API_KEY= key-123',
    'LLM_BASE_URL = https://llm.local/v1',
    'LLM_MODEL= local-model',
  ].join('\n');
  const fsMock = createFsMock({ exists: true, content: envContent });

  container.register('node:process', processMock);
  container.register('node:fs', fsMock);
  container.register('node:path', path);
  container.register('Mindstream_Shared_Logger$', createLoggerMock());

  const config = await container.get('Mindstream_Back_App_Configuration$');
  await config.init('/project');

  const value = config.get();

  assert.equal(value.server.port, 7000);
  assert.equal(value.db.client, 'sqlite3');
  assert.equal(value.db.host, 'local');
  assert.equal(value.db.port, 7777);
  assert.equal(value.db.database, 'mindstream_local');
  assert.equal(value.db.user, 'local-user');
  assert.equal(value.db.password, 'local-pass');
  assert.equal(value.llm.apiKey, 'key-123');
  assert.equal(value.llm.baseUrl, 'https://llm.local/v1');
  assert.equal(value.llm.model, 'local-model');
});

test('Mindstream_Back_App_Configuration ignores missing .env and returns a frozen configuration object', async () => {
  const container = await createTestContainer();
  const processMock = createProcessMock({ SERVER_PORT: '5050' });
  const fsMock = createFsMock({ exists: false });

  container.register('node:process', processMock);
  container.register('node:fs', fsMock);
  container.register('node:path', path);
  container.register('Mindstream_Shared_Logger$', createLoggerMock());

  const config = await container.get('Mindstream_Back_App_Configuration$');
  await config.init('/project');

  const value = config.get();

  assert.equal(value.server.port, 5050);
  assert.equal(typeof value.server.port, 'number');
  assert.ok(Object.isFrozen(value));
  assert.ok(Object.isFrozen(value.server));
  assert.ok(Object.isFrozen(value.db));
  assert.ok(Object.isFrozen(value.llm));
  assert.throws(() => {
    value.server.port = 1234;
  }, TypeError);
});
