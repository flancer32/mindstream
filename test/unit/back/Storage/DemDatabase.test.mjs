import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { createTestContainer } from '../../di-node.mjs';

const setup = async function ({ initializationError } = {}) {
  const container = await createTestContainer();
  const projectRoot = path.resolve(import.meta.dirname, '../../../../');
  container.addNamespaceRoot('TeqFw_Dem_', path.join(projectRoot, 'node_modules/@teqfw/dem/src'), '.mjs');
  container.addNamespaceRoot('TeqFw_Dem_RDb_', path.join(projectRoot, 'node_modules/@teqfw/dem-rdb/src'), '.mjs');

  const calls = [];
  const compilation = { model: { entities: {} }, fingerprint: 'fingerprint' };
  const backend = {
    async initialize(params) {
      calls.push({ action: 'history', params });
      if (initializationError) throw initializationError;
      return { created: true };
    },
    async close() { calls.push({ action: 'backend-close' }); },
  };
  container.register('TeqFw_Dem_Acquire$', {
    async exec(params) { calls.push({ action: 'acquire', params }); return { schemas: [] }; },
  });
  container.register('TeqFw_Dem_Registry$', {
    register(definitions) { calls.push({ action: 'register-type', definitions }); },
    finalize() { calls.push({ action: 'finalize-registry' }); },
  });
  container.register('TeqFw_Dem_RDb_Type_Vector_Provider$', {
    getDefinitions() { calls.push({ action: 'get-type' }); return [{ name: 'teqfw.dem_rdb.vector' }]; },
  });
  container.register('TeqFw_Dem_Compile$', {
    async exec(input) { calls.push({ action: 'compile', input }); return compilation; },
    assertResult({ value }) { assert.equal(value, compilation); },
  });
  container.register('TeqFw_Dem_Repository_Runtime$', {
    bind(params) { calls.push({ action: 'bind-runtime', params }); return { model: params.model }; },
  });
  container.register('TeqFw_Dem_RDb_Type_Vector_Handler$', { name: 'teqfw.dem_rdb.vector' });
  container.register('TeqFw_Dem_RDb_Config$', {
    get() { calls.push({ action: 'read-config' }); return { client: 'pg' }; },
  });
  container.register('TeqFw_Dem_RDb_Connection$', {
    async init(config) { calls.push({ action: 'connect', config }); },
    getClient() { return {}; },
    async disconnect() { calls.push({ action: 'disconnect' }); },
  });
  container.register('TeqFw_Dem_RDb_Adapter$', {
    async open(params) { calls.push({ action: 'open-backend', params }); return backend; },
  });
  container.register('Mindstream_Back_Logger$', { error() {} });

  return { calls, compilation, backend, storage: await container.get('Mindstream_Back_Storage_DemDatabase$') };
};

test('DemDatabase registers, compiles, binds and initializes storage in dependency order', async () => {
  const { calls, compilation, backend, storage } = await setup();
  const result = await storage.initialize({ hostRoot: '/app', scope: 'mindstream' });

  assert.deepEqual(calls.map(({ action }) => action), [
    'get-type', 'register-type', 'finalize-registry', 'acquire', 'compile', 'bind-runtime',
    'read-config', 'connect', 'open-backend', 'history',
  ]);
  assert.equal(result.backend, backend);
  assert.equal(result.compilation, compilation);
  assert.equal(storage.getBackend(), backend);
  assert.deepEqual(calls.find(({ action }) => action === 'history').params, {
    scope: 'mindstream', compilation,
  });
  await storage.close();
  assert.deepEqual(calls.slice(-2).map(({ action }) => action), ['backend-close', 'disconnect']);
  await assert.rejects(storage.initialize({ hostRoot: '/app', scope: 'mindstream' }), /cannot initialize/);
});

test('DemDatabase closes partial initialization and preserves the initialization error', async () => {
  const failure = new Error('incompatible target');
  const { calls, storage } = await setup({ initializationError: failure });
  await assert.rejects(storage.initialize({ hostRoot: '/app', scope: 'mindstream' }), (error) => error === failure);
  assert.deepEqual(calls.slice(-3).map(({ action }) => action), ['history', 'backend-close', 'disconnect']);
  assert.throws(() => storage.getBackend(), /not initialized/);
});
