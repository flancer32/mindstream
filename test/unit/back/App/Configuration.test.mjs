import assert from 'node:assert/strict';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

const createReader = (namespaces = {}) => ({
  get(namespace) {
    return { ...(namespaces[namespace] ?? {}) };
  },
});

test('Mindstream_Back_App_Configuration normalizes @teqfw/cfg namespace projections', async () => {
  const container = await createTestContainer();
  container.register('TeqFw_Cfg_Reader$', createReader({
    TEQFW_WEB: { PORT: '8081', TYPE: 'http2' },
    MINDSTREAM: {
      DB_CLIENT: 'pg', DB_HOST: 'db.local', DB_PORT: '5432', DB_DATABASE: 'mindstream', DB_USER: 'app', DB_PASSWORD: 'secret',
      LLM_API_KEY: 'key', LLM_BASE_URL: 'https://example.test/v1', LLM_GENERATION_MODEL: 'gen-x', LLM_EMBEDDING_MODEL: 'embed-x',
    },
  }));
  const config = await container.get('Mindstream_Back_App_Configuration$');

  await config.init();
  const value = config.get();

  assert.deepEqual(value, {
    server: { port: 8081, type: 'http2' },
    db: { client: 'pg', host: 'db.local', port: 5432, database: 'mindstream', user: 'app', password: 'secret' },
    llm: { apiKey: 'key', baseUrl: 'https://example.test/v1', generationModel: 'gen-x', embeddingModel: 'embed-x' },
  });
  assert.ok(Object.isFrozen(value));
  assert.ok(Object.isFrozen(value.server));
});

test('Mindstream_Back_App_Configuration exposes the fixed structure for absent namespaces', async () => {
  const container = await createTestContainer();
  container.register('TeqFw_Cfg_Reader$', createReader());
  const config = await container.get('Mindstream_Back_App_Configuration$');

  assert.throws(() => config.get(), /not initialized/);
  await config.init();
  assert.deepEqual(config.get(), {
    server: { port: undefined, type: undefined },
    db: { client: undefined, host: undefined, port: undefined, database: undefined, user: undefined, password: undefined },
    llm: { apiKey: undefined, baseUrl: undefined, generationModel: undefined, embeddingModel: undefined },
  });
});
